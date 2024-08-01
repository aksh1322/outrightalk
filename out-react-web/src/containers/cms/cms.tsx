import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from 'src/components/common/Header';
import Sidebar from 'src/components/common/Sidebar';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector';
import ActiveRoomPopDown from 'src/components/common/activeRoom/activeRoom';
import ActivePmWindowPopDown from 'src/components/pm-room/common/activePmWindow';
import { useAppIsOpenActiveRoomSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import { useAppIsOpenActivePmWindowSelector } from 'src/_common/hooks/selectors/pmWindowSelector';
import moment from 'moment';
import CmsComponent from 'src/components/cms/cms';
import BannerShow from 'src/components/common/banner';

export default function Cms() {

  const userSelector = useAppUserDetailsSelector()
  const isOpenActiveRoomPopDown = useAppIsOpenActiveRoomSelector()
  const isOpenActivePmWindowPopDown = useAppIsOpenActivePmWindowSelector()

  return (
    <React.Fragment>
      <div id="layout-wrapper">
        <Header />
        {/* ========== Left Sidebar Start ========== */}
        <div className="vertical-menu vertical-menu-custom-submenu">
          <div data-simplebar className="h-100">
            {/*- Sidemenu */}
            <Sidebar />
            {/* Sidebar */}
          </div>
        </div>
        {/* Left Sidebar End */}
        {/* ============================================================== */}
        {/* Start right Content here */}
        {/* ============================================================== */}
        <div className="main-content">
          <div className="page-content">
            <div className="container-fluid">

              {/* CMS Component goes here */}

              <CmsComponent />

            </div> {/* container-fluid */}
          </div>
          <BannerShow />
          {/* End Page-content */}
        </div>
        {/* end main content*/}
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
