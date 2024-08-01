import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getBooleanStatus } from 'src/_config';
import Header from 'src/components/common/Header';
import Sidebar from 'src/components/common/Sidebar';
import BannerShow from 'src/components/common/banner';
import VideoMessageList from 'src/components/manageVideoMessage/videoMessageList';
import PasswordManagedModal from 'src/components/commonModals/leftSideBarModals/passwordManagedModal';
import ContactListModal from 'src/components/commonModals/leftSideBarModals/ContactListModal';
import SendVideoMessageModal from 'src/components/manageVideoMessage/sendVideoMessageModal';
import ActiveRoomPopDown from 'src/components/common/activeRoom/activeRoom';
import { useAppIsOpenActiveRoomSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import { useAppVideoMessageModalOpen } from 'src/_common/hooks/selectors/videoMessageSelector';
import { useVideoMessageApi } from 'src/_common/hooks/actions/videoMessage/appVideoMessageApiHook';
import { toast } from 'react-toastify';
import ActivePmWindowPopDown from 'src/components/pm-room/common/activePmWindow';
import { useAppIsOpenActivePmWindowSelector } from 'src/_common/hooks/selectors/pmWindowSelector';

export default function ManageVideoMessageContainer() {

  const videoVoiceMessageApi = useVideoMessageApi()
  const [showPasswordManageVoiceMailModal, setShowPasswordManageVoiceMailModal] = useState<boolean>(false)
  const [showContactListModal, setContactListModalModal] = useState<boolean>(false)
  const history = useHistory()
  const isOpenActiveRoomPopDown = useAppIsOpenActiveRoomSelector()
  const isOpenActivePmWindowPopDown = useAppIsOpenActivePmWindowSelector()
  const videoMessageModalOpenSelector = useAppVideoMessageModalOpen()

  //Contact list Modal

  const contactListModalOpen = (e: any) => {
    e.preventDefault();
    setContactListModalModal(true)
  }

  const contactListCloseModal = () => {
    if (showContactListModal) setContactListModalModal(false)
  }

  //check if it is password protected or not if protected then show password modal and confirm password from API
  const closePasswordManageVoiceMailModal = (success: any) => {
    if (showPasswordManageVoiceMailModal) {
      setShowPasswordManageVoiceMailModal(false)
      if (success) {
        //listing page open
      } else {
        // redirect to previous page 
        history.goBack()
      }
    }
  }

  const showPasswordManageVoiceMail = () => {
    setShowPasswordManageVoiceMailModal(true)
  }

  const isPagePasswordProtected = () => {
    const params = {
      type: 'video'
    }
    videoVoiceMessageApi.callIsPasswordProtectedPage(params, (message: string, resp: any) => {
      if (resp && resp.val) {
        if (getBooleanStatus(resp.val)) {
          showPasswordManageVoiceMail()
        }
      }
    }, (message: string) => {
      toast.error(message)
    })
  }

  useEffect(() => {
    // showPasswordManageVoiceMail()
    isPagePasswordProtected()
  }, [])

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
                    <h1>Manage Video Messages</h1>
                    <div className="d-flex">
                      <a href="#" onClick={contactListModalOpen} className="mail-action-btn waves-effect send-voice-btn">
                        <i className="send-voice-icon" />
                        Send Video Message
                      </a>
                    </div>
                  </div>
                  <div className="table-panel voicemail-table">
                    <VideoMessageList />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <BannerShow />
        </div>
      </div>


      <PasswordManagedModal
        onClose={closePasswordManageVoiceMailModal}
        shouldShow={showPasswordManageVoiceMailModal}
        type={'videomessage'}
      />

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

      {
        showContactListModal ?
          <ContactListModal
            onClose={contactListCloseModal}
            onSuccess={VideoMessageList}
            shouldShow={showContactListModal}
            type={'videomessage'}
          /> : null
      }

      {
        videoMessageModalOpenSelector ?
          <SendVideoMessageModal
            shouldShow={videoMessageModalOpenSelector}
          />
          : null
      }

    </React.Fragment>
  )
}
