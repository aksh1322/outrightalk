import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAppGroupCategoryAction } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook';
import { useAppRoomDetailsSelector, useAppRoomOthersMemberModalOpen, useAppUpdateRoomUserVideoUrl, useAppRoomMembersLargeViewSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import moment from 'moment';
import { useParams } from 'react-router';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector';
import { CRYPTO_SECRET_KEY, MAX_VIDEO_PLAYER_COUNT, unscribePlayVideoTime } from 'src/_config';
import StreamAndVideoPlayer from './StreamAndVideoPlayer';
// import { MediaSettingsContext } from 'src/containers/groupsCategory/roomsDetail/roomsDetails';
const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);
interface OtherRoomMembersProps {
    roomMembers: any[]
    // myLocalData: any,
    // participants: any,
    getClosedStreams: any
}

function OtherRoomMembers({
    roomMembers,
    // myLocalData,
    // participants,
    getClosedStreams
    //  streams, session
}: OtherRoomMembersProps) {

    const roomOthersMemberModalSelector = useAppRoomOthersMemberModalOpen()
    const groupCategoryAction = useAppGroupCategoryAction()
    const userSelector = useAppUserDetailsSelector()
    const groupCategoryApi = useGroupCategoryApi();
    const { groupId, roomId } = useParams<any>();
    const r_id: number = parseInt(cryptr.decrypt(roomId));
    const videoUrlReceived = useAppUpdateRoomUserVideoUrl()
    const roomDetailsSelector = useAppRoomDetailsSelector()
    const [videoShowId, setVideoShowId] = useState<any>([])
    const [playVideoArr, setPlayVideoArr] = useState<any>([])
    const [videoPlayLimit, setVideoPlayLimit] = useState<number>(1)
    // const mediaSettings = useContext<any>(MediaSettingsContext)

    const enabledButtonReappeared = (membersId: number) => {
        let element = document.getElementById('img-' + membersId);
        if (element) {
            element.style.display = "block";
        }
        let elementBtn = document.getElementById('btn-' + membersId);
        if (elementBtn) {
            elementBtn.style.display = "block";
        }
    }
    
    //user video related update here
    const updateListOfOthermembersForVideoReceived = () => {
        // let tempRoomMembers = listOfOtherMember;
        if (videoUrlReceived && roomDetailsSelector) {

            let foundMember = roomMembers.filter((x: any) => x.user_id == videoUrlReceived.user_id && x.room_id == videoUrlReceived.room_id)
            if (foundMember && foundMember.length) {
                let indexD = roomMembers.findIndex((x: any) => x.user_id === videoUrlReceived.user_id);
                if (indexD >= 0) {
                    // roomMembers[indexD].videoUrl = videoUrlReceived && videoUrlReceived.video_file && videoUrlReceived.video_file.thumb ? videoUrlReceived.video_file.thumb : null;
                    roomMembers[indexD].videoUrl = videoUrlReceived ? videoUrlReceived : null;
                    groupCategoryAction.pushSocketDataToRoomUserVideoUrl(null)
                    // roomMembers[indexD].streamData = null;
                    // setListOfOtherMember(roomMembers)
                }
            }
        }
    }
    useEffect(() => {
        if (videoUrlReceived) {
            updateListOfOthermembersForVideoReceived()
        }
    }, [videoUrlReceived])

    const checkMySubscription = () => {
        if (userSelector?.is_subscribed && userSelector.is_subscribed?.plan_info) {
            const planId = userSelector.is_subscribed.plan_info.id;

            switch (planId) {
                case 4:
                    setVideoPlayLimit(5);
                    break;
                case 5:
                    setVideoPlayLimit(10);
                    break;
                case 6:
                case 7:
                case 8:
                    setVideoPlayLimit(12);
                    break;
                default:
                    setVideoPlayLimit(1);
            }
        }
    }

    useEffect(() => {
        checkMySubscription()
    }, [userSelector])

    const viewMyWebCam = (status: number, memberId: number) => {
        const params = {
            room_id: r_id,
            view_user_id: memberId,
            is_view: status
        };
        groupCategoryApi.callViewMyWebCam(params, (message: string, resp: any) => {
            if (resp) {

            }
        }, (message: string) => {

        })
    }

    const playVideoInfoSet = (memberId: number) => {
        // if loging user is not subscribe then calculate this time other wise always return true
        // is_subscribed
        if (userSelector && userSelector.is_subscribed) {
            return true
        }
        else {
            let temp = [...playVideoArr];
            let foundResult = temp.filter((x: any) => x.memberId == memberId)
            if (foundResult && foundResult.length) {
                if (foundResult[0].spendTime < unscribePlayVideoTime) {
                    let indx = temp.findIndex((x: any) => x.memberId == memberId)
                    if (indx >= 0) {
                        let spendTime = temp[indx].spendTime;
                        // temp[indx].startTime = moment().add(spendTime, 'seconds').format();
                        temp[indx].startTime = moment().format();
                        temp[indx].isPause = 0;
                        setPlayVideoArr(temp)
                        return true
                    }
                } else {
                    return false
                }
            } else {
                temp.push({ memberId: memberId, spendTime: 0, startTime: moment().format(), isPlayable: true, isPause: 0 })
                setPlayVideoArr(temp)
                return true
            }
        }
    }

    const handleStaticVideoPlay = (membersId: number, isCameraOn: number, is_uploadvideo: any) => {
        // console.log('video button clicked')

        //subscription logic function here you can bypass it from here .just  unComment playVideoInfoSet instead of true
        let isPlayVideoOrWebCam = playVideoInfoSet(membersId)
        // let isPlayVideoOrWebCam = true;

        if (isPlayVideoOrWebCam) {

            //update view my cam status
            viewMyWebCam(1, membersId)


            if (!isCameraOn && is_uploadvideo != null) {

                var pcLocalTimeNow: any;
                switch (Math.sign(roomDetailsSelector.diffBtwSerLcl)) {
                    case 1:
                        pcLocalTimeNow = moment().subtract(roomDetailsSelector.diffBtwSerLcl, 'seconds');
                        break;
                    case -1:
                        pcLocalTimeNow = moment().add(Math.abs(roomDetailsSelector.diffBtwSerLcl), 'seconds');
                        break;
                    case 0:
                        pcLocalTimeNow = moment().add(Math.abs(roomDetailsSelector.diffBtwSerLcl), 'seconds');
                        break;
                }
                var endTime = moment.utc(is_uploadvideo.video_end_time, 'YYYY-MM-DD HH:mm:ss').local();

                // if video_end_time >  pcLocalTimeNow then remove video url 

                if (pcLocalTimeNow > endTime) {
                    groupCategoryAction.roomMembersVideoUrlEmpty({ user_id: membersId, room_id: roomDetailsSelector.room.id })

                    //if no is_camera or x.is_uploadvideo found then close else do nothing
                    let streamFound = roomDetailsSelector && roomDetailsSelector.members && roomDetailsSelector.members.length ? roomDetailsSelector.members.filter((x: any) => x.is_cemera == 1 || x.is_uploadvideo != null) : [];
                    if (streamFound && streamFound.length) {
                        // do nothing
                    } else {
                        groupCategoryAction.showRoomOtherMembersModal(false)
                    }


                    toast.error('This stream currently ended')

                }
                else {
                    // else proceed to play video
                    let elementImg = document.getElementById('img-' + membersId);
                    if (elementImg) {
                        elementImg.style.display = "none";
                    }
                    let elementBtn = document.getElementById('btn-' + membersId);
                    if (elementBtn) {
                        elementBtn.style.display = "none";
                    }
                    // setVideoShow(is_uploadvideo)
                    let tempVideoShowId = [...videoShowId];
                    //time start calculation
                    var uploadTime = moment.utc(is_uploadvideo.upload_time, 'YYYY-MM-DD HH:mm:ss').local().format("YYYY-MM-DD HH:mm:ss");

                    // var uploadTime = moment.utc(is_uploadvideo.upload_time, 'YYYY-MM-DD HH:mm:ss').format("YYYY-MM-DD HH:mm:ss");
                    // if(Math.sign(roomDetailsSelector.diffBtwSerLcl)
                    // var pcLocalTimeNow = moment().add(Math.abs(roomDetailsSelector.diffBtwSerLcl), 'seconds').format("YYYY-MM-DD HH:mm:ss");
                    // .add(roomDetailsSelector.diffBtwSerLcl, 'seconds')
                    // console.log('uploadTime', uploadTime)
                    // console.log('now', pcLocalTimeNow)
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

                    let timeStart = '#t=' + diffInMinutes.seconds();
                    tempVideoShowId.push({ membersId: membersId, is_uploadvideo: is_uploadvideo, timeStart: timeStart })
                    setVideoShowId(tempVideoShowId)
                }

            }
            else if (isCameraOn) {
                let element = document.getElementById('img-' + membersId);
                if (element) {
                    element.style.display = "none";
                }
                let elementBtn = document.getElementById('btn-' + membersId);
                if (elementBtn) {
                    elementBtn.style.display = "none";
                }

                let videoCloseBtn = document.getElementById("videoclose-" + membersId);

                if (videoCloseBtn) {
                    videoCloseBtn.classList.remove("other-cams-hidden");
                    videoCloseBtn.style.display = "block";
                }
            }
        }
        else {
            toast.error('limit exceeds for this userVideo Please subscribe and enjoy full video')
        }
    }

    const videoForceStop = (e: any, memberId: number) => {
        e.preventDefault()
        timeCalculateAndPlayTimeUpdate(memberId)
        viewMyWebCam(0, memberId)
        let isExist = videoShowId.findIndex((z: any) => z.membersId == memberId)
        if (isExist >= 0) {
            let tempVideoShowId = [...videoShowId]
            tempVideoShowId.splice(isExist, 1)
            setVideoShowId(tempVideoShowId)
            enabledButtonReappeared(memberId)
        }
    }

    useEffect(() => {
        return (() => {
            groupCategoryAction.showRoomOtherMembersModal(false)
        })
    }, [])

    const handleVideoEnded = (e: any, memberId: number) => {

        timeCalculateAndPlayTimeUpdate(memberId)
        //update view my cam status
        viewMyWebCam(0, memberId)
        enabledButtonReappeared(memberId)
        let indexD = videoShowId.findIndex((z: any) => z.membersId == memberId)
        if (indexD >= 0) {
            let tempVideoShowId = [...videoShowId]
            tempVideoShowId.splice(indexD, 1)
            setVideoShowId(tempVideoShowId)
            groupCategoryAction.roomMembersVideoUrlEmpty({ user_id: memberId, room_id: roomDetailsSelector.room.id })
        }

    }

    const [closedStreams, setClosedStreams] = useState<any>([])

    const handleCloseWebCam = (e: any, memberId: any) => {
        e.preventDefault()
        timeCalculateAndPlayTimeUpdate(memberId)
        viewMyWebCam(0, memberId)
        let videoCloseBtn = document.getElementById("videoclose-" + memberId);
        if (videoCloseBtn) {
            videoCloseBtn.classList.add("other-cams-hidden");
            videoCloseBtn.style.display = "none";
        }
        enabledButtonReappeared(memberId)

        getClosedStreams([...closedStreams, memberId])

        setClosedStreams([...closedStreams, memberId])

    }

    //check this code in different condition##@@
    useEffect(() => {
        if (roomDetailsSelector && roomDetailsSelector.members && roomDetailsSelector.members.length) {
            let streamFound = roomDetailsSelector && roomDetailsSelector.members && roomDetailsSelector.members.length ? roomDetailsSelector.members.filter((x: any) => x.is_cemera == 1 || x.is_uploadvideo != null) : [];
            if (streamFound && streamFound.length) {
                // do nothing
            } else {
                groupCategoryAction.showRoomOtherMembersModal(false)
            }
        }
    }, [roomDetailsSelector])


    //if user is not subscribed every 5 seconds check video is played or not if played stop play after 10sec

    useEffect(() => {
        let interval: any;
        if (playVideoArr && playVideoArr.length) {
            var tempPlayVideoArr = [...playVideoArr];
            interval = setInterval(() => {
                for (let i = 0; i < tempPlayVideoArr.length; i++) {
                    if (tempPlayVideoArr[i].isPause) {
                        //do nothing
                    } else {
                        let currentTime = moment().format();
                        let startTime = tempPlayVideoArr[i].startTime;
                        var diff = moment(currentTime).diff(moment(startTime))
                        var diffInMinutes = moment.duration(diff);
                        var difInSeconds = diffInMinutes.seconds();
                        if (difInSeconds == (unscribePlayVideoTime - tempPlayVideoArr[i].spendTime)) {
                            tempPlayVideoArr[i].spendTime = unscribePlayVideoTime;
                            tempPlayVideoArr[i].isPlayable = false
                            enabledButtonReappeared(tempPlayVideoArr[i].memberId)

                            //video tag remove from dom element after 10sec
                            viewMyWebCam(0, tempPlayVideoArr[i].memberId)
                            let isExist = videoShowId.findIndex((z: any) => z.membersId == tempPlayVideoArr[i].memberId)
                            if (isExist >= 0) {
                                let tempVideoShowId = [...videoShowId]
                                tempVideoShowId.splice(isExist, 1)
                                setVideoShowId(tempVideoShowId)
                                // enabledButtonReappeared(tempPlayVideoArr[i].memberId)
                            }

                        }
                    }
                }
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [playVideoArr]);

    const timeCalculateAndPlayTimeUpdate = (memberId: number) => {
        if (playVideoArr && playVideoArr.length) {
            var tempPlayVideoArr = [...playVideoArr];
            let recordFound = tempPlayVideoArr.filter((x: any) => x.memberId == memberId)
            if (recordFound && recordFound.length) {
                let currentTime = moment().format();
                let startTime = recordFound[0].startTime;
                var diff = moment(currentTime).diff(moment(startTime))
                var diffInMinutes = moment.duration(diff);
                let index = tempPlayVideoArr.findIndex((x: any) => x.memberId == memberId)
                if (index >= 0) {
                    tempPlayVideoArr[index].spendTime = diffInMinutes.seconds();
                    tempPlayVideoArr[index].isPause = 1;
                }
            }
        }
    }

    const stopWebStream = (video_stream_id: string) => {
        const params = {
            room_id: roomDetailsSelector.room.id,
            is_cemera: 0,
            is_device_close: 1,
            video_stream_id
        }

        console.log('function call', params);

        groupCategoryApi.callCameraonOffToggle(params, (message: string, resp: any) => { }, (message: string) => { })
    }

    // console.log("otherRoomMembers mediaSettings.cam----", mediaSettings.cam)
    // console.log("otherRoomMembers  roomMembers----", roomMembers)
    // console.log("otherRoomMembers  participants----", mediaSettings.participants)

    return (
        <React.Fragment>
            {/* <div className={roomOthersMemberModalSelector ? "other-cams-visible active-room-wrapper other-online" : "other-cams-hidden active-room-wrapper other-online"}> */}
            <div className={roomOthersMemberModalSelector ? "other-cams-visible large-video-thumb-wrap small_video_view" : "other-cams-hidden large-video-thumb-wrap small_video_view"}>
                {/* <div className={"large-video-thumb-wrap"}> */}
                {
                    roomMembers && roomMembers.length ?
                        roomMembers.map((members: any, index: any) => {
                            // members.video_stream_id = `stream_${members.user_id}`
                            // let findAny = mediaSettings.cam.find((ele: any) => ele.eventStreamId == members.video_stream_id && ele.isCameraOn == true)
                            // // console.log("otherRoomMembers  findAny----", findAny)

                            // if (findAny) {
                            //     let findParticipantDetails = participants.find((ele: any) => ele.id = findAny.eventStreamId)
                                // console.log("otherRoomMembers  findParticipantDetails----", findParticipantDetails)

                                // if (findAny && findParticipantDetails && members.video_stream_id && index < MAX_VIDEO_PLAYER_COUNT) {
                                if (members.video_stream_id && index < MAX_VIDEO_PLAYER_COUNT) {
                                    return (
                                        <StreamAndVideoPlayer
                                            key={members.id}
                                            members={members}
                                            videoPlayerCount={index + 1}
                                            videoPlayLimit={videoPlayLimit}
                                            handleStaticVideoPlay={handleStaticVideoPlay}
                                            handleCloseWebCam={handleCloseWebCam}
                                            stopWebStream={stopWebStream}

                                            id={members.participant_id}
                                            track={members.participant_track}
                                            name={members.participant_name}
                                        />
                                    )
                                }
                            // }

                        })
                        : null
                }
            </div>
        </React.Fragment >
    )
}

export default OtherRoomMembers 