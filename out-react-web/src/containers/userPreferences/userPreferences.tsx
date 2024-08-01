import React, { useEffect, useState } from 'react';
import Header from 'src/components/common/Header';
import Sidebar from 'src/components/common/Sidebar';
import BannerShow from '../../components/common/banner';
import UserPreferencesBannerShow from '../../components/common/userPreferencesBanner';
import ActiveRoomPopDown from 'src/components/common/activeRoom/activeRoom';
import { useAppIsOpenActiveRoomSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import { useToaster } from '../../_common/hooks/actions/common/appToasterHook';
import ActivePmWindowPopDown from 'src/components/pm-room/common/activePmWindow';
import { useAppIsOpenActivePmWindowSelector } from 'src/_common/hooks/selectors/pmWindowSelector';
import LeftMenuSidebar from 'src/components/userPreferences/leftMenuSidebar';
import GeneralSetting from 'src/components/userPreferences/general';
import ProfileSetting from 'src/components/userPreferences/profile';
import VoiceMailMsg from 'src/components/userPreferences/voiceMailMsg';
import VideoMailMsgSetting from 'src/components/userPreferences/videoMailMsg';
import FileSavingSetting from 'src/components/userPreferences/fileSaving';
import NoteBookSetting from 'src/components/userPreferences/notebook';
import RoomSetting from 'src/components/userPreferences/room';
import PrivacySetting from 'src/components/userPreferences/privacy';
import ChatSetting from 'src/components/userPreferences/chat';
import LocationSetting from 'src/components/userPreferences/location';
import AudioVideoSetting from 'src/components/userPreferences/audioVideo/audioVideo';
import AutoReplySetting from 'src/components/userPreferences/autoReply';
import BannerAdsSetting from 'src/components/userPreferences/bannerAds';
import AlertSetting from 'src/components/userPreferences/alert';
import ParentalSetting from 'src/components/userPreferences/parental';
import ManageContactLists from 'src/components/userPreferences/contactList/contactList';
import MyAccountManage from 'src/components/userPreferences/myAccount';
import ConnectionSetting from 'src/components/userPreferences/connection';
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';
import { useHistory } from 'react-router';
import { URLS } from 'src/_config';


export default function FindAndAddUser() {
    const isOpenActiveRoomPopDown = useAppIsOpenActiveRoomSelector()
    const isOpenActivePmWindowPopDown = useAppIsOpenActivePmWindowSelector()
    const [activeTab, setActiveTab] = useState('general');
    const preference = useUserPreferenceApi();
    const history = useHistory()
    const toast = useToaster()

    const getActiveTab = (tab: string) => {
        setActiveTab(tab)
    }

    const handleExitButton = () => {
        history.push(URLS.USER.DASHBOARD)
    }

    useEffect(() => {
        if (activeTab) {
            let params = {
                tab: activeTab.replace(/-/g, '_')
            }
            preference.callGetUserPreference(params, (message: string, resp: any) => {
                // toast.success(message)
            }, (message: string) => {
                toast.error(message)
            })
        }

    }, [activeTab])

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
                                        <h1>My Preferences</h1>
                                        <button type="button"
                                            className="btn theme-btn btn-primary mr-2 waves-effect"
                                            onClick={handleExitButton}
                                        >
                                            Close
                                        </button>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <LeftMenuSidebar
                                                getActiveTab={getActiveTab}
                                            />
                                        </div>
                                        <div className="col-sm-9">
                                            {activeTab === 'general' ?
                                                <GeneralSetting /> : null}
                                            {activeTab === 'profile' ?
                                                <ProfileSetting /> : null}
                                            {activeTab === 'voicemail-messages' ?
                                                <VoiceMailMsg /> : null}
                                            {activeTab === 'video-messages' ?
                                                <VideoMailMsgSetting /> : null}
                                            {/* {activeTab === 'file-saving' ?
                                                <FileSavingSetting /> : null} */}
                                            {activeTab === 'notebook' ?
                                                <NoteBookSetting /> : null}
                                            {activeTab === 'room' ?
                                                <RoomSetting /> : null}
                                            {activeTab === 'privacy' ?
                                                <PrivacySetting /> : null}
                                            {activeTab === 'chat' ?
                                                <ChatSetting /> : null}
                                            {activeTab === 'location' ?
                                                <LocationSetting /> : null}
                                            {activeTab === 'audio-setup' ?
                                                <AudioVideoSetting /> : null}
                                            {activeTab === 'auto-reply' ?
                                                <AutoReplySetting /> : null}
                                            {activeTab === 'banner-ads' ?
                                                <BannerAdsSetting /> : null}
                                            {activeTab === 'alert' ?
                                                <AlertSetting /> : null}
                                            {activeTab === 'parental' ?
                                                <ParentalSetting /> : null}
                                            {activeTab === 'manage-lists' ?
                                                <ManageContactLists /> : null}
                                            {activeTab === 'my-accounts' ?
                                                <MyAccountManage /> : null}
                                            {activeTab === 'connection' ?
                                                <ConnectionSetting /> : null}
                                            {['apperance'].includes(activeTab) ?
                                                <span>No setting Found</span> : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* end row */}
                        </div>
                        {/* container-fluid */}



                    </div>
                    <UserPreferencesBannerShow />
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