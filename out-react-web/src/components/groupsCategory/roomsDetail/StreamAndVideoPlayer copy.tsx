import React, { useEffect, useState } from 'react'
// import useAntMediaHook from 'src/hooks/useAntMedia';
import { useAppRoomDetailsSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector';
import { getSubscriptionColor } from 'src/_config';
// import VideoCard from './VideoCard';

const StreamAndVideoPlayer = ({
    members,
    handleCloseWebCam,
    handleStaticVideoPlay,
    stopWebStream,
    videoPlayLimit,
    videoPlayerCount,
    id,
    track,
    name,
}: {
    members: any,
    videoPlayLimit: number,
    videoPlayerCount: number,
    handleCloseWebCam: (e: any, memberId: any) => void,
    handleStaticVideoPlay: (membersId: number, isCameraOn: number, is_uploadvideo: any) => void,
    stopWebStream: (video_stream_id: string) => void,
    id: any,
    track: any,
    name: any,
}) => {

    // const { onStartPlaying } = useAntMediaHook();
    const roomDetailsSelector = useAppRoomDetailsSelector()
    const userSelector = useAppUserDetailsSelector();

    const [largeView, setLargeView] = useState<boolean>(false);
    const [largeViewAccess, setLargeViewAccess] = useState<boolean>(false);
    const [showVideoPlayer, setShowVideoPlayer] = useState<boolean>(false)

    useEffect(() => {
        setShowVideoPlayer(false)
    }, [])

    useEffect(() => {
        if (userSelector?.is_subscribed && userSelector.is_subscribed?.plan_info) {
            const planId = userSelector.is_subscribed.plan_info.id;

            if (planId > 5 && planId < 9) {
                setLargeViewAccess(true)
            }
        }
    }, [userSelector])
    
    return (
        <div
            key={members.id}
            className={(members.is_cemera || members.is_uploadvideo) ? `large-video-box  ${(largeViewAccess && largeView) ? 'large-video-large-box' : 'large-video-small-box'}` : "other-cams-hidden"} id={'subscriber-' + members.user_id}
        >
            <>
                <a href="#" onClick={(e) => {
                    handleCloseWebCam(e, members.user_id)
                    setShowVideoPlayer(false);
                }} className="close-large-box other-cams-hidden" id={"videoclose-" + members.user_id}><img src="/img/close-icon.png" alt="" /></a>
                <img className={"force-banner-show"} src={"/img/no-image-webcam.png"} alt="" id={"img-" + members.user_id} />
                <button
                    onClick={() => {
                        if (roomDetailsSelector && roomDetailsSelector.user && (videoPlayerCount <= videoPlayLimit)) {
                            // onStartPlaying(`${members.video_stream_id}`, stopWebStream);
                            setShowVideoPlayer(true);
                            handleStaticVideoPlay(members.user_id, members.is_cemera, members.is_uploadvideo)
                        }
                    }}
                    className={`btn-utw ${(largeViewAccess && largeView) ? 'btn-utw-large' : 'btn-utw-small'}`}
                    id={"btn-" + members.user_id}
                    type="button"
                    disabled={members.is_cemera || members.is_uploadvideo ? false : true}
                >
                    {(videoPlayerCount <= videoPlayLimit) ? 'Enable Video' : 'Upgrade Now'}
                </button>
            </>
            {/* <video className={`remoteVideo-${members.video_stream_id}`} style={{display: showVideoPlayer ? 'block' : 'none'}} autoPlay disablePictureInPicture></video>                 */}
            {/* <VideoCard
                id={id}
                track={track}
                autoPlay
                name={name}
                style={{ display: showVideoPlayer ? 'block' : 'none' }}
                disablePictureInPicture
            /> */}
            <div className={`large-video-box-name ${(largeViewAccess && largeView) ? 'large-video-box-large-name' : 'large-video-box-small-name'}`}>
                <span style={{
                    color: getSubscriptionColor(
                        members.details
                    ),
                }}>
                    {
                        members.customize_nickname ?
                            members.customize_nickname.nickname :
                            members.details.username
                    }
                </span>
                <span>
                    {
                        largeViewAccess && (
                            (largeView) ?
                                // (largeViewAccess && largeView) ?
                                <span onClick={() => setLargeView(false)}>
                                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                        <path d="M9 9V3H7V5.59L3.91 2.5L2.5 3.91L5.59 7H3V9H9ZM21 9V7H18.41L21.5 3.91L20.09 2.5L17 5.59V3H15V9H21ZM3 15V17H5.59L2.5 20.09L3.91 21.5L7 18.41V21H9V15H3ZM15 15V21H17V18.41L20.09 21.5L21.5 20.09L18.41 17H21V15H15Z" fill="white" />
                                    </svg>
                                </span>
                                :
                                <span onClick={() => setLargeView(true)}>
                                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                        <path d="M3 21V15H5V17.6L8.1 14.5L9.5 15.9L6.4 19H9V21H3ZM15 21V19H17.6L14.5 15.9L15.9 14.5L19 17.6V15H21V21H15ZM8.1 9.5L5 6.4V9H3V3H9V5H6.4L9.5 8.1L8.1 9.5ZM15.9 9.5L14.5 8.1L17.6 5H15V3H21V9H19V6.4L15.9 9.5Z" fill="white" />
                                    </svg>
                                </span>
                        )
                    }
                </span>
            </div>
        </div>
    )
}

export default StreamAndVideoPlayer