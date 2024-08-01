import React, { useEffect, useState } from 'react';
import { useAppRoomDetailsSelector } from 'src/_common/hooks/selectors/groupCategorySelector'
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector'
import { useAppGroupCategoryAction } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook';
import moment from 'moment';
interface OwnVideoPlayerProps {
    // roomDetailsData: any;
    ownVideoUrl: any;
}


export const OwnVideoPlayer = ({ ownVideoUrl }: OwnVideoPlayerProps) => {
    const userSelector = useAppUserDetailsSelector()
    const roomDetailsSelector = useAppRoomDetailsSelector()
    const groupCategoryAction = useAppGroupCategoryAction()
    const [startVideo, setStartVideo] = useState<any>(null)

    const handleVideoEnded = (e: any, ownVideoUrl: any) => {
        groupCategoryAction.roomMembersVideoUrlEmpty({ user_id: ownVideoUrl.user_id, room_id: ownVideoUrl.room_id })
    }

    const handleToggleMute = () => {
        var video: any = document.getElementById('ownvideo');
        if (video) {
            video.muted = !video.muted;
        }
    }

    const handlePlayPause = () => {
        //time start calculation
        var uploadTime = moment.utc(ownVideoUrl.is_uploadvideo.upload_time, 'YYYY-MM-DD HH:mm:ss').local().format("YYYY-MM-DD HH:mm:ss");
        var pcLocalTimeNow: any;
        switch (Math.sign(roomDetailsSelector.diffBtwSerLcl)) {
            case 1:
                pcLocalTimeNow = moment().subtract(roomDetailsSelector.diffBtwSerLcl, 'seconds').format("YYYY-MM-DD HH:mm:ss");
                break;
            case -1:
                pcLocalTimeNow = moment().add(Math.abs(roomDetailsSelector.diffBtwSerLcl), 'seconds').format("YYYY-MM-DD HH:mm:ss");
                break;
            case 0:
                pcLocalTimeNow = moment().add(Math.abs(roomDetailsSelector.diffBtwSerLcl), 'seconds').format("YYYY-MM-DD HH:mm:ss");
                break;
        }

        var diff = moment(pcLocalTimeNow, "YYYY-MM-DD HH:mm:ss").diff(moment(uploadTime, "YYYY-MM-DD HH:mm:ss"))
        var diffInMinutes = moment.duration(diff);
        let timeStart = diffInMinutes.seconds();
        setStartVideo(timeStart)
    }

    useEffect(() => {
        handlePlayPause()
        setTimeout(() => {
            var video: any = document.getElementById('ownvideo');
            if (video) {
                video.play()
            }
        }, 1000)
    }, [ownVideoUrl])

    return (
        <React.Fragment>
            <div className="webcam-body">
                {ownVideoUrl && ownVideoUrl.is_uploadvideo && ownVideoUrl.is_uploadvideo.video_file ?
                    <>
                        {/* {startVideo ?
                            <video id="ownvideo" onEnded={(e) => handleVideoEnded(e, ownVideoUrl)} width="100%" height="120px" autoPlay>
                                <source id="source" src={ownVideoUrl.is_uploadvideo.video_file.original + '#t=' + startVideo}></source>
                            </video>
                            :
                            <div>
                                <button onClick={handlePlayPause}>Play</button>
                            </div>
                        } */}
                        <video id="ownvideo" onEnded={(e) => handleVideoEnded(e, ownVideoUrl)} width="100%" height="120px">
                            <source id="source" src={ownVideoUrl.is_uploadvideo.video_file.original + '#t=' + startVideo}></source>
                        </video>
                        {/* <button onClick={handlePlayPause}>Play</button>
                        <button onClick={handleToggleMute}>Mute/Unmute</button> */}

                    </>
                    : 'no url found'}

            </div>
        </React.Fragment>
    )
}