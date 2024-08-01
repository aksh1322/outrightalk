import React, { useState, useEffect } from "react";
import { useAppIsOpenActiveRoomSelector } from "src/_common/hooks/selectors/groupCategorySelector";
import { useAppIsOpenActivePmWindowSelector } from "src/_common/hooks/selectors/pmWindowSelector";
import Header from "src/components/common/Header";
import Sidebar from "src/components/common/Sidebar";
import ActiveRoomPopDown from "src/components/common/activeRoom/activeRoom";
import BannerShow from "src/components/common/banner";
import ChatHistoryList from "src/components/manageChatHistory/chatHistoryList";
import ActivePmWindowPopDown from "src/components/pm-room/common/activePmWindow";

export default function ManageChatHistoryContainer() {
  const isOpenActiveRoomPopDown = useAppIsOpenActiveRoomSelector();
  const isOpenActivePmWindowPopDown = useAppIsOpenActivePmWindowSelector();

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
                  <div className="page-heading-panel d-flex justify-content-between">
                    <h1>Chat History</h1>
                  </div>
                  <div className="table-panel voicemail-table">
                    <ChatHistoryList />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <BannerShow />
        </div>
      </div>
      {isOpenActiveRoomPopDown ? <ActiveRoomPopDown /> : null}
      {isOpenActivePmWindowPopDown ? <ActivePmWindowPopDown /> : null}
    </React.Fragment>
  );
}
