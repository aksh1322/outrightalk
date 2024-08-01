import React, { useState, useEffect } from 'react'
import clsx from 'clsx';
import { USER_PREFERANCE_TAB } from 'src/_config'

interface UserPreferenceProps {
  getActiveTab: (tab: string) => void
}

function LeftMenuSidebar({ getActiveTab }: UserPreferenceProps) {

  const [activeTab, setActiveTab] = useState('general');
  const activeTabFromStorage = localStorage.getItem(USER_PREFERANCE_TAB.ACTIVE_TAB);

  useEffect(() => {
    if (activeTabFromStorage) {
      setActiveTab(activeTabFromStorage)
      getActiveTab(activeTabFromStorage)
    }
  }, [activeTabFromStorage])


  useEffect(() => {
    return () => {
      localStorage.setItem(USER_PREFERANCE_TAB.ACTIVE_TAB, '');
    }
  }, [])

  const changeTabHandle = (e: any, tab: string) => {
    e.preventDefault()
    getActiveTab(tab)
    localStorage.setItem(USER_PREFERANCE_TAB.ACTIVE_TAB, tab);
    setActiveTab(tab)
  }

  return (
    <React.Fragment>
      <div className="left-menu-list dark-box-inner">
        <ul>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'general',
                })
              }
              onClick={(e) => changeTabHandle(e, 'general')}>General</a>
          </li>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'profile',
                })
              }
              onClick={(e) => changeTabHandle(e, 'profile')}>My Profile</a>
          </li>
          {/* <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'file-saving',
                })
              }
              onClick={(e) => changeTabHandle(e, 'file-saving')}>File Saving</a>
          </li> */}
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'my-accounts',
                })
              }
              onClick={(e) => changeTabHandle(e, 'my-accounts')}>My Accounts</a>
          </li>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'notebook',
                })
              }
              onClick={(e) => changeTabHandle(e, 'notebook')}>My Notebook</a>
          </li>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'room',
                })
              }
              onClick={(e) => changeTabHandle(e, 'room')}>Room &amp; PM</a>
          </li>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'privacy',
                })
              }
              onClick={(e) => changeTabHandle(e, 'privacy')}>Privacy</a>
          </li>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'chat',
                })
              }
              onClick={(e) => changeTabHandle(e, 'chat')}>Chat History</a>
          </li>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'voicemail-messages',
                })
              }
              onClick={(e) => changeTabHandle(e, 'voicemail-messages')}>VoiceMail Messages</a>
          </li>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'video-messages',
                })
              }
              onClick={(e) => changeTabHandle(e, 'video-messages')}>Video Messages</a>
          </li>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'location',
                })
              }
              onClick={(e) => changeTabHandle(e, 'location')}>Location</a>
          </li>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'audio-setup',
                })
              }
              onClick={(e) => changeTabHandle(e, 'audio-setup')}>Audio &amp; Video Setup</a>
          </li>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'auto-reply',
                })
              }
              onClick={(e) => changeTabHandle(e, 'auto-reply')}>Auto Reply Message</a>
          </li>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'banner-ads',
                })
              }
              onClick={(e) => changeTabHandle(e, 'banner-ads')}>Banner Ads</a>
          </li>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'manage-lists',
                })
              }
              onClick={(e) => changeTabHandle(e, 'manage-lists')}>Manage Lists</a>
          </li>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'alert',
                })
              }
              onClick={(e) => changeTabHandle(e, 'alert')}>Alert &amp; Sounds</a>
          </li>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'apperance',
                })
              }
              onClick={(e) => changeTabHandle(e, 'apperance')}>Appearance</a>
          </li>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'parental',
                })
              }
              onClick={(e) => changeTabHandle(e, 'parental')}>Parental Control</a>
          </li>
          <li>
            <a href="#"
              className={
                clsx({
                  'active': activeTab === 'connection',
                })
              }
              onClick={(e) => changeTabHandle(e, 'connection')}>Connection</a>
          </li>
        </ul>
      </div>
    </React.Fragment>
  )
}

export default LeftMenuSidebar
