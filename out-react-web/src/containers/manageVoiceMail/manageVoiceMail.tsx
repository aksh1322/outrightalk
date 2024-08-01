import React, { useState, useEffect } from 'react';
import Header from 'src/components/common/Header';
import Sidebar from 'src/components/common/Sidebar';
import BannerShow from 'src/components/common/banner';
import VoiceMailList from 'src/components/manageVoiceMail/voiceMailList';
import PasswordManagedModal from 'src/components/commonModals/leftSideBarModals/passwordManagedModal';
import SendVoiceMailModal from 'src/components/manageVoiceMail/sendVoiceMailModal';
import ContactListModal from 'src/components/commonModals/leftSideBarModals/ContactListModal';
import ActiveRoomPopDown from 'src/components/common/activeRoom/activeRoom';
import { useAppIsOpenActiveRoomSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import { useAppVoiceMailModalOpen } from 'src/_common/hooks/selectors/videoMessageSelector'
import { useVideoMessageApi } from 'src/_common/hooks/actions/videoMessage/appVideoMessageApiHook';
import { useHistory } from 'react-router';
import { getBooleanStatus } from 'src/_config';
import { toast } from 'react-toastify';
import ActivePmWindowPopDown from 'src/components/pm-room/common/activePmWindow';
import { useAppIsOpenActivePmWindowSelector } from 'src/_common/hooks/selectors/pmWindowSelector';

export default function ManageVoiceMail() {
  const history = useHistory()
  const videoVoiceMessageApi = useVideoMessageApi()
  const isOpenActiveRoomPopDown = useAppIsOpenActiveRoomSelector()
  const isOpenActivePmWindowPopDown = useAppIsOpenActivePmWindowSelector()
  const [showPasswordManageVoiceMailModal, setShowPasswordManageVoiceMailModal] = useState<boolean>(false)
  const [showContactListModal, setContactListModalModal] = useState<boolean>(false)
  const voiceMailModalOpenSelector = useAppVoiceMailModalOpen()

  //Contact list Modal

  const contactListModalOpen = (e: any) => {
    e.preventDefault();
    setContactListModalModal(true)
  }

  const contactListCloseModal = () => {
    if (showContactListModal) setContactListModalModal(false)
  }


  //Password accept modal
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
      type: 'voice'
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
                    <h1>Manage Voicemails</h1>
                    <div className="d-flex">
                      <a href="#" onClick={contactListModalOpen} className="mail-action-btn waves-effect send-voice-btn">
                        <i className="send-voice-icon" />
                        Send Voicemail
                      </a>
                    </div>
                  </div>
                  <div className="table-panel voicemail-table">
                    <VoiceMailList />
                  </div>
                </div>
              </div>
            </div>
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

      <PasswordManagedModal
        onClose={closePasswordManageVoiceMailModal}
        shouldShow={showPasswordManageVoiceMailModal}
        type={'voicemail'}
      />

      {
        showContactListModal ?
          <ContactListModal
            onClose={contactListCloseModal}
            onSuccess={VoiceMailList}
            shouldShow={showContactListModal}
            type={'voicemail'}
          /> : null
      }

      {
        voiceMailModalOpenSelector ?
          <SendVoiceMailModal
            shouldShow={voiceMailModalOpenSelector}
          />
          : null
      }

    </React.Fragment>
  )
}
