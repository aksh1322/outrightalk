import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';


interface roomDetailsModalProps {
    onClose: (success: any) => void;
    shouldShow: boolean;
    roomId: number;
}

export default function RoomDetailsModal({ onClose, shouldShow, roomId }: roomDetailsModalProps) {

    const groupCategoryApi = useGroupCategoryApi();
    const [roomDetails, setRoomDetails] = useState<any>()

    const getRoomDetails = () => {
        const params = {
            room_id: roomId
        };
        groupCategoryApi.callGetRoomDetails(params, (message: string, resp: any) => {
             
            if (resp) {
                setRoomDetails(resp)
            }
        }, (message: string) => {
        })
    }

    useEffect(() => {
        getRoomDetails()
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
                contentClassName='custom-modal room_details_section'
            >
                <Modal.Header>
                    <div className="modal-logo d-flex justify-content-center w-100">
                        <h2>Room Details</h2>
                        <button type="button" className="close" onClick={onClose}>
                            <i className="modal-close"></i>
                        </button>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="profile-wrap">
                                <div className="pro-img-wrap">
                                    <div className="pro-img">
                                        <span className="sub-menu-avatar">
                                            {
                                                roomDetails && roomDetails.room && roomDetails.room.room_picture && roomDetails.room.room_picture.thumb ?
                                                    <img src={roomDetails.room.room_picture.thumb} alt={roomDetails.room.room_name} /> :
                                                    <img src='/img/room-img.jpg' alt="room_pic" />
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div className="about-profile">
                                    <h2>
                                        {
                                            roomDetails && roomDetails.room ? roomDetails.room.room_name : '--'
                                        }
                                    </h2>
                                    <p>
                                        {
                                            roomDetails && roomDetails.room ? roomDetails.room.type : '--'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-12">
                            <div className="account-data">
                                <h2>Room Information</h2>
                                <div className="row">
                                    <div className="col-sm-4">
                                        <div className="form-group">
                                            <label>Owner</label>
                                            <div className="account-data-value">
                                                {
                                                    roomDetails && roomDetails.hasOwnProperty('room_owner') ?
                                                        roomDetails && roomDetails.room_owner && roomDetails.room_owner.details && roomDetails.room_owner.customize_nickname ? roomDetails.room_owner.customize_nickname.nickname : roomDetails.room_owner.details.username
                                                        : '--'
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-sm-4">
                                        <div className="form-group">
                                            <label>Members</label>
                                            <div className="account-data-value">
                                                {
                                                    roomDetails && roomDetails.room ? roomDetails.room.total_user : 0
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    {
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Cams On</label>
                                                <div className="account-data-value">
                                                    {
                                                        roomDetails && roomDetails.room ? roomDetails.room.total_camera_on : 0
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    }

                                    {
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Likes</label>
                                                <div className="account-data-value">
                                                    {
                                                        roomDetails && roomDetails.room ? roomDetails.room.total_like : 0
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    }

                                    {
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Type</label>
                                                <div className="account-data-value">
                                                    {
                                                        roomDetails && roomDetails.room && roomDetails.room.room_type_id === 2 ? 'Private' : 'Public'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment >
    )

}
