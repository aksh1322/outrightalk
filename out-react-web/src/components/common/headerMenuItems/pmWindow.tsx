import React, { useEffect, useState } from 'react';
import { contextMenu } from 'react-contexify';

export const PmWindowHeaderMenu = () => {

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
                    <a href="#" onClick={(e) => onContextMenuClick(e, 'header', 'pm_header_file_id')}>File</a>
                </li>
                <li>
                    <a href="#" onClick={(e) => onContextMenuClick(e, 'header', 'room_header_menu_edit_id')}>Edit</a>
                </li>
                <li>
                    <a href="#" onClick={(e) => onContextMenuClick(e, 'header', 'pm_header_actions_id')}>Actions</a>
                </li>
                <li>
                    <a href="#" onClick={(e) => onContextMenuClick(e, 'header', 'pm_header_settings_id')}>Settings</a>
                </li>
                <li>
                    <a href="#" onClick={(e) => onContextMenuClick(e, 'header', 'pm_header_help_id')}>Help</a>
                </li>
            </ul>
        </React.Fragment>
    )
}