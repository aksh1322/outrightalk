import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import RadioInput from '../../../../_common/components/form-elements/radioinput/radioInput'

interface CreateRoomOneModalProps {
    onClose: (success: any) => void;
    onConfirm?: (success: any, isCheck: boolean | any) => void;
    shouldShow: boolean;
    isCheck?: boolean | null;
}

export default function CreateRoomOneModal({ onClose, shouldShow, onConfirm, isCheck }: CreateRoomOneModalProps) {

    const confirmNext = () => {
        // if (isCheck) {
        //     onConfirm(0, false)
        // } else {
        //     onConfirm(1, true)
        // }
        // onClose(true)
    }

    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                onHide={() => onClose(false)}
                keyboard={false}
                className="room show-create-room-one theme-custom-modal"
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <h2>Create a Room</h2>
                </Modal.Header>
                <Modal.Body bsPrefix={'create-room'}>
                    <div className="manage-video-message-panel">
                        <div className="two-checkbox-wrap">
                            <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 d-inline-block ml-0 pl-0">
                                <img src="/img/public-icon.png" alt="public" />
                                <input type="checkbox" className="custom-control-input" id="customCheck-outlinecolor2" defaultChecked />
                                <label className="custom-control-label" htmlFor="customCheck-outlinecolor2">Public</label>
                            </div>
                            <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 d-inline-block ">
                                <img src="/img/lock-icon.png" alt="lock" />
                                <input type="checkbox" className="custom-control-input" id="customCheck-outlinecolor3" />
                                <label className="custom-control-label" htmlFor="customCheck-outlinecolor3">Private</label>
                            </div>
                        </div>
                        <div className="info-check-wrap">
                            <p>*<strong>Public Rooms</strong> are moderated and permanent. Maximum capacity 250 users.</p>
                            <p>**<strong>Private Rooms</strong> are not moderated and not permanent. Maximum 15 users. By invitation only.</p>
                        </div>
                        <div className="d-flex">
                            <a href="#" className="btn theme-btn btn-primary mr-2 waves-effect" data-toggle="modal" data-target=".create-room02" data-dismiss="modal">Next</a>
                            <a href="#" className="btn theme-btn btn-danger waves-effect" data-dismiss="modal" aria-label="Close" onClick={(e) => onClose(true)}>Cancel</a>
                        </div>
                    </div>

                </Modal.Body>
            </Modal>
        </React.Fragment>
    )
}
