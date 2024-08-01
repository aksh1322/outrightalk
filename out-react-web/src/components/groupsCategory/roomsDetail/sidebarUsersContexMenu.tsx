import React, { useState } from 'react';
import { Menu, Item, Separator, Submenu } from 'react-contexify';
import RoleBasedContextMenuHOC from 'src/_common/hoc/roleBasedRoomSideContextMenuGauard';
import CheckboxInput from 'src/_common/components/form-elements/checkboxinput/checkboxInput';
import { MENU_OPERATIONS, getBooleanStatus, isAdmin } from 'src/_config';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import { useAppRoomDetailsSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector';
import { useAppUserAction } from "src/_common/hooks/actions/user/appUserActionHook";

interface ContexMenuProps {
    getParams: (data: { id: number, userName: string, customize_nickname: any, whisper_channel: any, operation: string }) => void
    members: any;
    loginUsers: any;
}

const SideBarUsersContextMenu = ({ getParams, members, loginUsers }: ContexMenuProps) => {
    const roomDetailsSelector = useAppRoomDetailsSelector()
    const userSelector = useAppUserDetailsSelector();
    const userAction = useAppUserAction()

    const handleItemClick = (e: any, operation: string) => {
        getParams(
            {
                id: e.props.memberDetails.details.id,
                userName: e.props.memberDetails.details.username,
                customize_nickname: e.props.memberDetails.customize_nickname,
                whisper_channel: e.props.memberDetails.whisper_channel,
                operation: operation,
            }
        )

        if (operation == MENU_OPERATIONS.SEND_GIFT_SUBSCRIPTION) {
            userAction.updateSendGiftTypeAction("Nickname-Subscriptions")
        }
        if (operation == MENU_OPERATIONS.SEND_VIRTUAL_CREDIT) {
            userAction.updateSendGiftTypeAction("Virtual Credits")
        }
        else {
            userAction.updateSendGiftTypeAction(null)
        }
    }

    // console.log('members----', members)
    // console.log('loginUsers----', loginUsers)

    return (
        <>
            <Menu id='user_menu_id' className="sidebar-rightclick-menu">
                {/* <RoleBasedContextMenuHOC role={[1, 2, 3]}> */}
                {
                    // members && loginUsers && isAdmin(loginUsers.room_user_status.is_admin) ?
                    members && loginUsers && isAdmin(loginUsers.room_user_status.is_admin) ?
                        // [0].includes(members.is_admin) 
                        // members && loginUsers && [1, 2].includes(loginUsers.room_user_status.is_admin) ? null :

                        <Submenu label="Red-Dot User" disabled={members?.user_id == roomDetailsSelector?.room_owner.user_id}>
                            <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.RED_DOT_ALL)}>
                                {roomDetailsSelector && roomDetailsSelector.members && roomDetailsSelector.members.length && roomDetailsSelector.members[roomDetailsSelector.members.findIndex((x: any) => x.user_id == members.user_id)] ?
                                    roomDetailsSelector.members[roomDetailsSelector.members.findIndex((x: any) => x.user_id == members.user_id)].red_dot_mic
                                        && roomDetailsSelector.members[roomDetailsSelector.members.findIndex((x: any) => x.user_id == members.user_id)].red_dot_text
                                        && roomDetailsSelector.members[roomDetailsSelector.members.findIndex((x: any) => x.user_id == members.user_id)].red_dot_camera
                                        ? <i className="fa fa-check" aria-hidden="true"></i> : null : null}
                                All
                            </Item>
                            <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.RED_DOT_FOR_MIC)}>
                                {roomDetailsSelector && roomDetailsSelector.members && roomDetailsSelector.members.length && roomDetailsSelector.members[roomDetailsSelector.members.findIndex((x: any) => x.user_id == members.user_id)] ? roomDetailsSelector.members[roomDetailsSelector.members.findIndex((x: any) => x.user_id == members.user_id)].red_dot_mic ? <i className="fa fa-check" aria-hidden="true"></i> : null : null}
                                Mic
                            </Item>
                            <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.RED_DOT_FOR_TEXT)}>
                                {roomDetailsSelector && roomDetailsSelector.members && roomDetailsSelector.members.length && roomDetailsSelector.members[roomDetailsSelector.members.findIndex((x: any) => x.user_id == members.user_id)] ? roomDetailsSelector.members[roomDetailsSelector.members.findIndex((x: any) => x.user_id == members.user_id)].red_dot_text ? <i className="fa fa-check" aria-hidden="true"></i> : null : null}
                                Text
                            </Item>
                            <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.RED_DOT_FOR_CAM)}>
                                {roomDetailsSelector && roomDetailsSelector.members && roomDetailsSelector.members.length && roomDetailsSelector.members[roomDetailsSelector.members.findIndex((x: any) => x.user_id == members.user_id)] ? roomDetailsSelector.members[roomDetailsSelector.members.findIndex((x: any) => x.user_id == members.user_id)].red_dot_camera ? <i className="fa fa-check" aria-hidden="true"></i> : null : null}
                                Video
                            </Item>
                        </Submenu>
                        : null
                }

                {
                    members && loginUsers && isAdmin(loginUsers.room_user_status.is_admin) && (members?.details?.id != userSelector?.id) ? <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.KICK_USER)} disabled={members?.user_id == roomDetailsSelector?.room_owner.user_id}>Kick User</Item> : null
                }

                {
                    members && loginUsers && isAdmin(loginUsers.room_user_status.is_admin) && getBooleanStatus(members.is_raise_hand) ?
                        <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.REMOVE_USER_HAND)}>Remove hand</Item>
                        : null
                }

                {
                    members && loginUsers && isAdmin(loginUsers.room_user_status.is_admin) && getBooleanStatus(members.is_raise_hand) ?
                        <Separator />
                        : null
                }

                {/* </RoleBasedContextMenuHOC> */}
                <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.SEND_PM)} disabled={members && members.is_block ? true : false} >Send a PM</Item>
                <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.WHISPER_MESSAGE)} disabled={members && members.is_block ? true : false} >Send a Whisper</Item>
                {
                    members && members.is_ignore ? <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.REMOVE_IGNORE_USER_LIST)}>Remove Ignore</Item>
                        :
                        <Item disabled={(members && isAdmin(members.is_admin)) || (members?.details?.id == userSelector?.id) ? true : false} onClick={(event) => handleItemClick(event, MENU_OPERATIONS.ADD_TO_IGNORE_USER_LIST)}>Ignore</Item>
                }
                {members && members.is_cemera ?
                    <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.VIEW_USER_WEBCAM)} disabled={members && members.is_block ? true : false} >View Webcam</Item> : null}

                <Separator />
                {
                    members && members.add_contact_list ? <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.REMOVE_FROM_CONTACT_LIST)}>Remove from Contact List</Item> : null
                }
                {
                    members && members.add_contact_list ?
                        null
                        : <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.ADD_TO_CONTACT_LIST)} disabled={members?.details?.id == userSelector?.id} >Add to Contact List</Item>
                }
                {
                    members && members.add_contact_list ? null :
                        <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.ADD_TO_FAVOURITE_CONTACT)} disabled={members?.details?.id == userSelector?.id} >Add as favourite contact</Item>

                }
                <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.ADD_TO_BLOCK_LIST)} disabled={(members?.details?.id == userSelector?.id) || (members && members.is_block ? true : false)} >Add to Blocked List</Item>
                <Separator />
                {/* <Item onClick={(event) => handleItemClick(event.props.profile)}>Delete</Item> */}
                <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.VIEW_PROFILE)}>View Profile</Item>
                <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.COPY_NICKNAME)}>Copy Nickname</Item>
                <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.CUSTOMIZED_NICKNAME)} disabled={members?.details?.id == userSelector?.id} >Customize Nickname</Item>
                <Separator />
                <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.SEND_VIRTUAL_GIFT)} disabled={members && members.is_block ? true : false} >Send a Virtual Gift</Item>
                <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.SEND_GIFT_SUBSCRIPTION)} disabled={members && members.is_block ? true : false} >Buy a Gift Subscription</Item>
                {/* <Submenu label="Buy a Gift Subscription">
                    <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.OTHERS)}>Gold</Item>
                    <Submenu label="VIP">
                        <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.OTHERS)}>Orchid</Item>
                        <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.OTHERS)}>Pink</Item>
                    </Submenu>
                    <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.OTHERS)}>Orange</Item>
                    <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.OTHERS)}>Blue</Item>
                </Submenu> */}
            </Menu>
        </>
    );
};

export default SideBarUsersContextMenu;