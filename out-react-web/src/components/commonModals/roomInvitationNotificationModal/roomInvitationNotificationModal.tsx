import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'

interface RoomInvitationNotificationModalProps {
    shouldShow: boolean;
    onClose: (success: any) => void;
}


export default function RoomInvitationNotificationModal({ shouldShow, onClose }: RoomInvitationNotificationModalProps) {

    const acceptInvitation = () => {
 
    }

    const rejectInvitation = () => {

    }

    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                onHide={rejectInvitation}
                keyboard={false}
                className="groupCategory accept-room-invitation theme-custom-modal"
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <div className="modal-logo d-flex justify-content-center w-100">
                        <img src="/img/logo.png" />
                    </div>
                </Modal.Header>
                <Modal.Body bsPrefix={'sendvoice-mail'}>
                    <div className="modal-body pl-0 pr-0">
                        <div className="manage-video-message-panel">
                            <h3>
                                {
                                    "Invited you to this room"
                                }
                                <strong>Do you want to join?</strong></h3>
                            <div className="d-flex">
                                <button className="btn theme-btn btn-primary mr-2 waves-effect" onClick={acceptInvitation}>Accept</button>
                                <button className="btn theme-btn btn-default waves-effect" onClick={rejectInvitation}>Reject</button>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    )
}