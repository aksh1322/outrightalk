import React, { useContext } from 'react';

import { Menu, Item, Separator, Submenu } from 'react-contexify';
import { getBooleanStatus, MENU_OPERATIONS, CRYPTO_SECRET_KEY } from 'src/_config';
import { usePmWindowApi } from "src/_common/hooks/actions/pmWindow/appPmWindowApiHook";
import { useHistory } from 'react-router';
import { toast } from 'react-toastify';
// import { AntmediaContext } from 'src';
import { useAppUserAction } from "src/_common/hooks/actions/user/appUserActionHook";
import { useAppPmWindowAction } from 'src/_common/hooks/actions/pmWindow/appPmWindowActionHook';

const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);
interface LeftContexMenuProps {
    getParams: (data: { id: number, userName: string, customize_nickname: any, operation: string }) => void
    profile: any;
    isLoginUsers: boolean;
}


const LeftBarPersonContextMenu = ({ profile, getParams, isLoginUsers }: LeftContexMenuProps) => {
    // console.log("@@isLoginUsers: ", isLoginUsers);

    const history = useHistory()
    const pmWindowApi = usePmWindowApi();
    // const antmedia = useContext<any>(AntmediaContext);
    const userAction = useAppUserAction()
    const pmWindowAction = useAppPmWindowAction()


    const handleItemClick = (e: any, operation: string) => {

        if (!(e.props.profile)) {
            e.props.profile = profile;
        }

        if (isLoginUsers) {
            getParams(
                {
                    id: e.props.profile.id,
                    userName: e.props.profile.username,
                    customize_nickname: null,
                    operation: operation
                }
            )
        } else {
            getParams(
                {
                    id: e.props.profile.contact_user.id,
                    userName: e.props.profile.contact_user.username,
                    customize_nickname: e.props.profile.customize_nickname,
                    operation: operation
                }
            )
        }

        if (operation == MENU_OPERATIONS.SEND_GIFT_SUBSCRIPTION) {
            userAction.updateSendGiftTypeAction("Nickname-Subscriptions")
        }
        else if (operation == MENU_OPERATIONS.SEND_VIRTUAL_CREDIT) {
            userAction.updateSendGiftTypeAction("Virtual Credits")
        }
        else {
            userAction.updateSendGiftTypeAction(null)
        }
    }

    const handleSendPm = (id: number) => {
        //if id equals login user id then not open pm window
        // if (id != userSelector?.id) {

        // if (antmedia.publishStreamId) antmedia.handleLeaveFromRoom();

        const params = {
            user_id: id,
        };

        pmWindowApi.callSendPms(
            params,
            (message: string, resp: any) => {
                if (resp) {
                    const userId = cryptr.encrypt(resp.id);
                    // history.replace("");
                    history.push(`/pm/${userId}`);
                } else {
                    toast.error(message);
                }
            },
            (message: string, resp: any) => {
                toast.error(message);
            }
        );
        // }
    };

    const handleItemClickCall = (event: any, type: string) => {
        setTimeout(() => {
            pmWindowAction.startCallOnClickAction({
                type: type,
            })
        }, 2500)


        if (isLoginUsers) {
            handleSendPm(event.props.profile.id)
        }
        else {
            handleSendPm(event.props.profile.contact_user.id)
        }
    }

    return (
        <Menu id='menu_id' className="sidebar-rightclick-menu">
            {
                // profile && profile.contact_user && [1, 2, 3].includes(profile.contact_user.visible_status) ?
                <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.SEND_PM)} disabled={profile && profile.contact_user && profile.contact_user.visible_status == 3 ? true : false}>Send a PM</Item>
                // :
                // null
            }
            <Item onClick={(event) => handleItemClickCall(event, "voice")} disabled={profile && profile.contact_user && profile.contact_user.visible_status == 3 ? true : false} >Call</Item>

            <Item onClick={(event) => handleItemClickCall(event, "video")} disabled={profile && profile.contact_user && profile.contact_user.visible_status == 3 ? true : false} >Video Call</Item>

            {/* <Item onClick={(event) => handleItemClickCall(event)}>Start Webcam</Item> */}
            {
                profile && getBooleanStatus(profile.is_favourite) ?
                    null :
                    <>
                        <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.ADD_TO_FAVOURITE_CONTACT)}>Add as favourite</Item>
                        <Separator />
                    </>

            }
            <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.REMOVE_FROM_CONTACT_LIST)}>Remove</Item>
            {/* <Item >Add to Contact List</Item> */}
            <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.ADD_TO_BLOCK_LIST)}>Add to Blocked List</Item>
            <Separator />
            {/* <Item onClick={(event) => handleItemClick(event.props.profile)}>Delete</Item> */}
            {/* <Item >Invite</Item> */}
            <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.VIEW_PROFILE)}>View Profile</Item>
            <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.SEND_FILE)} disabled={profile && profile.contact_user && profile.contact_user.visible_status == 3 ? true : false} >Send a File</Item>
            <Item onClick={(event) => handleItemClick(event, MENU_OPERATIONS.CUSTOMIZED_NICKNAME)}>Customize Nickname</Item>
            <Separator />
            <Item onClick={(e) => handleItemClick(e, MENU_OPERATIONS.SEND_VIRTUAL_GIFT)} disabled={profile && profile.contact_user && profile.contact_user.visible_status == 3 ? true : false} >Send a Virtual Gift</Item>
            {/* <Item onClick={(e) => handleItemClick(e, MENU_OPERATIONS.BUY_GIFT_SUBSCRIPTION)}>Buy a Gift Subscription</Item> */}
            <Item onClick={(e) => handleItemClick(e, MENU_OPERATIONS.SEND_GIFT_SUBSCRIPTION)} disabled={profile && profile.contact_user && profile.contact_user.visible_status == 3 ? true : false} >Send a Gift Subscription</Item>
            <Item onClick={(e) => handleItemClick(e, MENU_OPERATIONS.SEND_VIRTUAL_CREDIT)} disabled={profile && profile.contact_user && profile.contact_user.visible_status == 3 ? true : false} >Send a Virtual Credit</Item>
            {/* <Submenu label="Send a Gift Subscription">
                <Item >Gold</Item>
                <Submenu label="VIP">
                    <Item>Orchid</Item>
                    <Item>Pink</Item>
                </Submenu>
                <Item>Coral</Item>
                <Item>Steel Blue</Item>
            </Submenu> */}
        </Menu>
    );
};

export default LeftBarPersonContextMenu;