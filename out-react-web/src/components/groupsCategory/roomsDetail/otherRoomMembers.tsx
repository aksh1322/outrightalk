import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAppGroupCategoryAction } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook';
import { useAppRoomDetailsSelector, useAppRoomOthersMemberModalOpen, useAppUpdateRoomUserVideoUrl, useAppRoomMembersLargeViewSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import moment from 'moment';
import { useParams } from 'react-router';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector';
import { CRYPTO_SECRET_KEY, LOGIN_STORAGE, MAX_VIDEO_PLAYER_COUNT, unscribePlayVideoTime } from 'src/_config';
import StreamAndVideoPlayer from './StreamAndVideoPlayer';
import { useCallContext } from 'src/hooks'
import { LocalParticipant, RemoteParticipant } from 'sendbird-calls'
// import { MediaSettingsContext } from 'src/containers/groupsCategory/roomsDetail/roomsDetails';
const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);
interface OtherRoomMembersProps {
    // roomMembers: any[]
    // myLocalData: any,
    // participants: any,
    // getClosedStreams: any
    otherCamsOpenClose: boolean,
}

function OtherRoomMembers({
    // myLocalData,
    // participants,
    // getClosedStreams
    //  streams, session
    otherCamsOpenClose,
}: OtherRoomMembersProps) {

    const {remoteParticipants,currentCallMembers, disabledViews, currentCallRoomId} = useCallContext()

    const value = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS)
      const {
        id: userId,
        send_bird_user: { sb_access_token },
      } = value ? JSON.parse(value) : {
        id: null,
        send_bird_user: { sb_access_token: null }
      };

    useEffect(() => {
      console.log('%cRemote Participants Changed', 'background: red; fontsize: 1.5rem; color: white; padding: 1rem;')
    }, [remoteParticipants])
    
    // const videoFilteration = (participants:(RemoteParticipant | LocalParticipant)[]):(RemoteParticipant | LocalParticipant)[] => {
    //     if(!participants) return []
    //     if(participants?.length <= 0) return []
    //     const result = participants.filter(mem => {
    //         debugger
    //         let flag = false;
    //         if(mem?.isVideoEnabled) flag = true;
    //         else flag = false;
    //         debugger 
    //         if(+mem?.user.userId !== +userId) flag = true;
    //         else flag = false; 
    //         // if(disabledViews && disabledViews[currentCallRoomId]?.includes(`${mem?.user?.userId}`)) flag = false;
    //         // else flag = true;
    //         return flag;
    //     })
    //     return result
    // }
    const currentMembersWithVideo = currentCallMembers
      .filter(mem => {
        return mem?.isVideoEnabled
      })
      .filter(mem => {
        return +mem?.user?.userId !== userId
      }).map(mem => {
        return mem?.user?.userId
      })

    
    return (
        <React.Fragment>
            {/* <div className={true ? "other-cams-visible large-video-thumb-wrap small_video_view" : "other-cams-hidden large-video-thumb-wrap small_video_view"}> */}
            <div className={`${otherCamsOpenClose ? 'd-flex': 'd-none'} flex-wrap mb-4`} style={{gap: '1rem'}}>
                {
                    remoteParticipants && remoteParticipants.length > 0 &&
                        remoteParticipants.map((member, index) => {
                                    return (
                                        <StreamAndVideoPlayer
                                            key={member.user.userId}
                                            member={member}
                                            currentMembersWithVideo={currentMembersWithVideo}
                                            // videoPlayerCount={index + 1}
                                            // videoPlayLimit={videoPlayLimit}
                                            // handleStaticVideoPlay={handleStaticVideoPlay}
                                            // handleCloseWebCam={handleCloseWebCam}
                                            // stopWebStream={stopWebStream}

                                            // id={members.participant_id}
                                            // track={members.participant_track}
                                            // name={members.participant_name}
                                        />
                                    )

                        })
                }
            </div>
        </React.Fragment >
    )
}

export default OtherRoomMembers 