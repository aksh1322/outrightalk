import React from 'react';
import Header from 'src/components/common/Header';
import Sidebar from 'src/components/common/Sidebar';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector';
import MyNotebookPage from 'src/components/notebook/myNotebook';
import ActiveRoomPopDown from 'src/components/common/activeRoom/activeRoom';
import { useAppIsOpenActiveRoomSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import ActivePmWindowPopDown from 'src/components/pm-room/common/activePmWindow';
import { useAppIsOpenActivePmWindowSelector } from 'src/_common/hooks/selectors/pmWindowSelector';
import BannerShow from 'src/components/common/banner';

export default function MyNotebook() {
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
                        <MyNotebookPage />
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