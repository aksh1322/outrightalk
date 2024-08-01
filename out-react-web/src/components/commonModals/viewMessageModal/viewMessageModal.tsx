import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router'
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';

interface ViewMessageProps {
    onClose: (success: any) => void;
    shouldShow: boolean;
    message: any;
    type?: string;
}

export default function ViewMessageModal({ onClose, shouldShow, message, type }: ViewMessageProps) {

    useEffect(() => {

    }, [])

    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                // onHide={() => onClose()}
                keyboard={false}
                className="sendvoicemail send-video-message theme-custom-modal"
                size="lg"
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <h5 className="modal-title mt-0">
                        View Message
                    </h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => onClose(true)}>
                        <i className="modal-close" />
                    </button>
                </Modal.Header>
                <Modal.Body bsPrefix={'sendvoice-mail'}>
                    <div className="modal-body pl-0 pr-0">
                        <div className="manage-video-message-panel">

                            {
                                type === 'video' ?
                                    <video controls disablePictureInPicture controlsList="nofullscreen nodownload" muted width="740" height='567' preload="none">
                                        <source src={message && message.message_file && message.message_file.thumb}
                                            type='video/mp4'></source>
                                    </video>
                                    :
                                    <div id="audio-player-container" style={{ textAlign: 'center' }}>
                                        <audio
                                            id="player"
                                            controls
                                            src={message && message.message_file && message.message_file.thumb}>
                                            Your browser does not support the
                                            <code>audio</code> element.
                                        </audio>

                                    </div>

                            }

                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    )

}