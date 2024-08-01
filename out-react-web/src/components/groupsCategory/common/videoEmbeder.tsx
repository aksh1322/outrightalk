import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import OT from '@opentok/client';
import { useAppNormalUserMicHandleSelector, useAppRoomDetailsSelector } from 'src/_common/hooks/selectors/groupCategorySelector'
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector'
import { TOKBOX_KEY } from 'src/_config';
import { useAppGroupCategoryAction } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook';
import { OwnVideoPlayer } from './ownVideoplay';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { useParams } from 'react-router';
import { CRYPTO_SECRET_KEY } from 'src/_config';
// import VideoCard from '../roomsDetail/VideoCard';
const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);
interface VideoEmbederProps {
    roomDetailsData: any;
    openWebCamera: any
    openMicrophone: any;
    muteAll: any;
    handleOpenWebcam: () => void;
}


export const VideoEmbeder = ({ roomDetailsData, openWebCamera, openMicrophone, muteAll, handleOpenWebcam }: VideoEmbederProps) => {
    const userSelector = useAppUserDetailsSelector()
    const roomDetailsSelector = useAppRoomDetailsSelector()
    const revokeMicFromNormalUser = useAppNormalUserMicHandleSelector()
    const groupCategoryAction = useAppGroupCategoryAction()
    const [streams, setStreams] = useState<any>([]);
    const [isConnectionSetup, setIsConnectionSetup] = useState(false)
    const groupCategoryApi = useGroupCategoryApi();
    const { groupId, roomId } = useParams<any>();
    const r_id: number = parseInt(cryptr.decrypt(roomId));
    // const [videoOn, setVideoOn] = useState<boolean>(false)
    // const [audioOn, setAudioOn] = useState<boolean>(true)
    const [currentPublisher, setCurrentPublisher] = useState<any>()
    const [currentSubscribers, setCurrentSubscribers] = useState<any>([])
    const [currentSession, setCurrentSession] = useState<any>();
    const [ownVideoUrl, setOwnVideoUrl] = useState<any>(null)
    const [largeView, setLargeView] = useState<boolean>(false);
    const [largeViewAccess, setLargeViewAccess] = useState<boolean>(false);
    const [isOwnVideoAvailable, setIsOwnVideoAvailable] = useState<boolean>(false)
    let session: any = '', publisher: any, subscriber: any;

    const videoRef = useRef<any>(null);

    const handleError = (error: any) => {
        if (error) {
            toast.error(error.message)
        }
    }

    const initializeSession = (apiKey: any, sessionId: any, token: any, roomDetails: any) => {

        session = OT.initSession(apiKey, sessionId);
        // Create a publisher
        publisher = OT.initPublisher(
            "camera-me",
            {
                publishVideo: false,
                publishAudio: false,
                insertMode: "append",
                style: { buttonDisplayMode: "off", nameDisplayMode: "off" },
                width: "30vh",
                height: "20vh",
                name: userSelector && roomDetails && roomDetails.room ? JSON.stringify({ username: userSelector.username, id: userSelector.id, videoStatus: 1, roomId: roomDetails.room.id }) : JSON.stringify({ username: null, id: null, roomId: null }),
            },
            handleError
        );
        setCurrentPublisher(publisher)
        setCurrentSession(session) //Set current session in the state

        // Subscribing to stream
        let tempStreams = [...streams]
        let tempSubscribers = [...currentSubscribers]
        session.on("streamCreated", function (event: any) {
            let userId = JSON.parse(event.stream.name).id
            let roomId = JSON.parse(event.stream.name).roomId
            let found = tempStreams.filter((x: any) => x.userId == userId)
            if (found && found.length) {
                // do nothing already exists
            }
            else {
                if (roomId == roomDetailsSelector.room.id) {
                    subscriber = session.subscribe(
                        event.stream,
                        "subscriber-" + userId,
                        {
                            insertMode: "append",
                            style: { buttonDisplayMode: "off", nameDisplayMode: "off", audioLevelDisplayMode: "off" },
                            width: "100%",
                            height: "350px",
                        },
                        handleError
                    );
                    tempSubscribers.push(subscriber);
                    tempStreams.push({ ...event.stream, userId: userId })
                }

            }
            setStreams(tempStreams)
            setCurrentSubscribers(tempSubscribers)
        });

        // Do some action on destroying the stream
        // let tempStreams = [...streams]
        session.on("streamDestroyed", function (event: any) {
            let roomId = JSON.parse(event.stream.name).roomId
            if (roomId == roomDetailsSelector.room.id) {
                let userId = JSON.parse(event.stream.name).id
                let found = tempStreams.filter((x: any) => x.userId == userId)
                if (found && found.length) {
                    let indexId = tempStreams.findIndex((x: any) => x.userId === userId);
                    if (indexId >= 0) {
                        tempStreams.splice(indexId, 1)
                        tempSubscribers.splice(indexId, 1)
                    }
                }
                setStreams(tempStreams)
                setCurrentSubscribers(tempSubscribers)
            }
        });
        // Connect to the session
        session.connect(token, function (error: any) {
            // If the connection is successful, publish to the session
            if (error) {
                handleError(error);
            } else {
                session.publish(publisher, handleError);
            }
        });

        // streamPropertyChanged event catch if audio or enable disabled
        session.on('streamPropertyChanged', (event: any) => {

            let userId = JSON.parse(event.stream.name).id
            let roomId = JSON.parse(event.stream.name).roomId
            let found = tempStreams.filter((x: any) => x.userId == userId)

            // myself cam mic icon change code here
            if ((userSelector && userSelector.id == userId) && roomDetailsSelector.room.id == roomId) {


                if (event.changedProperty == "hasVideo") {
                    groupCategoryAction.roomMemberCamStatusUpdateFromOpentokStream({ userId: userId, newValue: event.newValue, roomId: roomId, changeType: 'cam' })
                }

                if (event.changedProperty == "hasAudio") {
                    groupCategoryAction.roomMemberCamStatusUpdateFromOpentokStream({ userId: userId, newValue: event.newValue, roomId: roomId, changeType: 'mic' })
                }

            }


            if (found && found.length && event.changedProperty == "hasVideo" && roomDetailsSelector.room.id == roomId) {
                groupCategoryAction.roomMemberCamStatusUpdateFromOpentokStream({ userId: userId, newValue: event.newValue, roomId: roomId, changeType: 'cam' })
                //if someone off camera then change myview cam status 0

                if (event.newValue) {
                    //do nothing
                } else {
                    const params = {
                        room_id: r_id,
                        view_user_id: userId,
                        is_view: 0
                    };
                    groupCategoryApi.callViewMyWebCam(params, (message: string, resp: any) => {
                        if (resp) {

                        }
                    }, (message: string) => {

                    })
                }

                if (!event.newValue && event.oldValue) {
                    enabledButtonReappeared(userId)
                }
            }

            if (found && found.length && event.changedProperty == "hasAudio" && roomDetailsSelector.room.id == roomId) {
                groupCategoryAction.roomMemberCamStatusUpdateFromOpentokStream({ userId: userId, newValue: event.newValue, roomId: roomId, changeType: 'mic' })
            }



        })

    }

    const enabledButtonReappeared = (membersId: number) => {
        let element = document.getElementById('img-' + membersId);
        if (element) {
            element.style.display = "block";
        }
        let elementBtn = document.getElementById('btn-' + membersId);
        if (elementBtn) {
            elementBtn.style.display = "block";
        }

        let videoCloseBtn = document.getElementById("videoclose-" + membersId);
        if (videoCloseBtn) {
            videoCloseBtn.classList.add("other-cams-hidden");
            videoCloseBtn.style.display = "none";
        }
    }

    useEffect(() => {
        if (roomDetailsSelector && roomDetailsSelector.room && roomDetailsSelector.room.opentalk_info && roomDetailsSelector.room.opentalk_info.session && roomDetailsSelector.room.opentalk_info.token && !isConnectionSetup) {
            setIsConnectionSetup(true)
            initializeSession(TOKBOX_KEY, roomDetailsSelector.room.opentalk_info.session, roomDetailsSelector.room.opentalk_info.token, roomDetailsSelector)
        }

    }, [roomDetailsSelector])

    // Use for video on/Off
    useEffect(() => {
        if (currentPublisher) {
            if (openWebCamera) {
                // setVideoOn(true)
                currentPublisher.publishVideo(true);
            } else {
                // setVideoOn(false)
                currentPublisher.publishVideo(false);
            }
        }
    }, [openWebCamera, currentPublisher])

    //use for audio on/off
    useEffect(() => {
        if (currentPublisher) {
            if (openMicrophone) {
                // setVideoOn(true)
                currentPublisher.publishAudio(true);
            } else {
                // setVideoOn(false)
                currentPublisher.publishAudio(false);
            }
        }
    }, [openMicrophone, currentPublisher])

    useEffect(() => {
        if (!openWebCamera) {
            setLargeView(false);
        }
    }, [openWebCamera])

    // //when admin/owner revoke mike(remove all mic,give mic to all,simultenious mike every time click this menu reset normal user mic) from other user if user talk to other then revoke talk permission
    // //NOTE:APPLICABLE ONLY FOR ROOM NORMAL USER

    // useEffect(() => {

    //     if (roomDetailsSelector && [0].includes(roomDetailsSelector.room.join_status.is_admin)) {
    //         if (currentPublisher) {
    //             if (revokeMicFromNormalUser) {
    //                 console.log('revoke mic from normal user')
    //                 // setVideoOn(false)
    //                 currentPublisher.publishAudio(false);
    //             }
    //         }
    //     }

    // }, [roomDetailsSelector, currentPublisher, revokeMicFromNormalUser])


    // //end of the revoke logic


    // Use for Muteall/UnmuteAll
    useEffect(() => {
        if (currentSubscribers) {
            if (muteAll) {
                for (var i = 0; i < currentSubscribers.length; i++) {
                    currentSubscribers[i].subscribeToAudio(false);
                }
            } else {
                for (var i = 0; i < currentSubscribers.length; i++) {
                    currentSubscribers[i].subscribeToAudio(true);
                }
            }
        }
    }, [muteAll, currentSubscribers])

    useEffect(() => {
        return (() => {
            // groupCategoryAction.emptyRoomDetails()//01-09-2021
            if (currentSubscribers && currentSubscribers.length) {
                for (var i = 0; i < currentSubscribers.length; i++) {
                    session.unsubscribe(currentSubscribers[i]);
                }
            }
            session && session.unpublish(publisher)
            session && session.disconnect()
            setCurrentSubscribers([])
        })
    }, [])

    const isOwnVideoExist = () => {
        if (userSelector && roomDetailsSelector && roomDetailsSelector.members && roomDetailsSelector.members.length) {

            let found = roomDetailsSelector.members.filter((x: any) => (x.user_id == userSelector.id && x.is_uploadvideo != null))
            if (found && found.length) {
                setIsOwnVideoAvailable(true)
                setOwnVideoUrl(found[0])
            }
            else {
                setIsOwnVideoAvailable(false)
                setOwnVideoUrl(null)
            }
        }
    }

    useEffect(() => {
        isOwnVideoExist()
    }, [roomDetailsSelector])

    useEffect(() => {
        if (userSelector?.is_subscribed && userSelector.is_subscribed?.plan_info) {
            const planId = userSelector.is_subscribed.plan_info.id;

            if (planId > 5 && planId < 9) {
                setLargeViewAccess(true)
            }
        }
    }, [userSelector])



    return (
        <React.Fragment>
            <div className={isOwnVideoAvailable ? "other-cams-hidden" : "webcam-body"}>
                <div className="webcam-img-wrap">
                    <div id="camera-me" hidden={openWebCamera ? false : true}>
                    </div>
                    {/* <video id="myVideo" ref={videoRef} style={{display: openWebCamera ? 'block' : 'none'}} autoPlay ></video> 
                         */}
                    {/* <VideoCard
                        // onHandlePin={() => {
                        //     pinVideo("localVideo");
                        // }}
                        id="localVideo"
                        autoPlay
                        name="You"
                        muted
                        hidePin={true}
                    /> */}
                    <span className='webcam-view-control-wrapper'>
                        {
                            openWebCamera ?
                                // (largeViewAccess && largeView) ?
                                largeViewAccess && (
                                    (largeView) ?
                                        <span className='webcam-view-control' onClick={() => {
                                            setLargeView(false)
                                            let doc: any = document;
                                            console.log("doc.pictureInPictureElement", doc.pictureInPictureElement)

                                            if (doc.pictureInPictureElement) {
                                                doc.exitPictureInPicture();
                                            }
                                        }}>
                                            <p>111</p>
                                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                                <path d="M9 9V3H7V5.59L3.91 2.5L2.5 3.91L5.59 7H3V9H9ZM21 9V7H18.41L21.5 3.91L20.09 2.5L17 5.59V3H15V9H21ZM3 15V17H5.59L2.5 20.09L3.91 21.5L7 18.41V21H9V15H3ZM15 15V21H17V18.41L20.09 21.5L21.5 20.09L18.41 17H21V15H15Z" fill="white" />
                                            </svg>
                                        </span>
                                        :
                                        <span className='webcam-view-control' onClick={() => {
                                            setLargeView(true)
                                            // videoRef.current.requestPictureInPicture()
                                            document.getElementById("localVideo")?.requestPictureInPicture()
                                        }}>
                                            <p>222</p>

                                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                                <path d="M3 21V15H5V17.6L8.1 14.5L9.5 15.9L6.4 19H9V21H3ZM15 21V19H17.6L14.5 15.9L15.9 14.5L19 17.6V15H21V21H15ZM8.1 9.5L5 6.4V9H3V3H9V5H6.4L9.5 8.1L8.1 9.5ZM15.9 9.5L14.5 8.1L17.6 5H15V3H21V9H19V6.4L15.9 9.5Z" fill="white" />
                                            </svg>
                                        </span>
                                )
                                :
                                ''
                        }
                    </span>
                    <img style={{ display: !openWebCamera ? 'block' : 'none', height: "150px" }} className={roomDetailsSelector && roomDetailsSelector.user && roomDetailsSelector.user.room_user_status && roomDetailsSelector.user.room_user_status.red_dot_camera ? 'disable-link' : ''} onClick={() => handleOpenWebcam()} src="/img/open-webcam.png" alt="no-webcam" />
                </div>
            </div>
            {isOwnVideoAvailable ?
                <OwnVideoPlayer
                    // roomDetailsData={fetchRoomDetailsData}
                    ownVideoUrl={ownVideoUrl}
                /> : null
            }

        </React.Fragment>
    )
}