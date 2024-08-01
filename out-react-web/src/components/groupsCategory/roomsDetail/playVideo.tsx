import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAppGroupCategoryAction } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook';
import { useAppRoomDetailsSelector, useAppRoomOthersMemberModalOpen, useAppUpdateRoomUserVideoUrl, useAppRoomMembersLargeViewSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import moment from 'moment';
import SweetAlert from 'react-bootstrap-sweetalert';
import { useParams } from 'react-router';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector';
import { CRYPTO_SECRET_KEY } from 'src/_config';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);
interface PlayVideoProps {
    roomMembers: any[],
    isPlayVideoShow: boolean
}

function PlayVideo({
    roomMembers,
    isPlayVideoShow
}: PlayVideoProps) {

    const roomDetailsSelector = useAppRoomDetailsSelector()
    const userSelector = useAppUserDetailsSelector()
    const [alert, setAlert] = useState<any>(null);
    const groupCategoryApi = useGroupCategoryApi();
    const groupCategoryAction = useAppGroupCategoryAction()
    const { groupId, roomId } = useParams<any>();
    const r_id: number = parseInt(cryptr.decrypt(roomId));
    const [videoShowId, setVideoShowId] = useState<any>([])


    const handlePlayVideo = (videoInfo: any, videoId: number) => {
        let elementImg = document.getElementById('img-' + videoId);
        if (elementImg) {
            elementImg.style.display = "none";
        }
        let elementBtn = document.getElementById('btn-' + videoId);
        if (elementBtn) {
            elementBtn.style.display = "none";
        }
        let tempVideoShowId = [...videoShowId];
        tempVideoShowId.push({ videoId: videoId, videoInfo: videoInfo })
        setVideoShowId(tempVideoShowId)
    }


    const hideAlert = () => {
        setAlert(null);
    }

    const showAcceptAlert = (videoId: any) => {
        setAlert(
            <SweetAlert
                warning
                showCancel
                confirmBtnText="Yes"
                cancelBtnText="Cancel"
                cancelBtnBsStyle="danger"
                confirmBtnBsStyle="success"
                reverseButtons={true}
                allowEscape={false}
                closeOnClickOutside={false}
                title={'Accept Video'}
                onConfirm={() => handleAcceptVideo(videoId)}
                onCancel={hideAlert}
                focusCancelBtn={true}
            >
                {`Accepting the video will allow other users in the room to watch this video. Are you sure?`}
            </SweetAlert>
        );
    }

    const handleAcceptVideo = (videoId: any) => {
        hideAlert()
        const params = {
            record_id: videoId,
            room_id: r_id
        };
        groupCategoryApi.callRoomMenuPlayAcceptVideo(params, (message: string, resp: any) => {
            if (resp) {

            }
        }, (message: string) => {

        })
    }

    const showRejectAlert = (videoId: any) => {
        setAlert(
            <SweetAlert
                warning
                showCancel
                confirmBtnText="Yes"
                cancelBtnText="Cancel"
                cancelBtnBsStyle="danger"
                reverseButtons={true}
                confirmBtnBsStyle="success"
                allowEscape={false}
                closeOnClickOutside={false}
                title={'Reject Video'}
                onConfirm={() => handleRejectVideo(videoId)}
                onCancel={hideAlert}
                focusCancelBtn={true}
            >
                {`Are you sure to reject this video?`}
            </SweetAlert>
        );
    }

    const handleRejectVideo = (videoId: any) => {
        hideAlert()
        const params = {
            record_id: videoId,
            // room_id: r_id
        };
        groupCategoryApi.callRoomMenuPlayRejectVideo(params, (message: string, resp: any) => {
            if (resp) {
            }
        }, (message: string) => {

        })
    }

    const showRemoveAlert = (e: any, videoId: any) => {
        e.preventDefault()
        setAlert(
            <SweetAlert
                warning
                showCancel
                confirmBtnText="Yes"
                cancelBtnText="Cancel"
                cancelBtnBsStyle="danger"
                reverseButtons={true}
                confirmBtnBsStyle="success"
                allowEscape={false}
                closeOnClickOutside={false}
                title={'Remove Video'}
                onConfirm={() => handleRemoveVideo(videoId)}
                onCancel={hideAlert}
                focusCancelBtn={true}
            >
                {`Are you sure to remove this video?`}
            </SweetAlert>
        );
    }

    const handleRemoveVideo = (videoId: any) => {

        hideAlert()
        if (userSelector && roomDetailsSelector.play_video && roomDetailsSelector.play_video.length) {


            let findVideo = roomDetailsSelector.play_video.filter((x: any) => x.id == videoId)
            if (findVideo && findVideo.length) {

                let removeVideoId = findVideo[0].users.filter((z: any) => z.user_id == userSelector.id)
                if (removeVideoId && removeVideoId.length) {
                    const params = {
                        record_id: removeVideoId[0].id,
                        room_id: r_id
                    };
                    groupCategoryApi.callRoomMenuPlayRemoveVideo(params, (message: string, resp: any) => {
                        if (resp) {
                            let parmas = {
                                type: 'removed',
                                video_info: {
                                    id: videoId,
                                    room_id: r_id
                                }
                            }
                            groupCategoryAction.roomPlayVideo(parmas)
                        }
                    }, (message: string) => {

                    })
                }
            }
        }
    }

    const checkShowOrNot = (data: any) => {
        if (data && data.length && userSelector) {
            let find = data.filter((x: any) => x.user_id == userSelector.id)
            if (find && find.length) {
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }

    return (
        <React.Fragment>
            {alert}
            {/* <div className={roomOthersMemberModalSelector ? "other-cams-visible active-room-wrapper other-online" : "other-cams-hidden active-room-wrapper other-online"}> */}
            <div className={isPlayVideoShow ? "other-cams-visible large-video-thumb-wrap" : "other-cams-hidden large-video-thumb-wrap"}>
                {/* <div className={"large-video-thumb-wrap"}> */}
                {roomDetailsSelector && userSelector && roomDetailsSelector.play_video && roomDetailsSelector.play_video.length ? roomDetailsSelector.play_video.map((members: any, index: any) => (


                    <div key={members.id} className={checkShowOrNot(members.users) ? "large-video-box" : "other-cams-hidden"}>
                        {
                            <>
                                {members.is_accepted == 1 ?
                                    <a href="#" onClick={(e) => showRemoveAlert(e, members.id)} className="close-large-box"><img src="/img/close-icon.png" alt="" /></a> : null}

                                {roomDetailsSelector && roomDetailsSelector.room && roomDetailsSelector.room.join_status && roomDetailsSelector.room.join_status.is_admin && [1, 2, 3].includes(roomDetailsSelector.room.join_status.is_admin) && members.is_accepted == 0 ?
                                    <>
                                        <div className="accept-reject-btn-wrap">
                                        <button type="button" className="btn btn-success"
                                            onClick={() => showAcceptAlert(members.id)}
                                        >
                                            Accept
                                        </button>
                                        <button type="button" className="btn btn-danger"
                                            onClick={() => showRejectAlert(members.id)}
                                        >
                                            Reject
                                        </button>
                                        </div>

                                    </> : null
                                }
                                <video id={`myVideo-${members.id}`} width="100%" height="350px" controls disablePictureInPicture controlsList="nofullscreen nodownload">
                                    <source id="source" src={members.play_video_file.original} type="video/mp4"></source>
                                </video>
                            </>
                        }
                        {/* <div className="large-video-box-name">
                            {
                               'lorem ipsum'
                            }
                        </div> */}
                    </div>
                )) : null
                }
            </div>
        </React.Fragment >
    )
}

export default PlayVideo