// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
// import useMediaRecorder from '@wmik/use-media-recorder';
import { useVideoMessageApi } from 'src/_common/hooks/actions/videoMessage/appVideoMessageApiHook';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import { useAppVideoMessageAction } from 'src/_common/hooks/actions/videoMessage/appVideoMessageActionHook';
import { useAppVideoVoiceMessageShareIds, useAppVideoVoiceMessageShareDateTime, useAppReplyMessageSelector } from 'src/_common/hooks/selectors/videoMessageSelector';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { detectVideoDevice } from 'src/_config';
import IconButton from "@material-ui/core/IconButton";
import StopIcon from "@material-ui/icons/Stop";
import ReplayIcon from "@material-ui/icons/Replay";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import { makeStyles } from "@material-ui/core/styles";
import useMediaRecorder from 'src/components/useMediaHook';
const useStyles = makeStyles(theme => ({
    icon: {
        height: 38,
        width: 38
    },
    reactmic: {
        width: "100%",
        height: 200
    },
    wavesurfer: {
        width: "100%",
    },
    flex: {
        flex: 1
    }
}));


interface SendVideoMessageModalProps {
    shouldShow: boolean;
}

function Player({ srcBlob, audio }: any) {
    if (!srcBlob) {
        return null;
    }

    if (audio) {
        return <audio src={URL.createObjectURL(srcBlob)} controls />;
    }

    return (
        <React.Fragment>
            <div className="video-message-panel">
                <video
                    src={URL.createObjectURL(srcBlob)}
                    width={740}
                    height={567}
                    controls
                    controlsList="nofullscreen nodownload"
                    preload="none"
                    muted
                    disablePictureInPicture
                    autoPlay
                />
            </div>
        </React.Fragment>

    );
}

function LiveStreamPreview({ stream }) {
    let videoPreviewRef = React.useRef();

    React.useEffect(() => {
        if (videoPreviewRef.current && stream) {
            videoPreviewRef.current.srcObject = stream;
        }
    }, [stream]);

    if (!stream) {
        return null;
    }

    return <video ref={videoPreviewRef} width={740} height={567} autoPlay />;
}
interface sendVideoMessageFormValues {
    title: string;
    file: any;
}

const sendVideoMessageSchema = yup.object().shape({
    title: yup.string().required('Title is required'),
    file: yup
        .mixed(),
})

export default function SendVideoMessageModal({ shouldShow }: SendVideoMessageModalProps) {

    const videoVoiceMessageApi = useVideoMessageApi()
    const videoMessageAction = useAppVideoMessageAction()
    const videoMessageShareIdsSelector = useAppVideoVoiceMessageShareIds()
    const shareDateTimeSelector = useAppVideoVoiceMessageShareDateTime()
    const replyMessagePropertySelector = useAppReplyMessageSelector()
    const [startRecord, setStartRecord] = useState<boolean>(false)
    const [videoDeviceAvailable, setVideoDeviceAvailable] = useState<boolean>(false)

    const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<sendVideoMessageFormValues>({
        // mode: 'onBlur',
        resolver: yupResolver(sendVideoMessageSchema),
        defaultValues: {
            title: replyMessagePropertySelector.title,
            file: ''
        },
    })

    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
   
    let {
        error,
        status,
        mediaBlob,
        stopRecording,
        pauseRecording,
        resumeRecording,
        getMediaStream,
        liveStream,
        startRecording,
        onReset,
        muteAudio,
        unMuteAudio,
        clearMediaStream
    } = useMediaRecorder({
        recordScreen: false,
        blobOptions: { type: 'video/webm' },
        mediaStreamConstraints: { audio: true, video: true }
    });

    function toggleTimer() {
        setIsActive(!isActive);
    }

    function resetTimer() {
        setSeconds(0);
        setIsActive(false);
    }

    const onSubmit = (values: sendVideoMessageFormValues) => {
        let fd = new FormData();
        let file = new File([mediaBlob], values.title)
        const params = {
            type: 'video',
            posted_date: shareDateTimeSelector && shareDateTimeSelector.date ? shareDateTimeSelector.date : '',
            posted_time: shareDateTimeSelector && shareDateTimeSelector.time ? shareDateTimeSelector.time : '',
            to_user: videoMessageShareIdsSelector,
            title: values.title,
            send_file: file
        }

        for (const [key, value] of Object.entries(params)) {
            if (key == 'to_user') {
                value.map(user => fd.append('to_user[]', user))
            } else {
                fd.append(key, value)
            }
        }

        videoVoiceMessageApi.callSendMessage(fd, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
                handleCloseModal()
            }
        }, (message: string) => {
            toast.error(message)
        })
    }




    // const convertBlobToBase64 = blob => new Promise((resolve, reject) => {
    //     const reader = new FileReader;

    //     if (blob && blob.type) {
    //         reader.onerror = reject;
    //         reader.onload = () => {
    //             resolve(reader.result);
    //         };
    //         reader.readAsDataURL(blob);
    //     }

    // });


    const handleCloseModal = () => {
        videoMessageAction.showVideoMessageModal(false, [], '', '', '', false)
    }

    const handleResetRecord = (e: React.MouseEvent) => {
        e.preventDefault()
        onReset()

    }

    const start = (e: any) => {
        e.preventDefault()
        setStartRecord(true)
        startRecording()
        // toggleTimer()
    }

    const stop = () => {
        setStartRecord(!startRecord)
        stopRecording()
        // resetTimer()
    }

    const pause = () => {
        pauseRecording()
        // toggleTimer()
    }

    const resume = () => {
        resumeRecording()
        // toggleTimer()
    }

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    // useEffect(() => {
    // return () => {
    //     if (status === 'recording' || status === 'pause') {
    //         stop()
    //     }
    // }
    // }, [])
    // async function getMediaStreamCustom() {
    //     console.log('acquiring_media');
    //      try {
    //        let stream;
    //          stream = await window.navigator.mediaDevices.getUserMedia(
    //              { audio: true, video: true }
    //          );
    //       console.log('ready');
    //      } catch (err) {          
    //       console.log('failed');
    //      }
    //    }

    useEffect(() => {



        //  getMediaStreamCustom();

    }, [])

    const classes = useStyles();
    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                keyboard={false}
                className="sendvideomodal send-video-message theme-custom-modal"
                size='lg'
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <h5 className="modal-title mt-0">
                        Send Video Message
                    </h5>
                    <button type="button" className="close" onClick={() => handleCloseModal()}>
                        <i className="modal-close" />
                    </button>
                </Modal.Header>
                <Modal.Body bsPrefix={'video-msg'}>
                    <div className="modal-body pl-0 pr-0">
                        <div className="manage-video-message-panel">


                            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                <div className="form-group">
                                    <Controller
                                        control={control}
                                        name="title"
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <FormTextInput
                                                // name={name}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                inputRef={ref}
                                                type="text"
                                                error={errors.title}
                                                disabled={replyMessagePropertySelector.disable}
                                                placeholder="Enter a Title"
                                            />
                                        )}
                                    />
                                </div>

                                {/* {seconds}s */}

                                <LiveStreamPreview stream={liveStream} />
                                {
                                    status === 'idle' || status === 'acquiring_media' || status === 'ready' || status === 'failed' ?
                                        <div className="video-message-panel">
                                            {/* <button 
                                                    className="video-start-btn-big-round"
                                                     type="button"
                                                     onClick={start}
                                                    >
                                                        Start <i class="fa fa-play fa-2x"></i>
                                                    </button> */}
                                            <a href="#" onClick={(e) => start(e)} className="video-start-btn-big-round"><i className="fa fa-play fa-2x"></i></a>
                                        </div> : null
                                }

                                {liveStream ? null : <Player srcBlob={mediaBlob} />}

                                <div className="form-group">
                                    {
                                        !startRecord && status !== 'idle' && (
                                            // <button
                                            //     className="btn theme-btn waves-effect"
                                            //     type="button"
                                            //     onClick={start}
                                            // >
                                            //     <i className="fa fa-play fa-2x"></i>
                                            // </button>
                                            <IconButton onClick={start}>
                                                <PlayArrowIcon className={classes.icon} />
                                            </IconButton>
                                        )}

                                    {
                                        (status === 'recording' || status === 'paused') && (
                                            // <button
                                            //     type="button"
                                            //     className="btn theme-btn btn-danger waves-effect"
                                            //     onClick={stop}>
                                            //     Stop recording
                                            // </button>
                                            <IconButton onClick={stop}>
                                                <StopIcon className={classes.icon} />
                                            </IconButton>
                                        )
                                    }

                                    {status === 'recording' && (
                                        // <button
                                        //     type="button"
                                        //     className="btn theme-btn btn-success waves-effect"
                                        //     onClick={pause}>
                                        //     Pause recording
                                        // </button>
                                        <IconButton onClick={pause}>
                                            <PauseIcon className={classes.icon} />
                                        </IconButton>
                                    )}
                                    {status === 'paused' && (
                                        // <button
                                        //     type="button"
                                        //     className="btn theme-btn btn-primary waves-effect"
                                        //     onClick={resume}>
                                        //     Resume recording
                                        // </button>
                                        <IconButton onClick={resume}>
                                            <ReplayIcon className={classes.icon} />
                                        </IconButton>
                                    )}
                                </div>

                                <div className="message-modal-btns d-flex justify-content-between">
                                    {mediaBlob && status == 'stopped' ? <a href="#" className="btn theme-btn btn-danger waves-effect" onClick={(e) => handleResetRecord(e)}>Reset</a> : null}
                                    <div className="d-flex">
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleCloseModal() }} className="btn theme-btn btn-default mr-2 waves-effect">Cancel</a>
                                        <button type="submit" className="btn theme-btn btn-primary waves-effect">Send</button>
                                    </div>
                                </div>

                            </form>

                        </div>
                    </div>

                </Modal.Body>
            </Modal>
        </React.Fragment>
    )
}