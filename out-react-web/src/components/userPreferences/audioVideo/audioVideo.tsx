import React, { useState } from 'react'
import { toast } from 'react-toastify';
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';
import AudioSetting from './audio';
import VideoSetting from './video';


function AudioVideoSetting() {
  const [activeTab, setActiveTab] = useState('audio')
  const preference = useUserPreferenceApi();


  const handleTabChange = (e: any, tab: string) => {
    e.preventDefault()
    setActiveTab(tab)
    handleInnerTabChange(tab)
  }

  const handleInnerTabChange = (selectTab: string) => {
    let params = {
      tab: selectTab === 'audio' ? 'audio_setup' : 'video_setup'
    }
    preference.callGetUserPreference(params, (message: string, resp: any) => {

    }, (message: string) => {
      toast.error(message)
    })
  }

  return (
    <React.Fragment>
      <div className="right-menu-details dark-box-inner inner_pre_sec">
        <ul className="nav nav-tabs custom-tab" role="tablist">
          <li className="nav-item">
            <a className={activeTab == 'audio' ? "nav-link active nav-link" : "nav-link"} onClick={(e) => handleTabChange(e, 'audio')} data-bs-toggle="tab" href="#" role="tab" aria-selected={activeTab == 'audio' ? true : false}>
              <span >Audio</span>
            </a>
          </li>
          <li className="nav-item">
            <a className={activeTab == 'video' ? "nav-link active nav-link" : "nav-link"} onClick={(e) => handleTabChange(e, 'video')} data-bs-toggle="tab" href="#" role="tab" aria-selected={activeTab == 'video' ? true : false}>
              <span>Video</span>
            </a>
          </li>
        </ul>

        {
          activeTab == 'audio' ?
            <AudioSetting />
            :
            <VideoSetting />
        }
      </div>
    </React.Fragment >
  )
}

export default AudioVideoSetting
