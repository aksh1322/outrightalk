import React, { useEffect, useState } from "react";
import { useAppGroupCategoryAction } from "src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook";
import { useAppNotebookAction } from "src/_common/hooks/actions/notebook/appNotebookActionHook";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";
import { useAppRoomDetailsSelector } from "src/_common/hooks/selectors/groupCategorySelector";
import useSocket from "use-socket.io-client";
import {
  SOCKET_URL,
  SOCKET_CHANNEL,
  ADMIN_ROOM_MENU_SOCKET_TYPE,
  VIDEO_VOICE_NOTEBOOK_SOCKET_TYPE,
  LOGIN_STORAGE,
} from "../_config";
import { useHistory } from "react-router";
import { useAppVideoMessageAction } from "src/_common/hooks/actions/videoMessage/appVideoMessageActionHook";
import { useAppNotificationAction } from "src/_common/hooks/actions/notification/appNotificationActionHook";
import { useAppUserAction } from "src/_common/hooks/actions/user/appUserActionHook";
import { useAppPmWindowAction } from "src/_common/hooks/actions/pmWindow/appPmWindowActionHook";
import { useAppPmWindowDetails } from "src/_common/hooks/selectors/pmWindowSelector";
import {
  useNotificationsContext,
  useFileContext,
  useCallContext,
  useChatContext,
} from "src/hooks";
import { useAppUserPreferencesSelector } from "src/_common/hooks/selectors/userPreferenceSelector";
import { truncate } from "lodash";

function SocketLoader() {
  // const [connected, setConnected] = useState(false)
  const userDetails = useAppUserDetailsSelector();
  const pmWindowDetailsSelector = useAppPmWindowDetails();
  const roomDetailsSelector = useAppRoomDetailsSelector();
  const userAction = useAppUserAction();
  const groupCategoryAction = useAppGroupCategoryAction();
  const notebookAction = useAppNotebookAction();
  const voiceVideoMessageAction = useAppVideoMessageAction();
  const notificationAction = useAppNotificationAction();
  const pmWindowAction = useAppPmWindowAction();
  const preferenceSelector = useAppUserPreferencesSelector();
  const history = useHistory();
  const [socket] = useSocket(SOCKET_URL, {
    autoConnect: false,
  });

  const {
    setIsAlert,
    setGiftRcv,
    setIsPmAlert,
    setPmInviteData,
    setIsRoomAlert,
    setRoomInviteData,
    setPmNotificationType,
    setOfflineUserStatus,
    setPmRemoveUserNotification,
    setOnlineUserStatus,
    setGiftAcceptedNotification,
  } = useNotificationsContext();

  const { setShowRecieveFileModal, setFileRecieveInfo } = useFileContext();
  const { setShowYoutubeAlert } = useCallContext();
  const { setRoomDetailsFromSocket } = useChatContext();

  const value = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS);
  const {
    id: signedInUserId,
    send_bird_user: { sb_access_token: signedInUserToken },
  } = value ? JSON.parse(value) : {
    id: null,
    send_bird_user: { sb_access_token: null }
  };

  useEffect(() => {
    if (userDetails) {
      socket.connect();

      //Logged in Other location socket
      socket.on(SOCKET_CHANNEL.LOGGEDIN_OTHER_LOCATION, (loggedInData: any) => {
        userAction.loggedInFromOtherLocation(loggedInData);
      });
      socket.on(SOCKET_CHANNEL.SEND_FILE_INVITE, (data: any) => {
        setFileRecieveInfo(data);
        const userList = data?.user?.map((user: any) => +user?.to_user_id);
        if (userList.includes(signedInUserId)) {
          setShowRecieveFileModal(true);
        }
      });

      let pageUrl = history.location.pathname.split("/");

      userAction.socketInstanceContainer(socket);

      socket.on("Invite", (data: any) => { 
        if (data?.gift_invite_id) {
          setGiftRcv(data);
          setIsAlert(true);
        };
        if (data?.type == "pm_invite") {
          setPmInviteData(data);
          setIsPmAlert(true);
        };
        if (data?.user[0]?.type == "invite") {
          setRoomInviteData(data);
          setIsRoomAlert(true);
        };
        const giftAcceptedNotification = data?.user.find(
          (notification: any) => {
            return notification?.type == "gift_accepted";
          }
        );
        if (giftAcceptedNotification) {
          setGiftAcceptedNotification(giftAcceptedNotification);
        }
      });

      if (pageUrl && pageUrl.length && pageUrl.includes("room-details")) {
        // store socket instance into the state
        // userAction.socketInstanceContainer(socket)

        // chatwindow.tsx page updated
        socket.on(SOCKET_CHANNEL.CHAT_MESSAGE, (roomData: any) => {
          setRoomDetailsFromSocket((prevRoomData: any) => [
            ...prevRoomData,
            ...roomData,
          ]);
          // groupCategoryAction.pushSocketDataToRoomChat(roomData, userDetails.id)
        });

        // RoomsDetailsUsersSidebarPage.tsx page updated
        socket.on(
          SOCKET_CHANNEL.ROOM_MEMBER_OPTION,
          (sidebarMemberData: any) => {
            groupCategoryAction.pushSocketDataToRoomDetailsMemberSidebar(
              sidebarMemberData,
              userDetails.id
            );
          }
        );

        socket.on(
          SOCKET_CHANNEL.ROOM_VIDEO_UPLOAD,
          (roomVideoUploadData: any) => {
            groupCategoryAction.pushSocketDataToRoomUserVideoUrl(
              roomVideoUploadData
            );
          }
        );

        socket.on(SOCKET_CHANNEL.TOPIC_UPDATE, (topicUpdateData: any) => {
          groupCategoryAction.roomChatTopicUpdate(topicUpdateData);
        });

        socket.on(
          SOCKET_CHANNEL.VIDEO_AUDIO_ICON_UPDATE_CHANNEL,
          (camMicData: any) => {
            // console.log('VideoAudioChnl -------->', camMicData);
            // if (camMicData && camMicData.type && camMicData.type === ADMIN_ROOM_MENU_SOCKET_TYPE.CAMERA_OFF) {
            //   groupCategoryAction.roomMemberCamStatusUpdateFromOpentokStream({ userId: camMicData.user_id, newValue: 0, roomId: camMicData.room_id, changeType: 'camMic', video_stream_id: camMicData.video_stream_id, is_cemera: camMicData.is_cemera })
            // } else {
            //   groupCategoryAction.roomAdminMicHandle(camMicData)
            // }
          }
        );

        //Grab & release mic
        socket.on(SOCKET_CHANNEL.GRAB_MIC, (grabMicData: any) => {
          groupCategoryAction.grabAndReleaseMicrophoneChange(grabMicData);
        });

        //Admin disable enable invitation
        socket.on(
          SOCKET_CHANNEL.ADMIN_DISABLE_ENABLE_INVITATION,
          (enableDisableData: any) => {
            const { invitation, ...rest } = enableDisableData;
            groupCategoryAction.adminDisableInvitation(rest, userDetails.id);
          }
        );

        //play a video from room action menu
        socket.on(SOCKET_CHANNEL.PLAY_VIDEO_CHANNEL, (videoInfo: any) => {
          groupCategoryAction.roomPlayVideo(videoInfo);
        });

        // Get data of room members on play and pause stream
        socket.on(SOCKET_CHANNEL.MEMBER_DATA, (members: any) => {
          groupCategoryAction.pushSocketDataToUpdateMember(members);
        });

        //red dot socket data apply to existing member

        socket.on(SOCKET_CHANNEL.RED_DOT_CHANNEL, (redDotInfo: any) => {
          let redParms = {
            ...redDotInfo,
            userId: userDetails.id,
          };
          groupCategoryAction.redDotSocketDataApply(redParms);
        });
      }

      // Left Sidebar.tsx page updated
      socket.on(SOCKET_CHANNEL.USER_STATUS, (sideBarListData: any) => {
        groupCategoryAction.pushSocketDataToLeftMenuItemList(
          sideBarListData,
          userDetails.id
        );

        if (
          sideBarListData?.type == "change_status" &&
          sideBarListData?.visible_status == 1 &&
          sideBarListData?.is_loggedout == 0
        ) {
          setOnlineUserStatus(sideBarListData?.id);
        }
        if (
          sideBarListData?.type == "change_status" &&
          sideBarListData?.visible_status == 4 &&
          sideBarListData?.is_loggedout == 1
        ) {
          setOfflineUserStatus(sideBarListData?.id);
        }
      });
      if (
        pageUrl &&
        pageUrl.length &&
        ["notebook", "manage-voice-mail", "manage-video-message"].includes(
          pageUrl[pageUrl.length - 1]
        )
      ) {
        //notebook.tsx
        socket.on(
          SOCKET_CHANNEL.VOICE_VIDEO_NOTEBOOK_CHANNEL,
          (voiceVideoNotebookData: any) => {
            const found =
              voiceVideoNotebookData &&
              voiceVideoNotebookData.user &&
              voiceVideoNotebookData.user.length
                ? voiceVideoNotebookData.user.filter(
                    (x: any) => x.id == userDetails.id
                  )
                : [];
            if (found && found.length) {
              if (
                pageUrl[pageUrl.length - 1] == "notebook" &&
                (voiceVideoNotebookData.type ==
                  VIDEO_VOICE_NOTEBOOK_SOCKET_TYPE.SHARE_NOTEBOOK ||
                  voiceVideoNotebookData.type ==
                    VIDEO_VOICE_NOTEBOOK_SOCKET_TYPE.REMOVE_NOTEBOOK)
              ) {
                notebookAction.updateNotebookList(
                  voiceVideoNotebookData,
                  userDetails.id
                );
              } else if (
                pageUrl[pageUrl.length - 1] == "manage-video-message" &&
                voiceVideoNotebookData.type ==
                  VIDEO_VOICE_NOTEBOOK_SOCKET_TYPE.VIDEO_MESSAGE
              ) {
                voiceVideoMessageAction.updateVideoMessageList(
                  voiceVideoNotebookData,
                  userDetails.id
                );
              } else if (
                pageUrl[pageUrl.length - 1] == "manage-voice-mail" &&
                voiceVideoNotebookData.type ==
                  VIDEO_VOICE_NOTEBOOK_SOCKET_TYPE.VOICE_MESSAGE
              ) {
                voiceVideoMessageAction.updateVoiceMessageList(
                  voiceVideoNotebookData,
                  userDetails.id
                );
              } else {
                //Do Nothing
              }
            }
          }
        );
      }

      //Notification Count
      socket.on(SOCKET_CHANNEL.VOICE_VIDEO_NOTEBOOK_COUNT, (VVN_count: any) => {
        const found =
          VVN_count && VVN_count.user && VVN_count.user.length
            ? VVN_count.user.filter((x: any) => x.id == userDetails.id)
            : [];
        if (found && found.length) {
          notebookAction.voiceVideoNotebookCount(VVN_count, userDetails.id);
        }
      });

      //Recent Pms
      socket.on(SOCKET_CHANNEL.RECENT_PMS, (recentPms: any) => {
        if (recentPms && recentPms[userDetails.id]) {
          pmWindowAction.recentPmsListData(recentPms[userDetails.id]);
        }
      });

      //Instant Invite at Room
      socket.on(SOCKET_CHANNEL.INSTANT_INVITE_AT_ROOM, (InvitedData: any) => {
        console.log("INSTANT_INVITE_AT_ROOM=====>",InvitedData);
        
        const found =
          InvitedData && InvitedData.user && InvitedData.user.length
            ? InvitedData.user.filter(
                (x: any) => x.to_user_id == userDetails.id
              )
            : [];
        if (found && found.length) {
          // groupCategoryAction.pushDataAtInstanceInvitedUsers(InvitedData, userDetails.id)
          notificationAction.pushDataAtInstanceInvitedUsers(
            InvitedData,
            userDetails.id
          );

          const pmNotificationType = InvitedData.user.find(
            (notification: any) => {
              return notification?.type == "pm_notification";
            }
          );
          const pmRemoveUserNotificationType = InvitedData.user.find(
            (notification: any) => {
              return notification?.type == "pm_notification_remove";
            }
          );
          if (pmNotificationType) {
            setPmNotificationType(true);
          }
          if (pmRemoveUserNotificationType) {
            setPmRemoveUserNotification(true);
          }
        }
      });

      // Room video url received
      socket.on("HeartBeat", (videodata: any) => {
        if (videodata.callType === "incomingCall") {
          pmWindowAction.pmWindowReceiveIncomingCall(videodata);
        } else {
          pmWindowAction.pmWindowReceiveIncomingCall(null);
        }
        // groupCategoryAction.pushSocketDataToRoomUserVideoUrl(videodata)
      });

      // var interval = setInterval(() => {
      // socket.emit('HeartBeat', { id: 18, status: 'active', videoUrl: 'https://opentok.github.io/opentok-web-samples/Publish-Video/video/BigBuckBunny_320x180.mp4', roomId: 3 });
      // }, 4000);

      //PM Window start here
      if (pageUrl && pageUrl.length && pageUrl.includes("pm")) {
        // store socket instance into the state
        // userAction.socketInstanceContainer(socket)
        // pmRoom.tsx page updated
        // socket.on(SOCKET_CHANNEL.PM_CHAT_MESSAGE, (pmChatData: any) => {
        //   console.log("PM_CHAT_MESSAGE", pmChatData)
        //   pmWindowAction.pushSocketDataToPmWindowChat(pmChatData, userDetails.id)
        // });

        // pmRoom typing notification......
        socket.on(SOCKET_CHANNEL.PM_TYPING, (pmTyping: any) => {
          pmWindowAction.pmTypingNotification(pmTyping, userDetails.id);
        });

        socket.on(
          SOCKET_CHANNEL.PM_ADD_REMOVE_USER,
          (pmAddRemoveUserData: any) => {
            // console.log(
            //   "pmAddRemoveUserData===================>",
            //   pmAddRemoveUserData
            // );
            pmWindowAction.pmWindowAddRemoveUser(
              pmAddRemoveUserData,
              userDetails.id
            );
          }
        );

        // socket.on(SOCKET_CHANNEL.PM_DETAILS, (pmDetaiAdd Userls: any) => {
        //   pmWindowAction.updatePmWindowDetails(pmDetails.details[0])
        // })
      }

      socket.on(SOCKET_CHANNEL.PM_DETAILS, (pmDetails: any) => {
        pmWindowAction.updatePmWindowDetails(pmDetails.details[0]);
      });

      //Dig Sound
      socket.on(SOCKET_CHANNEL.DIG_SOUND, (digSound: any) => {
        if (digSound && digSound.users && digSound.users.length) {
          let found = digSound.users.filter(
            (x: any) => x.user_id == userDetails.id
          );
          if (found && found.length) {
            pmWindowAction.digSoundSocketData(digSound);
          }
        }
      });
    }

    return () => {
      socket.disconnect();
      // clearInterval(interval);
    };
  }, []);

  return null;
}

export default SocketLoader;
function showYoutubeAlert(arg0: boolean) {
  throw new Error("Function not implemented.");
}
