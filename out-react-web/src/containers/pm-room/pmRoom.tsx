import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HEADER_TYPE, CRYPTO_SECRET_KEY } from "src/_config";
import Header from "src/components/common/Header";
import Sidebar from "src/components/common/Sidebar";
import ActiveRoomPopDown from "src/components/common/activeRoom/activeRoom";
import ActivePmWindowPopDown from "src/components/pm-room/common/activePmWindow";
import PmRoomPage from "src/components/pm-room/pmRoom";
import { useAppIsOpenActiveRoomSelector } from "src/_common/hooks/selectors/groupCategorySelector";
import { useAppIsOpenActivePmWindowSelector } from "src/_common/hooks/selectors/pmWindowSelector";
// import { AntmediaContext } from 'src';
import _ from "lodash";
// import { VideoEffect } from 'src/antmedia/video-effect';
// import { VideoEffect } from '@antmedia/webrtc_adaptor';

import UserPreferencesBannerShow from "src/components/common/userPreferencesBanner";
import { CallProvider, ChatProvider } from "src/hooks"

const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);
// export const SettingsContext = React.createContext<any>(null);
// export const MediaSettingsContext = React.createContext<any>(null);

const globals: any = {
  //this settings is to keep consistent with the sdk until backend for the app is setup
  // maxVideoTrackCount is the tracks i can see excluding my own local video.so the use is actually seeing 3 videos when their own local video is included.
  maxVideoTrackCount: 5,
  trackEvents: [],
};

export default function PmRoomContainer() {
  const { pmId } = useParams<any>();

  const roomName = "pm" + cryptr.decrypt(pmId);

  // const antmedia = useContext<any>(AntmediaContext);
  // const videoEffect = new VideoEffect();

  // drawerOpen for message components.
  const [messageDrawerOpen, setMessageDrawerOpen] = useState(false);

  // drawerOpen for participant list components.
  const [participantListDrawerOpen, setParticipantListDrawerOpen] =
    useState(false);

  // whenever i join the room, i will get my unique id and stream settings from webRTC.
  // So that whenever i did something i will inform other participants that this action belongs to me by sending my streamId.
  // const [myLocalData, setMyLocalData] = useState<any>(null);

  // this is my own name when i enter the room.
  const [streamName, setStreamName] = useState("");

  // this is for checking if i am sharing my screen with other participants.
  const [isScreenShared, setIsScreenShared] = useState(false);

  //we are going to store number of unread messages to display on screen if user has not opened message component.
  const [numberOfUnReadMessages, setNumberOfUnReadMessages] = useState(0);

  // pinned screen this could be by you or by shared screen.
  const [pinnedVideoId, setPinnedVideoId] = useState<any>(null);

  const [screenSharedVideoId, setScreenSharedVideoId] = useState(null);
  const [waitingOrMeetingRoom, setWaitingOrMeetingRoom] = useState("waiting");
  const [leftTheRoom, setLeftTheRoom] = useState(false);
  // { id: "", track:{} },
  // const [participants, setParticipants] = useState<any>([]);
  const [allParticipants, setAllParticipants] = useState([]);
  const [audioTracks, setAudioTracks] = useState<any>([]);
  // const [mic, setMic] = useState<any>([]);
  const [talkers, setTalkers] = useState([]);
  const [isPublished, setIsPublished] = useState(false);
  const [selectedCamera, setSelectedCamera] = React.useState("");
  const [selectedMicrophone, setSelectedMicrophone] = React.useState("");
  const [selectedBackgroundMode, setSelectedBackgroundMode] =
    React.useState("");
  const [isVideoEffectRunning, setIsVideoEffectRunning] = React.useState(false);
  const timeoutRef = React.useRef<any>(null);
  // const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [messages, setMessages] = useState<any>([]);

  const [cam, setCam] = useState([
    {
      eventStreamId: "localVideo",
      isCameraOn: false, //start with camera on
    },
  ]);

  const [mic, setMic] = useState([
    {
      eventStreamId: "localVideo",
      isMicMuted: false, //start with mic on
    },
  ]);

  function pinVideo(id: any, videoLabelProp = "") {
    // id is for pinning user.
    let videoLabel = videoLabelProp;
    if (videoLabel === "") {
      // if videoLabel is missing select the first videoLabel you find
      // 1 -2 -3 -4 -5 -6 -7 -8 -9
      // if (participants) {
      //     videoLabel = participants.find((p: any) => p?.videoLabel !== p?.id)?.videoLabel;
      // }
    }
    // if we already pin the targeted user then we are going to remove it from pinned video.
    if (pinnedVideoId === id) {
      setPinnedVideoId(null);
      handleNotifyUnpinUser(id);
      // antmedia.assignVideoTrack(videoLabel, id, false);
    }
    // if there is no pinned video we are gonna pin the targeted user.
    // and we need to inform pinned user.
    else {
      setPinnedVideoId(id);
      handleNotifyPinUser(id);
      // antmedia.assignVideoTrack(videoLabel, id, true);
    }
  }

  function handleNotifyPinUser(id: any) {
    // If I PIN USER then i am going to inform pinned user.
    // Why? Because if i pin someone, pinned user's resolution has to change for better visibility.
    // handleSendNotificationEvent("PIN_USER", myLocalData.streamId, {
    //     streamId: id,
    // });
  }

  function handleNotifyUnpinUser(id: any) {
    // If I UNPIN USER then i am going to inform pinned user.
    // Why? We need to decrease resolution for pinned user's internet usage.
    // if (myLocalData) {
    //     handleSendNotificationEvent("UNPIN_USER", myLocalData?.streamId, {
    //         streamId: id,
    //     });
    // }
  }

  function handleSetInitialMaxVideoTrackCount(maxTrackCount: any) {
    globals.maxVideoTrackCount = maxTrackCount;
    console.log("Initial max video track count:" + maxTrackCount);
  }

  //   function handleSetMaxVideoTrackCount(maxTrackCount: any) {
  //     // I am changing maximum participant number on the screen. Default is 3.
  //     if (myLocalData?.streamId) {
  //       // antmedia.setMaxVideoTrackCount(myLocalData.streamId, maxTrackCount);
  //       globals.maxVideoTrackCount = maxTrackCount;
  //     }
  //   }
  function handleStartScreenShare() {
    // antmedia.switchDesktopCapture(myLocalData?.streamId)
    //     .then(() => {
    //         screenShareOnNotification();
    //     });
  }
  function screenShareOffNotification() {
    // antmedia.handleSendNotificationEvent(
    //     "SCREEN_SHARED_OFF",
    //     myLocalData.streamId
    // );
    //if i stop my screen share and if i have pin someone different from myself it just should not effect my pinned video.
    if (pinnedVideoId === "localVideo") {
      setPinnedVideoId(null);
    }
  }
  function screenShareOnNotification() {
    setIsScreenShared(true);
    // antmedia.screenShareOffNotification();
    let requestedMediaConstraints = {
      width: 1920,
      height: 1080,
    };
    // antmedia.applyConstraints(myLocalData.streamId, requestedMediaConstraints);
    // antmedia.handleSendNotificationEvent(
    //     "SCREEN_SHARED_ON",
    //     myLocalData.streamId
    // );

    setPinnedVideoId("localVideo");
    // send fake audio level to get screen sharing user on a videotrack
    // TODO: antmedia.updateAudioLevel(myLocalData.streamId, 10);
  }
  function handleScreenshareNotFromPlatform() {
    setIsScreenShared(false);
    // if (
    //     cam.find(
    //         (c) => c.eventStreamId === "localVideo" && c.isCameraOn === false
    //     )
    // ) {
    //     antmedia.turnOffLocalCamera(myLocalData.streamId);
    // } else {
    //     antmedia.switchVideoCameraCapture(myLocalData.streamId);
    // }
    // antmedia.screenShareOffNotification();
    let requestedMediaConstraints = {
      width: 320,
      height: 240,
    };
    // antmedia.applyConstraints(myLocalData.streamId, requestedMediaConstraints);
  }
  function handleStopScreenShare() {
    setIsScreenShared(false);
    // if (
    //     cam.find(
    //         (c) => c.eventStreamId === "localVideo" && c.isCameraOn === false
    //     )
    // ) {
    //     antmedia.turnOffLocalCamera(myLocalData.streamId);
    // } else {
    //     antmedia.switchVideoCameraCapture(myLocalData.streamId);

    //     // isCameraOff = true;
    // }
    // antmedia.screenShareOffNotification();
  }
  function handleSetMessages(newMessage: any) {
    setMessages((oldMessages: any) => {
      let lastMessage = oldMessages[oldMessages.length - 1]; //this must remain mutable
      const isSameUser = lastMessage?.name === newMessage?.name;
      const sentInSameTime = lastMessage?.date === newMessage?.date;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      newMessage.date = new Date(newMessage?.date).toLocaleString(getLang(), {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
      });

      if (isSameUser && sentInSameTime) {
        //group the messages *sent back to back in the same timeframe by the same user* by joinig the new message text with new line
        lastMessage.message = lastMessage.message + "\n" + newMessage.message;
        return [...oldMessages]; // don't make this "return oldMessages;" this is to trigger the useEffect for scroll bottom and get over showing the last prev state do
      } else {
        return [...oldMessages, newMessage];
      }
    });
  }

  function getLang() {
    if (navigator.languages !== undefined) return navigator.languages[0];
    return navigator.language;
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    let objDiv = document.getElementById("paper-props");
    if (objDiv) objDiv.scrollTop = objDiv?.scrollHeight;
  }
  function handleMessageDrawerOpen(open: any) {
    // closeSnackbar();
    setMessageDrawerOpen(open);
    if (open) {
      setParticipantListDrawerOpen(false);
    }
  }

  function handleParticipantListOpen(open: any) {
    setParticipantListDrawerOpen(open);
    if (open) {
      setMessageDrawerOpen(false);
    }
  }

  function handleSendMessage(message: any) {
    // if (myLocalData.streamId) {
    //     let iceState = antmedia.iceConnectionState(myLocalData.streamId);
    //     if (
    //         iceState !== null &&
    //         iceState !== "failed" &&
    //         iceState !== "disconnected"
    //     ) {
    //         if (message === "debugme") {
    //             antmedia.getDebugInfo(myLocalData.streamId);
    //             return;
    //         }
    //         antmedia.sendData(
    //             myLocalData.streamId,
    //             JSON.stringify({
    //                 eventType: "MESSAGE_RECEIVED",
    //                 message: message,
    //                 name: streamName,
    //                 date: new Date().toString()
    //             })
    //         );
    //     }
    // }
  }

  function handleDebugInfo(debugInfo: any) {
    var infoText = "Client Debug Info\n";
    infoText += "Events:\n";
    infoText += JSON.stringify(globals.trackEvents) + "\n";
    // infoText += "Participants (" + participants.length + "):\n";
    // infoText += JSON.stringify(participants) + "\n";
    infoText += "----------------------\n";
    infoText += debugInfo;

    //fake message to add chat
    // var obj = {
    //     streamId: myLocalData.streamId,
    //     data: JSON.stringify({
    //         eventType: "MESSAGE_RECEIVED",
    //         name: "Debugger",
    //         date: new Date().toLocaleTimeString([], {
    //             hour: "2-digit",
    //             minute: "2-digit",
    //         }),
    //         message: infoText,
    //     }),
    // };

    // handleNotificationEvent(obj);
  }

  function toggleSetCam(data: any) {
    setCam((camList) => {
      let arr = _.cloneDeep(camList);
      let camObj = arr.find((c) => c.eventStreamId === data.eventStreamId);

      if (camObj) {
        camObj.isCameraOn = data.isCameraOn;
      } else {
        arr.push(data);
      }

      return arr;
    });
  }

  function toggleSetMic(data: any) {
    // console.log("isMicMuted", data.isMicMuted)
    setMic((micList: any) => {
      let arr: any = _.cloneDeep(micList);
      let micObj: any = arr.find(
        (c: any) => c.eventStreamId === data.eventStreamId
      );

      if (micObj) {
        micObj.isMicMuted = data.isMicMuted;
      } else {
        arr.push(data);
      }

      return arr;
    });
  }
  function toggleSetNumberOfUnreadMessages(numb: any) {
    setNumberOfUnReadMessages(numb);
  }

  function handleNotificationEvent(obj: any) {
    var notificationEvent = JSON.parse(obj.data);
    if (notificationEvent != null && typeof notificationEvent == "object") {
      var eventStreamId = notificationEvent.streamId;
      var eventType = notificationEvent.eventType;

      if (eventType === "CAM_TURNED_OFF") {
        toggleSetCam({
          eventStreamId: eventStreamId,
          isCameraOn: false,
        });
      } else if (eventType === "CAM_TURNED_ON") {
        toggleSetCam({
          eventStreamId: eventStreamId,
          isCameraOn: true,
        });
      } else if (eventType === "MIC_MUTED") {
        toggleSetMic({
          eventStreamId: eventStreamId,
          isMicMuted: true,
        });
      } else if (eventType === "MIC_UNMUTED") {
        toggleSetMic({
          eventStreamId: eventStreamId,
          isMicMuted: false,
        });
      } else if (eventType === "MESSAGE_RECEIVED") {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        notificationEvent.date = new Date(
          notificationEvent?.date
        ).toLocaleString(getLang(), {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
        });
        // if message arrives.
        // if there is an new message and user has not opened message component then we are going to increase number of unread messages by one.
        // we are gonna also send snackbar.
        if (!messageDrawerOpen) {
          // enqueueSnackbar(
          //   {
          //     sender: notificationEvent.name,
          //     message: notificationEvent.message,
          //     variant: "message",
          //     onClick: () => {
          //       handleMessageDrawerOpen(true);
          //       setNumberOfUnReadMessages(0);
          //     },
          //   },
          //   {
          //     autoHideDuration: 5000,
          //     anchorOrigin: {
          //       vertical: "top",
          //       horizontal: "right",
          //     },
          //   }
          // );
          setNumberOfUnReadMessages((numb) => numb + 1);
        }
        setMessages((oldMessages: any) => {
          let lastMessage = oldMessages[oldMessages.length - 1]; //this must remain mutable
          const isSameUser = lastMessage?.name === notificationEvent?.name;
          const sentInSameTime = lastMessage?.date === notificationEvent?.date;

          if (isSameUser && sentInSameTime) {
            //group the messages *sent back to back in the same timeframe by the same user* by joinig the new message text with new line
            lastMessage.message =
              lastMessage.message + "\n" + notificationEvent.message;
            return [...oldMessages]; // dont make this "return oldMessages;" this is to trigger the useEffect for scroll bottom and get over showing the last prev state do
          } else {
            return [...oldMessages, notificationEvent];
          }
        });
      } else if (eventType === "SCREEN_SHARED_ON") {
        // let videoLab = participants.find((p: any) => p.id === eventStreamId)
        //     ?.videoLabel
        //     ? participants.find((p: any) => p.id === eventStreamId).videoLabel
        //     : "";

        let videoLab = "";
        pinVideo(eventStreamId, videoLab);
        setScreenSharedVideoId(eventStreamId);
      } else if (eventType === "SCREEN_SHARED_OFF") {
        setScreenSharedVideoId(null);
        setPinnedVideoId(null);
      } else if (eventType === "UPDATE_STATUS") {
        setUserStatus(notificationEvent, eventStreamId);
      } else if (eventType === "PIN_USER") {
        // if (
        //     notificationEvent.streamId === myLocalData.streamId &&
        //     !isScreenShared
        // ) {
        //     let requestedMediaConstraints = {
        //         width: 640,
        //         height: 480,
        //     };
        //     antmedia.applyConstraints(
        //         myLocalData.streamId,
        //         requestedMediaConstraints
        //     );
        // }
      } else if (eventType === "UNPIN_USER") {
        // if (
        //     notificationEvent.streamId === myLocalData.streamId &&
        //     !isScreenShared
        // ) {
        //     let requestedMediaConstraints = {
        //         width: 320,
        //         height: 240,
        //     };
        //     antmedia.applyConstraints(
        //         myLocalData.streamId,
        //         requestedMediaConstraints
        //     );
        // }
      } else if (eventType === "VIDEO_TRACK_ASSIGNMENT_CHANGE") {
        console.log(JSON.stringify(obj));
        if (!notificationEvent.payload.trackId) {
          return;
        }
        // setParticipants((oldParticipants: any) => {
        //     return oldParticipants
        //         .filter(
        //             (p: any) =>
        //                 p.videoLabel === notificationEvent.payload.videoLabel ||
        //                 p.id !== notificationEvent.payload.trackId
        //         )
        //         .map((p: any) => {
        //             if (
        //                 p.videoLabel === notificationEvent.payload.videoLabel &&
        //                 p.id !== notificationEvent.payload.trackId
        //             ) {
        //                 return {
        //                     ...p,
        //                     id: notificationEvent.payload.trackId,
        //                     oldId: p.id,
        //                 };
        //             }
        //             return p;
        //         });
        // });
      } else if (eventType === "AUDIO_TRACK_ASSIGNMENT") {
        clearInterval(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setTalkers([]);
        }, 1000);
        setTalkers((oldTalkers) => {
          const newTalkers = notificationEvent.payload
            .filter(
              (p: any) =>
                p.trackId !== "" &&
                screenSharedVideoId !== p.trackId &&
                p.audioLevel !== 0
            )
            .map((p: any) => p.trackId);
          return _.isEqual(oldTalkers, newTalkers) ? oldTalkers : newTalkers;
        });
      }
    }
  }
  function setUserStatus(notificationEvent: any, eventStreamId: any) {
    if (notificationEvent.isScreenShared) {
      // if the participant was already pin someone than we should not update it
      // if (!screenSharedVideoId) {
      //     setScreenSharedVideoId(eventStreamId);
      //     let videoLab = participants.find((p: any) => p.id === eventStreamId)
      //         ?.videoLabel
      //         ? participants.find((p: any) => p.id === eventStreamId).videoLabel
      //         : "";
      //     pinVideo(eventStreamId, videoLab);
      // }
    }

    // if (!isScreenShared && participants.find((p: any) => p.id === eventStreamId)) {
    //     if (!mic.find((m: any) => m.eventStreamId === eventStreamId)) {
    //         toggleSetMic({
    //             eventStreamId: eventStreamId,
    //             isMicMuted: notificationEvent.mic,
    //         });
    //     }
    //     if (!cam.find((m) => m.eventStreamId === eventStreamId)) {
    //         toggleSetCam({
    //             eventStreamId: eventStreamId,
    //             isCameraOn: notificationEvent.camera,
    //         });
    //     }
    // }
  }

  // console.log("myLocalData------", myLocalData)
  function handleLeaveFromRoom() {
    // console.log("handleLeaveFromRoom", "handleLeaveFromRoom")
    // we need to empty participant array. i f we are going to leave it in the first place.
    // if(myLocalData){
    //     setParticipants([]);
    //     antmedia.turnOffLocalCamera(myLocalData.streamId);
    //     antmedia.leaveFromRoom(roomName);
    //     setWaitingOrMeetingRoom("waiting");
    // }
  }
  function handleSendNotificationEvent(
    eventType: any,
    publishStreamId: any,
    info: any
  ) {
    console.log("EVENT TYPE", eventType);
    let notEvent = {
      streamId: publishStreamId,
      eventType: eventType,
      ...(info ? info : {}),
    };
    // antmedia.sendData(publishStreamId, JSON.stringify(notEvent));
  }
  function handleRoomInfo(publishStreamId: any) {
    // antmedia.getRoomInfo(roomName, publishStreamId);
    setIsPublished(true);
  }

  function updateStatus(obj: any) {
    // if (roomName !== obj && myLocalData) {
    //     handleSendNotificationEvent("UPDATE_STATUS", myLocalData.streamId, {
    //         mic: !!mic.find((c: any) => c.eventStreamId === "localVideo")?.isMicMuted,
    //         camera: !!cam.find((c) => c.eventStreamId === "localVideo")?.isCameraOn,
    //         isPinned:
    //             pinnedVideoId === "localVideo" ? myLocalData.streamId : pinnedVideoId,
    //         isScreenShared: isScreenShared,
    //     });
    // }
  }
  function handleSetMyObj(obj: any) {
    // handleSetInitialMaxVideoTrackCount(obj.maxTrackCount);
    // console.log("handleSetMyObj", obj)
    // setMyLocalData({ ...obj, streamName });
  }
  function handlePlay(token: any, tempList: any) {
    // antmedia.play(roomName, token, roomName, tempList);
  }
  function handleStreamInformation(obj: any) {
    // antmedia.play(obj.streamId, "", roomName);
  }
  function handlePublish(
    publishStreamId: any,
    token: any,
    subscriberId: any,
    subscriberCode: any
  ) {
    // antmedia.publish(
    //     publishStreamId,
    //     token,
    //     subscriberId,
    //     subscriberCode,
    //     streamName,
    //     roomName,
    //     "{someKey:somveValue}"
    // );
  }
  function handlePlayVideo(obj: any, publishStreamId: any) {
    let index = obj?.trackId?.substring("ARDAMSx".length);
    globals.trackEvents.push({ track: obj.track.id, event: "added" });

    if (obj.track.kind === "audio") {
      setAudioTracks((sat: any) => {
        return [
          ...sat,
          {
            id: index,
            track: obj.track,
            streamId: obj.streamId,
          },
        ];
      });
      return;
    }
    if (index === publishStreamId) {
      return;
    }
    if (index === roomName) {
      return;
    } else {
      // if (obj?.trackId && !participants.some((p: any) => p.id === index)) {
      //     setParticipants((spp: any) => {
      //         return [
      //             ...spp.filter((p: any) => p.id !== index),
      //             {
      //                 id: index,
      //                 videoLabel: index,
      //                 track: obj.track,
      //                 streamId: obj.streamId,
      //                 isCameraOn: true,
      //                 name: "",
      //             },
      //         ];
      //     });
      // }
    }
  }
  function handleBackgroundReplacement(option: any) {
    // if (!videoEffect.isInitialized) {
    //     // videoEffect.init(antmedia, myLocalData.streamId, null, null);
    // }
    // videoEffect.streamId = myLocalData.streamId;
    // if (option === "none") {
    //     videoEffect.removeEffect();
    //     // antmedia.closeCustomVideoSource(myLocalData.streamId);
    //     setIsVideoEffectRunning(false);
    // }
    // else if (option === "blur") {
    //     videoEffect.enableBlur();
    //     setIsVideoEffectRunning(true);
    // }
    // else if (option === "background") {
    //     videoEffect.enableVirtualBackground();
    //     setIsVideoEffectRunning(true);
    // }
  }
  function checkAndTurnOnLocalCamera(streamId: any) {
    if (isVideoEffectRunning) {
      // videoEffect.turnOnLocalCamera(antmedia);
    } else {
      // antmedia.turnOnLocalCamera(streamId);
    }
  }

  function checkAndTurnOffLocalCamera(streamId: any) {
    if (isVideoEffectRunning) {
      // videoEffect.turnOffLocalCamera(antmedia);
    } else {
      // antmedia.turnOffLocalCamera(streamId);
    }
  }
  function handleRoomEvents({ streams, streamList }: any) {
    // [allParticipant, setAllParticipants] => list of every user
    setAllParticipants(streamList);
    // [participants,setParticipants] => number of visible participants due to tile count. If tile count is 3
    // then number of participants will be 3.
    // We are basically, finding names and match the names with the particular videos.
    // We do this because we can't get names from other functions.
    // setParticipants((oldParts: any) => {
    //     if (streams.length < participants.length) {
    //         return oldParts.filter((p: any) => streams.includes(p.id));
    //     }
    //     // matching the names.
    //     return oldParts.map((p: any) => {
    //         const newName = streamList.find((s: any) => s.streamId === p.id)?.streamName;
    //         if (p.name !== newName) {
    //             return { ...p, name: newName };
    //         }
    //         return p;
    //     });
    // });
    if (pinnedVideoId !== "localVideo" && !streams.includes(pinnedVideoId)) {
      setPinnedVideoId(null);
    }
  }

  // START custom functions
  // antmedia.handlePlayVideo = handlePlayVideo;
  // antmedia.handleRoomEvents = handleRoomEvents;
  // antmedia.handlePublish = handlePublish;
  // antmedia.handleStreamInformation = handleStreamInformation;
  // antmedia.handlePlay = handlePlay;
  // antmedia.handleRoomInfo = handleRoomInfo;
  // antmedia.updateStatus = updateStatus;
  // antmedia.handleSetMyObj = handleSetMyObj;
  // antmedia.handleSendNotificationEvent = handleSendNotificationEvent;
  // antmedia.handleNotificationEvent = handleNotificationEvent;
  // antmedia.handleLeaveFromRoom = handleLeaveFromRoom;
  // antmedia.handleSendMessage = handleSendMessage;
  // antmedia.screenShareOffNotification = screenShareOffNotification;
  // antmedia.screenShareOnNotification = screenShareOnNotification;
  // antmedia.handleStartScreenShare = handleStartScreenShare;
  // antmedia.handleStopScreenShare = handleStopScreenShare;
  // antmedia.handleScreenshareNotFromPlatform = handleScreenshareNotFromPlatform;
  // antmedia.handleNotifyPinUser = handleNotifyPinUser;
  // antmedia.handleNotifyUnpinUser = handleNotifyUnpinUser;
  // antmedia.handleSetMaxVideoTrackCount = handleSetMaxVideoTrackCount;
  // antmedia.handleDebugInfo = handleDebugInfo;
  // antmedia.handleBackgroundReplacement = handleBackgroundReplacement;
  // antmedia.checkAndTurnOnLocalCamera = checkAndTurnOnLocalCamera;
  // antmedia.checkAndTurnOffLocalCamera = checkAndTurnOffLocalCamera;

  const isOpenActiveRoomPopDown = useAppIsOpenActiveRoomSelector();
  const isOpenActivePmWindowPopDown = useAppIsOpenActivePmWindowSelector();

  return (
    <React.Fragment>
    {/* <CallProvider> */}
    <ChatProvider>
      {/* <MediaSettingsContext.Provider
                value={{
                    isScreenShared,
                    mic,
                    cam,
                    setCam,
                    setMic,
                    setMyLocalData,
                    talkers,
                    toggleSetCam,
                    toggleSetMic,
                    myLocalData,
                    handleMessageDrawerOpen,
                    handleParticipantListOpen,
                    screenSharedVideoId,
                    audioTracks,
                    setAudioTracks,
                    isPublished,
                    setSelectedCamera,
                    selectedCamera,
                    selectedMicrophone,
                    setSelectedMicrophone,
                    selectedBackgroundMode,
                    setSelectedBackgroundMode,
                    setIsVideoEffectRunning,
                    setParticipants,
                    participants,
                    setLeftTheRoom,
                }}
            >

                <SettingsContext.Provider
                    value={{
                        mic,
                        cam,
                        setCam,
                        setMic,
                        setMyLocalData,
                        toggleSetCam,
                        messageDrawerOpen,
                        handleMessageDrawerOpen,
                        participantListDrawerOpen,
                        handleParticipantListOpen,
                        handleSetMessages,
                        messages,
                        toggleSetNumberOfUnreadMessages,
                        numberOfUnReadMessages,
                        pinVideo,
                        pinnedVideoId,
                        screenSharedVideoId,
                        audioTracks,
                        setAudioTracks,
                        allParticipants,
                        globals,
                    }}
                > */}
      <div id="layout-wrapper">
        <Header type={HEADER_TYPE.PM_WINDOW} />
        <div className="vertical-menu vertical-menu-custom-submenu">
          <div data-simplebar className="h-100">
            <Sidebar />
          </div>
        </div>
        <div className="main-content">
          <div className="page-content">
            <PmRoomPage
              // myLocalData={myLocalData}
              // participants={participants}
              allParticipants={allParticipants}
              roomName={roomName}
            />
          </div>
          <UserPreferencesBannerShow />
        </div>
      </div>
      {/* </SettingsContext.Provider>
            </MediaSettingsContext.Provider> */}
      {isOpenActiveRoomPopDown ? <ActiveRoomPopDown /> : null}

      {isOpenActivePmWindowPopDown ? <ActivePmWindowPopDown /> : null}
    </ChatProvider>
    {/* </CallProvider> */}
    </React.Fragment>
  );
}
