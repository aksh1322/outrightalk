import React from 'react';
import { Menu, Item, Separator, Submenu } from 'react-contexify';
import { useAppUserAction } from '../../_common/hooks/actions/user/appUserActionHook'
import { useUserApi } from '../../_common/hooks/actions/user/appUserApiHook';
import { useToaster } from '../../_common/hooks/actions/common/appToasterHook';
import { UpdateVisibilityStatus } from '../../_common/interfaces/ApiReqRes';

const StatusToggleMenu = (props: any) => {
    const userAction = useAppUserAction()
    const userApi = useUserApi()
    const toast = useToaster()

    const handleItemClick = (e: any, status: number) => {

        // userAction.onlineStatusToggle(status)

        const params: UpdateVisibilityStatus = {
            visible_status: status
        }

        userApi.callUpdateUserVisibilityStatus(params, (message: string, resp: any) => {
            if (resp) {
                // toast.success(message)
            } else {
                toast.error(message)
            }
        }, (message: string, resp: any) => {
            toast.error(message)
        })
    }

    return (
        <Menu id='status_toggle_id' className="status-toggle-menu">
            <Item onClick={(event) => handleItemClick(event, 1)}>Available</Item>
            <Item onClick={(event) => handleItemClick(event, 3)}>DND</Item>
            <Item onClick={(event) => handleItemClick(event, 4)}>Invisible</Item>
            <Item onClick={(event) => handleItemClick(event, 2)}>Away</Item>
        </Menu>
    );
};

export default StatusToggleMenu;