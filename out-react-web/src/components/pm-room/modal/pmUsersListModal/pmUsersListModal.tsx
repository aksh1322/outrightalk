import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import ViewProfileModal from 'src/components/commonModals/viewProfileModal/viewProfileModal';

interface PmUsersListModalProps {
    onClose: (success: any) => void;
    shouldShow: boolean;
    users: any[];
}

export default function PmUsersListModal({ onClose, shouldShow, users }: PmUsersListModalProps) {

    const [showViewProfileModal, setShowViewProfileModal] = useState<boolean>(false)
    const [selectedUserId, setSelectedUserId] = useState<any>()

    const uniqueUsers: any[] = users.filter((v: any, i: any, a: any) => a.findIndex((t: any) => (t.user_id === v.user_id)) === i)

    const openViewProfileModal = (e: React.MouseEvent, id: number) => {
        e.preventDefault()
        setSelectedUserId(id)
        setShowViewProfileModal(true)
    }

    const closeViewProfileModal = () => {
        setSelectedUserId(null)
        if (showViewProfileModal) setShowViewProfileModal(false)
    }


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
                        <h2>PM Users</h2>
                        <button type="button" className="close" onClick={onClose}>
                            <i className="modal-close"></i>
                        </button>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <ul className="list-group">
                            {
                                uniqueUsers && uniqueUsers.length ? uniqueUsers.map((user: any, index: number) => (
                                    <li className="list-group-item" key={user.user_id}>
                                        <a href="#" onClick={(e) => openViewProfileModal(e, user.user_id)}>
                                            {
                                                user && user.user_info && user.user_info.customize_nickname ?
                                                    user.user_info.customize_nickname.nickname : user.user_info.username
                                            }
                                        </a>
                                    </li>
                                )) :
                                    <div className="no-pm-users-container">
                                        <p className="no-pm-users-text">
                                            No users found
                                        </p>
                                    </div>
                            }
                        </ul>

                    </div>
                </Modal.Body>
            </Modal>

            {
                showViewProfileModal ?
                    <ViewProfileModal
                        onClose={closeViewProfileModal}
                        addToContactList={() => { }}
                        shouldShow={showViewProfileModal}
                        isAddedToContactList={true}
                        userId={selectedUserId}
                    /> : null
            }
        </React.Fragment>
    )
}