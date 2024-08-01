import React, { useState, useEffect } from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal, Form } from 'react-bootstrap';
import SweetAlert from 'react-bootstrap-sweetalert';
import { toast } from 'react-toastify';
import { useAppUserPreferencesSelector } from 'src/_common/hooks/selectors/userPreferenceSelector';
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';


interface AlertSoundModalProps {
    applySetting: (isApply: boolean) => void
    onClose: (success: any) => void;
    shouldShow: boolean;
    type: string;
    selectedPreference: any[];
}

interface AlertSoundModalFormValues {
    sound: any;
    sound_hidden: string;
}

const AlertSoundModalFormSchema = yup.object().shape({
    sound: yup
        .mixed(),
    sound_hidden: yup
        .string()
        .required("Image is required")
})

export default function AlertSoundModal({ onClose, shouldShow, type, selectedPreference, applySetting }: AlertSoundModalProps) {

    const userPreferenceApi = useUserPreferenceApi()
    const preferenceSelector = useAppUserPreferencesSelector()
    const [customizedSoundList, setCustomizedSoundList] = useState<any[]>([])
    const [selectSound, setSelectSound] = useState<number>(0)
    const [isDefaultSound, setIsDefaultSound] = useState<boolean>(true)
    const [isPlay, setisPlay] = useState<boolean>(false)
    const [soundSource, setSoundSource] = useState<any>()
    const [currentFile, setCurrentFile] = useState<any>()

    const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<AlertSoundModalFormValues>({
        resolver: yupResolver(AlertSoundModalFormSchema),
        defaultValues: {
            sound: '',
            sound_hidden: ''
        },
    })

    const audio = document.querySelector("audio")
    audio?.addEventListener('ended', (event) => {
        setisPlay(false)
    })

    audio?.addEventListener('playing', (event) => {
        setisPlay(true)
    })

    audio?.addEventListener('pause', (event) => {
        setisPlay(false)
    })

    const getAllCustomizedSoundList = () => {
        userPreferenceApi.callGetAllCustomizedSound((message: string, resp: any) => {
            if (resp) {
                setCustomizedSoundList(resp.list.length ? resp.list : [])
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    // console.log(customizedSoundList)

    const handleFileUpload = () => {
        let fd = new FormData();
        const params = {
            sound: getValues('sound')[0]
        }

        for (const [key, value] of Object.entries(params)) {
            fd.append(key, value)
        }
        userPreferenceApi.callUploadCustomizedSound(fd, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
                getAllCustomizedSoundList()
            }
        }, (message: string) => {
            toast.error(message)
        })

    }

    const handleSelectSound = (e: React.MouseEvent, soundId: number, isDefault: number, soundUrl: string) => {
        e.preventDefault()
        setSelectSound(soundId)
        setSoundSource(soundUrl)
        setisPlay(false)

        if (isDefault === 1) {
            setIsDefaultSound(true)
        } else {
            setIsDefaultSound(false)
        }
    }

    const applySound = (type: string, fileId: number) => {

        let params = {}

        switch (type) {
            case 'customize_sound_incoming_pm_file_id':
                params = {
                    ...params,
                    customize_sound_incoming_pm: 1,
                    customize_sound_incoming_pm_file_id: fileId
                }
                break;
            case 'customize_sound_incoming_call_file_id':
                params = {
                    ...params,
                    customize_sound_incoming_call: 1,
                    customize_sound_incoming_call_file_id: fileId
                }
                break;
            case 'customize_sound_contact_online_file_id':
                params = {
                    ...params,
                    customize_sound_contact_online: 1,
                    customize_sound_contact_online_file_id: fileId
                }
                break;
            case 'customize_sound_contact_offline_file_id':
                params = {
                    ...params,
                    customize_sound_contact_offline: 1,
                    customize_sound_contact_offline_file_id: fileId
                }
                break;
            case 'customize_sound_receive_invitations_file_id':
                params = {
                    ...params,
                    customize_sound_receive_invitations: 1,
                    customize_sound_receive_invitations_file_id: fileId
                }
                break;
        }

        userPreferenceApi.callSaveUserPreference(params, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
                onClose(true)
                applySetting(true)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleApplySound = () => {
        if (selectSound) {
            applySound(type, selectSound)
        } else {
            toast.error("No sound selected")
        }
    }

    const handleClose = () => {
        onClose(true)
        applySetting(false)
    }

    const handleDeleteSound = () => {

        if (!isDefaultSound) {
            const params = {
                record_id: selectSound
            }

            userPreferenceApi.callDeleteCustomizedSound(params, (message: string, resp: any) => {
                if (resp) {
                    toast.success(message)
                    getAllCustomizedSoundList()
                }
            }, (message: string) => {
                toast.error(message)
            })
        } else {
            toast.error("Default Sound delete not allow")
        }


    }

    const getCurrentUploadedFile = () => {

        let selectedSettingFile = selectedPreference.filter((element: any) => {
            return element.key === type
        })

        if (selectedSettingFile && selectedSettingFile.length) {
            let customizedSelectedFile = customizedSoundList.filter((element: any) => {
                return element.id == selectedSettingFile[0].val
            })

            if (customizedSelectedFile && customizedSelectedFile.length) {
                setCurrentFile(customizedSelectedFile && customizedSelectedFile[0].customize_sound ? customizedSelectedFile[0].customize_sound.file_name_original : null)
            }
        } else {
            setCurrentFile(null)
        }
    }

    const handlePlayAudio = () => {
        const audio = document.querySelector("audio")

        if (audio) {
            audio?.play()
            // setisPlay(true)
        }
    }

    const handleStopAudio = () => {
        const audio = document.querySelector("audio")
        if (audio) {
            audio.pause()
            audio.currentTime = 0;
            // setisPlay(false)
        }
    }

    useEffect(() => {
        getAllCustomizedSoundList()
    }, [])

    useEffect(() => {
        if (customizedSoundList && customizedSoundList.length) {
            getCurrentUploadedFile()
        }
    }, [customizedSoundList])
    
    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                onHide={() => onClose(false)}
                keyboard={false}
                className="theme-custom-modal"
                dialogClassName="modal-dialog-scrollable"
                size={'lg'}
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <h2>....</h2>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleClose}>
                        <i className="modal-close" />
                    </button>
                </Modal.Header>

                <Modal.Body bsPrefix={'alert-sound'} className="modal-body pl-0 pr-0">
                    <div className="manage-video-message-panel sound_system">
                        <div className="row">
                            <div className="col-sm-6 so_li">
                                <label>Sounds</label>
                                <ul>
                                    {
                                        customizedSoundList && customizedSoundList.length ? customizedSoundList.map((x: any, index: number) => (
                                            <li key={index} className={selectSound === x.id ? 'active' : ''}>
                                                <a href="#"
                                                    className={x.customize_sound.file_name_original === currentFile && selectSound == 0 ? 'selected' :''}
                                                    onClick={(e) => handleSelectSound(e, x.id, x.is_default, x.sound.thumb)}>
                                                    {x.customize_sound && x.customize_sound.file_name_original ? x.customize_sound.file_name_original : '--'}
                                                </a>
                                            </li>
                                        )) :
                                            <li>
                                                <p>No file avilable!</p>
                                            </li>
                                    }
                                </ul>

                                {/* <ul><li className="active"><a href="#">Sound-1-just-like-magic.mp3</a>
                                        <i className="bx bx-play-circle"></i> 
                                        <i className="bx bx-pause-circle"></i>
                                        <i className="bx bx-trash"></i>
                                    </li>
                                    <li><a href="#">Sound-2-long-expected.mp3</a></li>
                                    <li><a href="#">Sound-3-system-fault.mp3</a></li>
                                    <li><a href="#">Sound-4-hollow.mp3</a></li>
                                </ul>  */}



                            </div>
                            <div className="col-sm-6">
                                <label>Current Sound</label>
                                <p>
                                    {currentFile ? currentFile : 'No file uploaded'}
                                </p>
                                <div className="cur_btn row"> 
                                    <div className="form-group btn theme-btn btn-primary mr-2 waves-effect input_f col-4 text-center">
                                        <span style={{color:'#ffff'}}>Upload</span>
                                        <input type="hidden" name="sound_hidden" placeholder="hidden field" ref={register} />
                                        <input className="" type="file"
                                            name="sound"
                                            placeholder="Select File"
                                            capture
                                            accept="audio/*"
                                            onChange={handleFileUpload}
                                            ref={register}
                                        />
                                    </div>
                                    {/* <div className="form-group input_f col-4 text-center">
                                        <span>Browse</span>
                                        <input className="" type="file"
                                            name="browse"
                                            placeholder="Select File"
                                            capture
                                            accept="audio/*"
                                        // ref={register}
                                        />
                                    </div> */}



                                    <div className="form-group col-4 text-center">
                                        <button type="button"
                                            className="btn theme-btn btn-primary mr-2 waves-effect"
                                            disabled={isDefaultSound ? true : false}
                                            onClick={handleDeleteSound}
                                        >
                                            Delete
                                        </button>
                                    </div>


                                </div>


                            </div>
                            <div className="col-10">
                                <div id="audio-player-container">
                                    <audio
                                        id="audio"
                                        controls
                                        src={soundSource}>
                                        Your browser does not support the
                                        <code>audio</code> element.
                                    </audio>
                                </div>
                            </div>
                            <div className="col-2">
                                <div className="out_play">
                                    <div className="form-group text-center">
                                        <button type="button"
                                            className="btn theme-btn btn-primary mr-2 waves-effect bt-gr"
                                            onClick={handlePlayAudio}
                                            disabled={!soundSource ? true : isPlay}
                                        >
                                            <i className="bx bx-play-circle"></i>
                                        </button>
                                    </div>

                                    <div className="form-group text-center">
                                        <button type="button"
                                            className="btn theme-btn btn-primary mr-2 waves-effect bt-red"
                                            onClick={handleStopAudio}
                                            disabled={!isPlay}
                                        >
                                            <i className="bx bx-pause-circle"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>


                            <div className="col-12 mb-2">

                                <p className="mt-4">
                                    Press Browse button to locate and upload your own audio file from the audio repository where it is stored in your computer.
                                </p>
                                <p>
                                    Note: The duration of new customized sound should not exceed 5 seconds.
                                </p>
                            </div>


                        </div>
                        <div className="row inner_btn">
                            <div className="col-6 text-left"> <div className="form-group mb-0">
                                <button type="button"
                                    className="btn theme-btn btn-primary mr-2 waves-effect"
                                    onClick={handleClose}
                                >
                                    Cancel
                                </button>
                            </div></div>
                            <div className="col-6 text-right"> <div className="form-group mb-0">
                                <button type="button"
                                    className="btn theme-btn btn-primary mr-2 waves-effect"
                                    onClick={handleApplySound}
                                >
                                    Apply
                                </button>
                            </div></div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    )

}
