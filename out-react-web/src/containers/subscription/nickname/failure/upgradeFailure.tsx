import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ActiveRoomPopDown from 'src/components/common/activeRoom/activeRoom';
import Header from 'src/components/common/Header';
import Sidebar from 'src/components/common/Sidebar';
import { UpgradeNicknameComponent } from 'src/components/groupsCategory/subscription/upgradeNickname';
import ActivePmWindowPopDown from 'src/components/pm-room/common/activePmWindow';
import { useAppIsOpenActiveRoomSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import { useAppIsOpenActivePmWindowSelector } from 'src/_common/hooks/selectors/pmWindowSelector';
import { HEADER_TYPE } from 'src/_config';

export default function UpgradeNicknameFailure() {

    const isOpenActiveRoomPopDown = useAppIsOpenActiveRoomSelector()
    const isOpenActivePmWindowPopDown = useAppIsOpenActivePmWindowSelector()

    return (
        <React.Fragment>
            <div id="layout-wrapper">
                <Header type={HEADER_TYPE.MAIN_WINDOW} />
                <div className="vertical-menu vertical-menu-custom-submenu">
                    <div data-simplebar className="h-100">
                        <Sidebar />
                    </div>
                </div>
                <div className="main-content">
                    <div className="page-content">
                        <UpgradeNicknameComponent />
                    </div>
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