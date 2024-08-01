import React, { useEffect, useState } from 'react';
import { contextMenu } from 'react-contexify';

export const MainWindowHeaderMenu = () => {

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
                    <a href="#" onClick={(e) => onContextMenuClick(e, 'header', 'menu_header_file_id')}>File</a>
                </li>
                <li>
                    <a href="#" onClick={(e) => onContextMenuClick(e, 'header', 'menu_header_action_id')}>Actions</a>
                </li>
                <li>
                    <a href="#" onClick={(e) => onContextMenuClick(e, 'header', 'menu_header_favourite_id')}>Favourites</a>
                </li>
                <li>
                    <a href="#" onClick={(e) => onContextMenuClick(e, 'header', 'menu_header_help_id')}>Help</a>
                </li>
            </ul>
        </React.Fragment>
    )
}