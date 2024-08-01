import React, { useEffect } from 'react';
import Header from 'src/components/common/Header';
import Sidebar from 'src/components/common/Sidebar';
import ActiveRoomPopDown from 'src/components/common/activeRoom/activeRoom'
import GroupsCategoryListPage from 'src/components/groupsCategory/list/groupsCategoryList';
import { useAppIsOpenActiveRoomSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import ActivePmWindowPopDown from 'src/components/pm-room/common/activePmWindow';
import { useAppIsOpenActivePmWindowSelector } from 'src/_common/hooks/selectors/pmWindowSelector';
import BannerShow from 'src/components/common/banner';

export default function GroupsCategory() {

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
                        <div className="container-fluid">
                            <div className="row justify-content-center">
                                <div className="col-sm-12">
                                    <GroupsCategoryListPage />
                                </div>
                            </div>
                        </div>
                    </div>
                    <BannerShow />
                </div>
            </div>
            {
                isOpenActiveRoomPopDown ?
                    <ActiveRoomPopDown /> : null
            }
            {
                isOpenActivePmWindowPopDown ?
                    <ActivePmWindowPopDown /> :
                    null
            }

        </React.Fragment>
    )
}