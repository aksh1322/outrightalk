import React, { useEffect } from 'react';
import Header from 'src/components/common/Header';
import Sidebar from 'src/components/common/Sidebar';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector';
import ActiveRoomPopDown from 'src/components/common/activeRoom/activeRoom';
import { useAppIsOpenActiveRoomSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import ManageFavouriteRoomsPage from 'src/components/favourites/manageFavouriteRooms/manageFavouriteRoomsPage';
import ActivePmWindowPopDown from 'src/components/pm-room/common/activePmWindow';
import { useAppIsOpenActivePmWindowSelector } from 'src/_common/hooks/selectors/pmWindowSelector';
import BannerShow from 'src/components/common/banner';

export default function ManageFavouriteRooms() {
    const userSelector = useAppUserDetailsSelector()
    const isOpenActiveRoomPopDown = useAppIsOpenActiveRoomSelector()
    const isOpenActivePmWindowPopDown = useAppIsOpenActivePmWindowSelector()

    return (
        <React.Fragment>
            <div id="layout-wrapper">
                <Header />
                <div className="vertical-menu vertical-menu-custom-submenu">
                    <div data-simplebar className="h-100">
                        <Sidebar />
                    </div>
                </div>
                <div className="main-content">
                    <div className="page-content">
                        {
                            <ManageFavouriteRoomsPage />
                        }
                    </div>
                    <BannerShow />
                </div>
            </div>
            {
                isOpenActiveRoomPopDown ?
                    <ActiveRoomPopDown /> :
                    null
            }
            {
                isOpenActivePmWindowPopDown ?
                    <ActivePmWindowPopDown /> :
                    null
            }
        </React.Fragment>
    )
}