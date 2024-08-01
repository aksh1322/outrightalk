import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { usePmWindowApi } from 'src/_common/hooks/actions/pmWindow/appPmWindowApiHook'

interface DigSoundListModalProps {
    onClose: (success: any) => void;
    shouldShow: boolean;
    pmId: number;
}

export default function DigSoundListModal({ onClose, shouldShow, pmId }: DigSoundListModalProps) {

    const pmWindowApi = usePmWindowApi()
    const [soundList, setSoundList] = useState<any[]>([])
    const [selectedSound, setSelectedSound] = useState<any>()
    const [soundSource, setSoundSource] = useState<any>()
    const [isPlay, setisPlay] = useState<boolean>(false)
    const [selectedSoundName, setSelectedSoundName] = useState<any>()

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

    const handleSelectSound = (e: React.MouseEvent, soundId: number, soundUrl: string, soundName: string) => {
        e.preventDefault()
        setSelectedSound(soundId)
        setSoundSource(soundUrl)
        setSelectedSoundName(soundName)
        setisPlay(false)
    }

    const getDigSoundList = () => {
        pmWindowApi.callGetDigSoundList((message: string, resp: any) => {
            if (resp && resp.list && resp.list.length) {
                setSoundList(resp.list)
            } else {
                setSoundList([])
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleSendDigSound = () => {
        const params = {
            pm_id: pmId,
            sound_id: selectedSound
        }
        pmWindowApi.callSendDigSound(params, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
                onClose(true)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    useEffect(() => {
        getDigSoundList()
    }, [])

    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                keyboard={false}
                className="theme-custom-modal"
                size='lg'
                centered
                contentClassName='custom-modal profile_section'
            >
                <Modal.Header>
                    <div className="modal-logo d-flex justify-content-center w-100">
                        <h2>Choose Dig Sound</h2>
                        <button type="button" className="close" onClick={onClose}>
                            <i className="modal-close"></i>
                        </button>
                    </div>
                </Modal.Header>
                <Modal.Body bsPrefix={'dig-sound'} className="modal-body pl-0 pr-0">
                    <div className="manage-video-message-panel sound_system">
                        <div className="row">
                            <div className="col-sm-6">
                                <ul>
                                    {
                                        soundList && soundList.length ? soundList.map((sound: any, index: number) => (
                                            <li className={selectedSound === sound.id ? 'selected' : ''} key={sound.id}>
                                                <a href="#"
                                                    onClick={(e) => handleSelectSound(e, sound.id, sound.sound.thumb, sound.name)}>

                                                    {
                                                        sound.name
                                                    }
                                                </a>
                                            </li>
                                        )) :
                                            <div className="no-dig-sounds-container">
                                                <p className="no-dig-sounds-text">
                                                    No Sounds available
                                                </p>
                                            </div>
                                    }
                                </ul>

                            </div>
                            <div className="col-sm-6">
                                <div className="form-group text-center">
                                    {
                                        !isPlay ?
                                            <button type="button"
                                                className="btn theme-btn btn-primary mr-2 waves-effect bt-gr"
                                                onClick={handlePlayAudio}
                                                disabled={!soundSource ? true : isPlay}
                                            >
                                                <i className="bx bx-play-circle"></i>
                                            </button> :

                                            <button type="button"
                                                className="btn theme-btn btn-primary mr-2 waves-effect bt-red"
                                                onClick={handleStopAudio}
                                                disabled={!isPlay}
                                            >
                                                <i className="bx bx-pause-circle"></i>
                                            </button>

                                    }

                                </div>
                                <div className="form-group text-center">
                                    <p>
                                        {
                                            selectedSoundName
                                        }
                                    </p>
                                </div>
                                <div id="audio-player-container" style={{ opacity: 0 }}>
                                    <audio
                                        id="audio"
                                        controls
                                        src={soundSource}>
                                        Your browser does not support the
                                        <code>audio</code> element.
                                    </audio>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="modal-footer">
                    <div className="d-flex">
                        <a href="#" className="btn theme-btn btn-danger mr-2 waves-effect" data-dismiss="modal" aria-label="Close" onClick={(e) => { e.preventDefault(); onClose(true) }}>Cancel</a>
                        <button type="submit"
                            disabled={!selectedSound || !soundList.length ? true : false}
                            onClick={handleSendDigSound}
                            className="btn theme-btn btn-primary waves-effect">Send</button>
                    </div>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    )


}