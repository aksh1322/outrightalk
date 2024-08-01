// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react'
import { Modal } from 'react-bootstrap'
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import { useVideoMessageApi } from 'src/_common/hooks/actions/videoMessage/appVideoMessageApiHook';
import { useAppVideoMessageAction } from 'src/_common/hooks/actions/videoMessage/appVideoMessageActionHook';
import { useAppVideoVoiceMessageShareIds, useAppVideoVoiceMessageShareDateTime, useAppReplyMessageSelector } from 'src/_common/hooks/selectors/videoMessageSelector';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify'
import Microphone from 'src/_common/components/elements/audio/audio'
import { detectAudioDevice } from 'src/_config';

interface SendVoiceMailModalProps {
    shouldShow: boolean;
}
interface sendVoiceMailFormValues {
    title: string;
    file: any;
}

const sendVoiceMailSchema = yup.object().shape({
    title: yup.string().required('Title is required'),
    file: yup
        .mixed(),
})


export default function SendVoiceMailModal({ shouldShow }: SendVoiceMailModalProps) {

    const videoVoiceMessageApi = useVideoMessageApi()
    const voiceMailAction = useAppVideoMessageAction()
    const voiceMailShareIdsSelector = useAppVideoVoiceMessageShareIds()
    const shareDateTimeSelector = useAppVideoVoiceMessageShareDateTime()
    const replyMessagePropertySelector = useAppReplyMessageSelector()
    const [recordedAudio, setRecordedAudio] = useState<any>()


    const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<sendVoiceMailFormValues>({
        resolver: yupResolver(sendVoiceMailSchema),
        defaultValues: {
            title: replyMessagePropertySelector.title,
            file: ''
        },
    })

    const handleCloseModal = () => {
        voiceMailAction.showVoiceMailModal(false, [], '', '', '', false)
    }

    const pushFile = (file: any) => {
        if (file) {
            setRecordedAudio(file.blob)
        }
        else {
            setRecordedAudio(null)
        }
    };

    const onSubmit = (values: sendVoiceMailFormValues) => {
        let fd = new FormData();
        let file = new File([recordedAudio], values.title)

        const params = {
            type: 'voice',
            posted_date: shareDateTimeSelector && shareDateTimeSelector.date ? shareDateTimeSelector.date : '',
            posted_time: shareDateTimeSelector && shareDateTimeSelector.time ? shareDateTimeSelector.time : '',
            to_user: voiceMailShareIdsSelector,
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






    useEffect(() => {

        // function gotDevices(deviceInfos) {
        //     for (let i = 0; i !== deviceInfos.length; ++i) {
        //         const deviceInfo = deviceInfos[i];
        //         const option = document.createElement('option');
        //         option.value = deviceInfo.deviceId;
        //         if (deviceInfo.kind === 'audioinput') {
        //             console.log('audioinput ==>deviceInfo.label', deviceInfo.label)

        //         } else if (deviceInfo.kind === 'audiooutput') {
        //             console.log('audiooutput==>deviceInfo.label', deviceInfo.label)

        //         } else if (deviceInfo.kind === 'videoinput') {
        //             console.log('videoinput==>deviceInfo.label', deviceInfo.label)
        //         } else {
        //             console.log('Some other kind of source/device: ', deviceInfo);
        //         }
        //     }

        // }
        // function handleError(error) {
        //     console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
        // }
        // navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

        // navigator.permissions.query({ name: 'microphone' })
        //     .then((permissionObj) => {
        //         console.log('microphone permission',permissionObj);
        //         console.log('microphone permission',permissionObj.state);
        //         navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
        //     })
        //     .catch((error) => {
        //         console.log('Got error :', error);
        //     })

        // navigator.permissions.query({ name: 'camera' })
        //     .then((permissionObj) => {
        //         console.log('camera permission',permissionObj.state);
        //     })
        //     .catch((error) => {
        //         console.log('Got error :', error);
        //     })



    }, [])


    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                keyboard={false}
                className="sendvoicemail send-video-message theme-custom-modal"
                size='lg'
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <h5 className="modal-title mt-0">Send Voice Message</h5>
                    <button type="button" className="close" data-dismiss="modal" onClick={handleCloseModal} aria-label="Close">
                        <i className="modal-close" />
                    </button>
                </Modal.Header>
                <Modal.Body bsPrefix={'voice-mail'}>
                    <div className="modal-body pl-0 pr-0">
                        <div className="manage-video-message-panel">

                            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                <div className="form-group">
                                    <Controller
                                        control={control}
                                        name="title"
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <FormTextInput
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                inputRef={ref}
                                                disabled={replyMessagePropertySelector.disable}
                                                type="text"
                                                error={errors.title}
                                                placeholder="Enter a Title"
                                            />
                                        )}
                                    />
                                </div>
                                <Microphone pushFile={pushFile} />
                                <div className="message-modal-btns d-flex justify-content-between">
                                    {/* <a href="#" className="btn theme-btn btn-danger">Delete</a> */}
                                    <div className="d-flex">
                                        <button onClick={handleCloseModal} className="btn theme-btn btn-default mr-2 waves-effect">Cancel</button>
                                        <button disabled={recordedAudio ? false : true} type="submit" className="btn theme-btn btn-primary waves-effect">Send</button>
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