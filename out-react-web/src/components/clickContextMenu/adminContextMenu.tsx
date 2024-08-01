import React, { useState } from 'react';
import { Menu, Item, Separator, Submenu } from 'react-contexify';
import SweetAlert from 'react-bootstrap-sweetalert';
import { useAppGroupCategoryAction } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook';
import { CRYPTO_SECRET_KEY, getRoomTypeValidationForTextOnly, URLS } from 'src/_config';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router';
import { useAppRoomDetailsSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { toast } from 'react-toastify';
const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

const AdminContextMenu = (props: any) => {

    const { groupId, roomId } = useParams<any>();
    const groupCategoryApi = useGroupCategoryApi()
    const groupCategoryAction = useAppGroupCategoryAction()
    const roomDetailsSelector = useAppRoomDetailsSelector()
    const history = useHistory()
    const [alert, setAlert] = useState<any>(null);

    const hideAlert = () => {
        setAlert(null);
    }

    const handleRemoveAllHand = (e: any) => {
        const params = {
            room_id: roomDetailsSelector.room.id
        }
        groupCategoryApi.callRemoveAllHand(params, (message: string, resp: any) => {
            if (resp) { }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleDisableInvitation = (e: any) => {
        const params = {
            room_id: roomDetailsSelector.room.id,
            disable_invitation: roomDetailsSelector && roomDetailsSelector.room_setting ? roomDetailsSelector.room_setting.disable_invitation ? 0 : 1 : 1
        }
        groupCategoryApi.callDisableInvitation(params, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }


    const handleGiveMicToAll = (e: any) => {
        const params = {
            room_id: roomDetailsSelector.room.id,
        }
        groupCategoryApi.callGiveMicToAll(params, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleRemoveAllMics = (e: any) => {
        const params = {
            room_id: roomDetailsSelector.room.id,
        }
        groupCategoryApi.callRemoveAllMic(params, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleSimulteniousMic = (e: any, mics: number) => {
        const params = {
            room_id: roomDetailsSelector.room.id,
            simultaneous_value: mics
        }
        groupCategoryApi.callSimultaneousMic(params, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }



    const deleteRoom = () => {
        hideAlert()
        var params = {
            room_id: roomDetailsSelector.room.id,
        }
        groupCategoryApi.callDeleteRoom(params, (message: string, resp: any) => {
            if (resp) {
                groupCategoryAction.showRoomSettingModal(false)
                history.push(URLS.USER.GROUPS_AND_CATEGORY)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const closeRoom = () => {
        hideAlert()
        var params = {
            room_id: roomDetailsSelector.room.id,
        }
        groupCategoryApi.callCloseRoom(params, (message: string, resp: any) => {
            if (resp) {
                history.replace("")
                history.push(URLS.USER.GROUPS_AND_CATEGORY)
                toast.success('Room was closed successfully');
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleCloseRoom = (e: any) => {
        setAlert(
            <SweetAlert
                warning
                showCancel
                confirmBtnText="Yes"
                cancelBtnText="No"
                cancelBtnBsStyle="danger"
                confirmBtnBsStyle="success"
                allowEscape={false}
                closeOnClickOutside={false}
                title="Close Room"
                onConfirm={() => closeRoom()}
                onCancel={hideAlert}
                focusCancelBtn={true}
            >
                Are you sure want to close this room?
            </SweetAlert>
        );
    }

    const handleItemClick = (e: any) => {
    }

    const handleRoomSettingModalClick = (e: any) => {
        groupCategoryAction.showRoomSettingModal(true)
    }

    const handleAdminRoomControlPanel = (e: any) => {
        groupCategoryAction.showRoomAdminControlModal(true)
    }

    const handleRedDotForAll = () => {
        var params = {
            room_id: roomDetailsSelector.room.id,
            is_red_dot: roomDetailsSelector && roomDetailsSelector.room_setting ? roomDetailsSelector.room_setting.red_dot_all_users ? 0 : 1 : 1
        }
        groupCategoryApi.callRedDotForAll(params, (message: string, resp: any) => {

        }, (message: string) => {
            toast.error(message)
        })
    }

    // console.log('roomDetailsSelector--', roomDetailsSelector)

    return (
        <React.Fragment>
            {alert}
            <Menu id='room_header_menu_admin_id' className="header-click-menu">
                <Item onClick={() => handleRedDotForAll()}>
                    {roomDetailsSelector && roomDetailsSelector.room_setting ? roomDetailsSelector.room_setting.red_dot_all_users ? <i className="fa fa-check" aria-hidden="true"></i> : null : null}
                    Red Dot all Users

                </Item>

                {
                    getRoomTypeValidationForTextOnly(roomDetailsSelector && roomDetailsSelector.room && roomDetailsSelector.room.type)
                        ?
                        <>
                            <Item onClick={(event) => handleGiveMicToAll(event)}>
                                {roomDetailsSelector && roomDetailsSelector.room_setting ? roomDetailsSelector.room_setting.give_mic_to_all ? <i className="fa fa-check" aria-hidden="true"></i> : null : null}        Give Mic to All
                            </Item>
                            <Item onClick={(event) => handleRemoveAllMics(event)}>
                                {roomDetailsSelector && roomDetailsSelector.room_setting ? roomDetailsSelector.room_setting.remove_all_mics ? <i className="fa fa-check" aria-hidden="true"></i> : null : null}
                                Remove all Mics
                            </Item>
                            <Item onClick={(event) => handleRemoveAllHand(event)}>Remove all Hands</Item>
                        </>
                        : null
                }

                <Item onClick={(event) => handleDisableInvitation(event)}>
                    {roomDetailsSelector && roomDetailsSelector.room_setting ? roomDetailsSelector.room_setting.disable_invitation ? <i className="fa fa-check" aria-hidden="true"></i> : null : null}
                    Disable Invitation
                </Item>
                {
                    getRoomTypeValidationForTextOnly(roomDetailsSelector && roomDetailsSelector.room && roomDetailsSelector.room.type) ? <>
                        <Submenu label="Simultaneous Mics">
                            <Item onClick={(event) => handleSimulteniousMic(event, 1)} disabled={roomDetailsSelector && roomDetailsSelector.room && roomDetailsSelector.room.subscription_info ? false : true}>
                                {roomDetailsSelector && roomDetailsSelector.room_setting ? roomDetailsSelector.room_setting.simultaneous_mics == 1 ? <i className="fa fa-check" aria-hidden="true"></i> : null : null}
                                Only one(1) mic
                            </Item>
                            <Item onClick={(event) => handleSimulteniousMic(event, 2)} disabled={roomDetailsSelector && roomDetailsSelector.room && roomDetailsSelector.room.subscription_info ? false : true}>
                                {roomDetailsSelector && roomDetailsSelector.room_setting ? roomDetailsSelector.room_setting.simultaneous_mics == 2 ? <i className="fa fa-check" aria-hidden="true"></i> : null : null}
                                Two(2) mics
                            </Item>
                            <Item onClick={(event) => handleSimulteniousMic(event, 3)} disabled={roomDetailsSelector && roomDetailsSelector.room && roomDetailsSelector.room.subscription_info ? false : true}>
                                {roomDetailsSelector && roomDetailsSelector.room_setting ? roomDetailsSelector.room_setting.simultaneous_mics == 3 ? <i className="fa fa-check" aria-hidden="true"></i> : null : null}
                                Three(3) mics
                            </Item>
                        </Submenu>
                    </> : null
                }

                <Item onClick={(event) => handleCloseRoom(event)}
                    disabled={roomDetailsSelector?.members.filter((member: any) => member.is_admin == 3).length > 0 ? (roomDetailsSelector?.user.id == roomDetailsSelector?.room_owner.user_id ? false : true) : false}
                >Close Room</Item>
                <Item onClick={(event) => handleAdminRoomControlPanel(event)}>Admin Control Panel</Item>
                <Item onClick={(event) => handleRoomSettingModalClick(event)}>Room Settings</Item>
            </Menu>
        </React.Fragment>

    );
};

export default AdminContextMenu;