import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { useAppGroupCategoryAction } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook';
import { useAppRoomAdminControlSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import BanUserWithAdminActivity from 'src/components/groupsCategory/adminRoomControl/banUserWithAdminActivity';
import AdminMetting from 'src/components/groupsCategory/adminRoomControl/adminMetting';
import { useAppRoomDetailsSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import KickedUsersLists from '../../adminRoomControl/kickedUserLists';
import BannedUsersLists from '../../adminRoomControl/bannedUsersLists';
import EditorInputBasic from 'src/_common/components/form-elements/ckTextEditor/ckEditorInputBasic';

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface RoomAdminControlPanelModalProps {
    shouldShow?: boolean;
}

export default function RoomAdminControlPanelModal({ shouldShow }: RoomAdminControlPanelModalProps) {

    const { register, control, setValue, handleSubmit, errors } = useForm<any>({
        // resolver: yupResolver(AddNoteSchema),
        defaultValues: {
            title: '',
            description: ''
        },
    })

    const groupCategoryApi = useGroupCategoryApi()
    const groupCategoryAction = useAppGroupCategoryAction()
    const roomAdminControl = useAppRoomAdminControlSelector()
    const [roomWelcomeMsg, setRoomWelcomeMsg] = useState('')
    const roomDetailsSelector = useAppRoomDetailsSelector()
    const getRoomAdminControl = () => {
        const room_Id: number = roomDetailsSelector.room.id;
        const params = {
            room_id: room_Id
        };
        groupCategoryApi.callGetAdminControl(params, (message: string, resp: any) => {
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleRoomMsg = (e: any) => {
        setRoomWelcomeMsg(e)
    }

    const handleCloseModal = () => {
        groupCategoryAction.showRoomAdminControlModal(false)
    }

    useEffect(() => {
        getRoomAdminControl()
    }, [])

    useEffect(() => {
        if (roomAdminControl) {
            setRoomWelcomeMsg(roomAdminControl && roomAdminControl.welcome_message && roomAdminControl.welcome_message.welcome_message ? roomAdminControl.welcome_message.welcome_message : '')
            setTimeout(() => {
                setValue('welcome_message', roomAdminControl && roomAdminControl.welcome_message && roomAdminControl.welcome_message.welcome_message ? roomAdminControl.welcome_message.welcome_message : '')
            }, 500)

        }
    }, [roomAdminControl])

    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                keyboard={false}
                className="theme-custom-modal"
                dialogClassName="modal-dialog-scrollable"
                size={'xl'}
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <h2>Admin Control Panel</h2>
                    {/* <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleCloseModal}>
                        <i className="modal-close" />
                    </button> */}
                    <span style={{ cursor: "pointer" }} onClick={handleCloseModal}>
                        <i className="fa fa-times fa-2x text-white"></i>
                    </span>
                </Modal.Header>
                <Modal.Body bsPrefix={'admin-room-control-modal'} className="modal-body pl-0 pr-0 dark-box-inner admin-room-setting-wrap admin_all_sec">
                    <div className="manage-video-message-panel room_modal">
                        <div className="row justify-content-center create-manager-panel">
                            <div className="col-lg-12">
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="form-group">
                                            <label>Welcome Room Message</label>

                                            {/* <textarea placeholder="About Yourself" className="form-control" style={{ height: '150px', resize: 'none' }} onChange={(e) => handleRoomMsg(e)} value={roomWelcomeMsg} /> */}
                                            <Controller
                                                control={control}
                                                name="welcome_message"
                                                render={({ onChange, onBlur, value, name, ref }) => (

                                                    <EditorInputBasic
                                                        value={value}
                                                        inputRef={ref}
                                                        name={name}
                                                        onChange={(e) => {
                                                            onChange(e)
                                                            handleRoomMsg(e)
                                                        }}
                                                        onBlur={onBlur}
                                                        toolbarItems={['undo', 'redo']}
                                                        error={errors.welcome_message}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <KickedUsersLists
                                        getRoomAdminControl={getRoomAdminControl}
                                    />
                                    {/* {
                                        [1, 3].includes(roomDetailsSelector.room.join_status.is_admin) &&
                                        ( */}
                                    <BannedUsersLists
                                        getRoomAdminControl={getRoomAdminControl}
                                    />
                                    {/* )
                                    } */}

                                </div>
                                <BanUserWithAdminActivity
                                    getRoomAdminControl={getRoomAdminControl}
                                />
                                <AdminMetting
                                    roomWelcomeMsg={roomWelcomeMsg}
                                />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    )
}