import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
interface PasswordShowAdultRoomModalProps {
    onClose: (success: any) => void;
    onConfirm: (success: any, isCheck: boolean | any) => void;
    shouldShow: boolean;
    isCheck?: boolean | null;
}


export default function PasswordShowAdultRoomModal({ onClose, shouldShow, onConfirm, isCheck }: PasswordShowAdultRoomModalProps) {

    const confirmPassword = () => {
        if (isCheck) {
            onConfirm(0, false)
        } else {
            onConfirm(1, true)
        }
        onClose(true)
    }

    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                onHide={() => onClose(false)}
                keyboard={false}
                className="groupCategory show-adult-rooms theme-custom-modal"
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
                            {/* <h3>{isCheck ? 'Disabling' : 'Enabling'} this option will show rooms, {isCheck ? 'not-allowed' : 'allowed'} for +18 content.  <strong>Are you sure?</strong></h3>*/}
                            <h3> 
                                {
                                    !isCheck ?
                                    "Adult rooms category is disabled by default; such rooms contain foul language and nudity which may be offensive to some users. Keep the +18 Content Category box unchecked if you don’t wish to visit these kinds of rooms. You MUST be over 18 years old to enable this feature and be sure you follow the laws in your country." :
                                    "Disabling this option will show rooms,not-allowed for +18 content.Are you sure?"
                                }
                            </h3>
                            <div className="d-flex">
                                <button className="btn theme-btn btn-primary mr-2 waves-effect" onClick={(e) => confirmPassword()}>Confirm</button>
                                <button className="btn theme-btn btn-default waves-effect" onClick={(e) => onClose(true)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    )
}