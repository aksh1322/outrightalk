import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from 'src/components/common/Header';
import Sidebar from 'src/components/common/Sidebar';
import BannerShow from 'src/components/common/banner';
import { URLS, STATIC_URL } from 'src/_config';
import { getNameInitials, getSubscriptionColor } from 'src/_config/functions';
import { useAppUserDetailsSelector, useAppMultiRecipientMessageModalOpen } from 'src/_common/hooks/selectors/userSelector';
import ActiveRoomPopDown from 'src/components/common/activeRoom/activeRoom';
import ActivePmWindowPopDown from 'src/components/pm-room/common/activePmWindow';
import { useAppIsOpenActiveRoomSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import { useAppIsOpenActivePmWindowSelector } from 'src/_common/hooks/selectors/pmWindowSelector';
import { useAppUserAction } from 'src/_common/hooks/actions/user/appUserActionHook';
import moment from 'moment';
import CustomizedPersonalMessageModal from 'src/components/commonModals/customizedPersonalMessageModal/customizedPersonalMessageModal';
import MultiRecipientMessageModal from 'src/components/commonModals/multiRecipientMessageModal/multiRecipientMessageModal';


export default function Dashboard() {

  const userAction = useAppUserAction()
  const userSelector = useAppUserDetailsSelector()
  const isOpenActiveRoomPopDown = useAppIsOpenActiveRoomSelector()
  const isOpenActivePmWindowPopDown = useAppIsOpenActivePmWindowSelector()
  const isOpenMultiRecipientMessageModal = useAppMultiRecipientMessageModalOpen()

  const [showCustomizedPersonalMessageModal, setShowCustomizedPersonalMessageModal] = useState<boolean>(false)

  // const [image, takeScreenshot] = useScreenshot()
  // const getImage = () => takeScreenshot(ref.current)

  var utcTime = moment.utc('2021-08-07 13:00:57', 'YYYY-MM-DD HH:mm:ss').local().format('YYYY-MM-DD HH:mm:ss');
  //For customized message modal
  const handleOpenCustomizedMessageModal = (e: any) => {
    e.preventDefault()
    setShowCustomizedPersonalMessageModal(true)
  }

  const handleCloseCustomizedMessageModal = () => {
    if (showCustomizedPersonalMessageModal) setShowCustomizedPersonalMessageModal(false)
  }

  const handleOpenMultiRecipientMessageModal = (e: React.MouseEvent) => {
    e && e.preventDefault()
    userAction.showMultiRecipientMessageModal(true)
  }

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
              <div className="row justify-content-center create-manager-panel">
                <div className="col-xl-10 col-md-12">
                  <div className="dashboard-heading-panel">
                    <div className="d-flex justify-content-between">
                      <div className="dashboard-heading-panel-inner">
                        <div className="dashboard-heading-profile">
                          <div className="dashboard-heading-profile-inner">
                            {
                              (userSelector && userSelector.avatar && userSelector.avatar.thumb)
                                ?
                                <img src={userSelector.avatar.thumb} height={'100px'} width={'100px'} />
                                :
                                (<span>{getNameInitials(userSelector?.username)}</span>)
                            }
                            {/* <img src={userSelector && userSelector.avatar && userSelector.avatar.thumb ? userSelector.avatar.thumb : STATIC_URL.USER.AVATAR} height={'100px'} width={'100px'} /> */}
                          </div>
                          <span className={userSelector && userSelector.visible_status ? 'dashboard-tag st-' + userSelector.visible_status : 'dashboard-tag st-1'} />

                        </div>
                        <div className="dashboard-heading-content">
                          <h3>Welcome!</h3>
                          <h4 style={{
                            color: getSubscriptionColor(userSelector)
                          }}>
                            {userSelector && userSelector.username ? userSelector.username : '..'}
                            {
                              (
                                userSelector && userSelector.badge_data &&
                                userSelector.badge_data.current_badge
                                && (new Date(userSelector.badge_data.expiry_date.replaceAll("-", "/")).getTime() > new Date().getTime())
                              )
                                ?
                                <img src={userSelector?.badge_data?.current_badge?.icon?.original} height={30} width={30} className="m-2" alt="" />
                                : ''
                            }
                          </h4>
                        </div>
                      </div>
                      {/* <div className="dashboard-heading-btn">
                        <a href="#" onClick={(e) => handleOpenCustomizedMessageModal(e)} >About <i className="arrow" /></a>
                      </div> */}
                    </div>
                    <p>Here are some quick actions to get you started</p>
                  </div>
                  <div className="dashborad-block-panel">
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="dashborad-block">
                          <div className="d-flex justify-content-end dashborad-block-pic">
                            <img src="img/dashboard-icon-1.png" />
                          </div>
                          <div className="dashborad-block-content">
                            <h2>My Notebook</h2>
                            <p>Have always all your notes with you at any given time. Share them with your friends, permit others to edit them. Two and more brains are always better than one :)</p>
                          </div>
                          {/* <a href="#" className="dashborad-block-btn waves-effect">Add Note</a> */}
                          <Link to={URLS.USER.NOTEBOOK} className="dashborad-block-btn waves-effect">Add Note</Link>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="dashborad-block">
                          <div className="d-flex justify-content-end dashborad-block-pic">
                            <img src="img/dashboard-icon-2.png" />
                          </div>
                          <div className="dashborad-block-content">
                            <h2>My Voicemails</h2>
                            <p>Accessible 24/7, your contacts are always reachable. Do you need prior preparation to call back someone? take your time and send them a VoiceMail!!</p>
                          </div>
                          {/* <a href="#" className="dashborad-block-btn waves-effect">Send Voicemail</a> */}
                          <Link to={URLS.USER.MANAGE_VOICE_MAIL} className="dashborad-block-btn waves-effect">Send Voicemail</Link>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="dashborad-block">
                          <div className="d-flex justify-content-end dashborad-block-pic">
                            <img src="img/dashboard-icon-3.png" />
                          </div>
                          <div className="dashborad-block-content">
                            <h2>My Video Messages</h2>
                            <p>Get even closer to yours, save time texting and make your messages more emotional and add a personal touch by sending a VideoMessage instead of a simple text or image. </p>
                          </div>
                          {/* <a href="#" className="dashborad-block-btn waves-effect">Send Video Message</a> */}
                          <Link to={URLS.USER.MANAGE_VIDEO_MESSAGE} className="dashborad-block-btn waves-effect">Send Video Message</Link>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="dashborad-block">
                          <div className="d-flex justify-content-end dashborad-block-pic">
                            <img src="img/dashboard-icon-4.png" />
                          </div>
                          <div className="dashborad-block-content">
                            <h2>Multi-recipient Message</h2>
                            <p>Sometimes contact list reaches hundreds or even thousands of users, you can send your messages to all when it comes to reminders, greetings and much more… save time sending them a message in one click using Multi-Recipient Message.</p>
                          </div>
                          <a href="#" onClick={(e) => handleOpenMultiRecipientMessageModal(e)} className="dashborad-block-btn waves-effect">Send Message</a>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              {/* end row */}
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
      {
        showCustomizedPersonalMessageModal ?
          <CustomizedPersonalMessageModal
            title="Change about Message"
            onClose={handleCloseCustomizedMessageModal}
            shouldShow={showCustomizedPersonalMessageModal}
          /> : null
      }

      {
        isOpenMultiRecipientMessageModal ?
          <MultiRecipientMessageModal
            shouldShow={isOpenMultiRecipientMessageModal}
          /> : null
      }
    </React.Fragment>
  )
}
