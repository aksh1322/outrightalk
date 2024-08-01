import React from 'react';
import { contextMenu } from 'react-contexify';
import RoleBasedContextMenuHOC from 'src/_common/hoc/roleBasedRoomSideContextMenuGauard';

export const RoomWindowHeaderMenu = () => {

    const onContextMenuClick = (e: any, header: any, menuId: string) => {
        e.preventDefault();
        contextMenu.show({
            id: menuId,
            event: e,
            props: {
                headerParams: header
            }
        });
    }

    return (
        <React.Fragment>
            <ul>
                <li>
                    <a href="#" onClick={(e) => onContextMenuClick(e, 'header', 'room_header_menu_file_id')}>File</a>
                </li>
                <li>
                    <a href="#" onClick={(e) => onContextMenuClick(e, 'header', 'room_header_menu_edit_id')}>Edit</a>
                </li>
                <li>
                    <a href="#" onClick={(e) => onContextMenuClick(e, 'header', 'room_header_menu_action_id')}>Actions</a>
                </li>
                <li>
                    <a href="#" onClick={(e) => onContextMenuClick(e, 'header', 'room_header_menu_setting_id')}>Settings</a>
                </li>
                <li>
                    <a href="#" onClick={(e) => onContextMenuClick(e, 'header', 'room_header_menu_favourite_id')}>Favorites</a>
                </li>
                <RoleBasedContextMenuHOC role={[1, 2, 3]}>
                    < li >
                        <a href="#" onClick={(e) => onContextMenuClick(e, 'header', 'room_header_menu_admin_id')}>Admin</a>
                    </li>
                </RoleBasedContextMenuHOC>
                <li>
                    <a href="#" onClick={(e) => onContextMenuClick(e, 'header', 'room_header_menu_help_id')}>Help</a>
                </li>
            </ul>
        </React.Fragment >
    )
}