import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useContext,
} from "react";
import { useParams } from "react-router";
import { useHistory, Link } from "react-router-dom";
import { contextMenu } from "react-contexify";
import SweetAlert from "react-bootstrap-sweetalert";
import SideBarUsersContextMenu from "./sidebarUsersContexMenu";
import SendWhisperMessageModal from "./modal/sendWhisperMessageModal";
import CustomizedNicknameModal from "./modal/customizedNicknameModal";
import UploadRoomVideoModal from "./modal/uploadRoomVideoModal";
import { VideoEmbeder } from "../common/videoEmbeder";
import { OwnVideoPlayer } from "../common/ownVideoplay";
import ViewProfileModal from "src/components/commonModals/viewProfileModal/viewProfileModal";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import {
  useAppDeleteRoomUsers,
  useAppNormalUserMicHandleSelector,
  useAppRoomDetailsSelector,
  useAppCloseRoomUsers,
} from "src/_common/hooks/selectors/groupCategorySelector";
import { useAppGroupCategoryAction } from "src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook";
// import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector'
import { toast } from "react-toastify";
import {
  CRYPTO_SECRET_KEY,
  MENU_OPERATIONS,
  CHAT_TYPE,
  getRoomTypeValidation,
  getStatusColor,
  getBooleanStatus,
  userIdentificationSymbol,
  getRoomTypeValidationForTextOnly,
  getSubscriptionColor,
  LOGIN_STORAGE,
} from "src/_config";
import clsx from "clsx";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";

import ClickNHold from "react-click-n-hold";
import { useLongPress, LongPressDetectEvents } from "use-long-press";
import { usePmWindowApi } from "src/_common/hooks/actions/pmWindow/appPmWindowApiHook";
import StickerBuyModal from "src/components/commonModals/stickerBuyModal/stickerBuyModal";
// import useAntMediaHook from "src/hooks/useAntMedia";
import { useSelector } from "react-redux";
// import { AntmediaContext } from "src";
// import { MediaSettingsContext, SettingsContext } from "src/containers/groupsCategory/roomsDetail/roomsDetails";

import VideoCard from "./VideoCard";
import VolumeUpIcon from "@material-ui/icons//VolumeUp";
import VolumeDownIcon from "@material-ui/icons/VolumeDown";
import { Popper } from "@material-ui/core";
import CustomSweetAlert from "src/components/pm-room/customSweetAlert";
import { useCallContext, useNotificationsContext } from "src/hooks";
import {
  FaGift,
  FaHatCowboy,
  FaSortAlphaDown,
  FaSortAlphaUp,
} from "react-icons/fa";
import { AiOutlineSortAscending, AiOutlineUnorderedList } from "react-icons/ai";
import { useChatContext } from "src/hooks";

const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

function muteMe(elem: any) {
  elem.muted = true;
  elem.pause();
}

function unmuteMe(elem: any) {
  elem.muted = false;
  elem.play();
}

interface RoomsDetailsUsersSidebarFormProps {
  fetchRoomDetailsData: any;
  // myLocalData: any;
  // participants: any;
  roomName: any;

  onStartVideo: () => void;
  onStopVideo: () => void;
  onMute: () => void;
  onUnmute: () => void;
  // fetchRoom: () => Promise<SendBirdCall.Room | undefined>
}

function RoomsDetailsUsersSidebarPage({
  fetchRoomDetailsData,
  onStartVideo,
  onStopVideo,
  onMute,
  onUnmute,
  // myLocalData,
  // participants,
  roomName,
}: RoomsDetailsUsersSidebarFormProps) {
  // const mediaSettings = useContext<any>(MediaSettingsContext)

  // const antmedia = useContext<any>(AntmediaContext);

  // const settings = useContext<any>(SettingsContext);

  // const { messageDrawerOpen, participantListDrawerOpen, pinnedVideoId, pinVideo, audioTracks, globals }: any =
  //   settings;

  const [roomJoined, setRoomJoined] = useState<Number>();
  const { giftAcceptedNotification, setGiftAcceptedNotification } =
    useNotificationsContext();

  function makeid(length: any) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  // useEffect(() => {
  //   if (mediaSettings && myLocalData) {
  //     let isCameraEnabled = mediaSettings?.cam.find(
  //       (c: any) => c.eventStreamId === "localVideo"
  //     )
  //     if (isCameraEnabled.isCameraOn) {
  //       let localVid = document.getElementById("localVideo");
  //       if (localVid) {

  //         antmedia.mediaManager.localVideo = document.getElementById("localVideo");
  //         antmedia.mediaManager.localVideo.srcObject =
  //           antmedia.mediaManager.localStream;
  //       }
  //     }
  //     else {
  //       let localVid = document.getElementById("localVideo");
  //       if (localVid) {
  //         antmedia.mediaManager.localVideo = document.getElementById("localVideo");
  //         antmedia.mediaManager.localVideo.srcObject =
  //           null;
  //       }
  //     }
  //   }
  // }, [mediaSettings, myLocalData]);

  const groupCategoryApi = useGroupCategoryApi();
  const pmWindowApi = usePmWindowApi();
  const groupCategoryAction = useAppGroupCategoryAction();
  const userSelector = useAppUserDetailsSelector();
  const roomDetailsSelector = useAppRoomDetailsSelector();
  const revokeMicFromNormalUser = useAppNormalUserMicHandleSelector();
  const deleteRoomUsersSelector = useAppDeleteRoomUsers();
  const closeRoomUsersSelector = useAppCloseRoomUsers();
  const { roomId } = useParams<any>();
  const history = useHistory();
  const [alert, setAlert] = useState<any>(null);
  const [showWhisperMessageModal, setWhisperMessageModal] =
    useState<boolean>(false);
  const [showCustomizedNicknameModal, setCustomizedNicknameModal] =
    useState<boolean>(false);
  const [showRoomVideoUploadModal, setShowRoomVideoUploadModal] =
    useState<boolean>(false);
  const [membersData, setMembersData] = useState<any>();
  const [loginUsersData, setLoginUsersData] = useState<any>();
  const r_id = parseInt(cryptr.decrypt(roomId));
  const [openWebCamera, setOpenWebCamera] = useState<boolean>(false);
  const [openMicrophone, setOpenMicrophone] = useState<boolean>(false);

  const [muteAll, setMuteAll] = useState<boolean>(false);
  const [isOwnVideoAvailable, setIsOwnVideoAvailable] =
    useState<boolean>(false);
  const [ownVideoUrl, setOwnVideoUrl] = useState<any>(null);
  const [showViewProfileModal, setShowViewProfileModal] =
    useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number>();

  //For gift
  const [selectedUser, setSelectedUser] = useState<any[]>([]);
  const [webcamStream, setWebcamStream] = useState<any>(null);
  const [showStickerBuyModal, setShowStickerBuyModal] =
    useState<boolean>(false);
  //end gift

  // handraise
  const [handRaise, setHandRaise] = useState(false);
  const {
    videoAccess,
    audioAccess,
    openCall,
    setOpenCall,
    currentCallMembers,
    remoteParticipants,
    allowedMicCount,
    microphoneState,
    setMicrophoneState,
  } = useCallContext();
  // const {createFirstLiveEvent}=useSendBirdLive();
  const { sortNicknameAlphabetically, setSortNicknameAlphabetically } =
    useChatContext();
  const roomValue = useRef<any>();
  const normalOrAdminMember = useRef<any>();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [adminUserList, setAdminUserList] = useState<any>();
  const [usersGift, setUsersGift] = useState<any>([]);
  const timeouts = useRef<NodeJS.Timeout[]>([]);
  const [userWithGiftIcon, setUserWithGiftIcon] = useState(null);
  const [sortedUsersList, setSortedUsersList] = useState<any[]>([]);
  const [sortedAdminList, setSortedAdminList] = useState<any[]>([]);
  const [sortedGiftedList, setSortedGiftedList] = useState<any[]>([]);
  const [isSorted, setIsSorted] = useState(false);

  // useEffect(() => {
  //   setHandRaise(fetchRoomDetailsData?.user.room_user_status.is_raise_hand)
  // }, [fetchRoomDetailsData?.user.room_user_status.is_raise_hand])

  useEffect(() => {
    setMicrophoneState(openMicrophone);
  }, [openMicrophone]);

  const handleRemoveContactListAlertModal = (id: number, username: string) => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes"
        cancelBtnText="No"
        cancelBtnBsStyle="danger"
        confirmBtnBsStyle="success"
        allowEscape={false}
        closeOnClickOutside={false}
        title="Remove from Contact List"
        onConfirm={() => removeFromContactList(id, username)}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        {`Are you sure you want to remove ${username} from your Contact List`}
      </SweetAlert>
    );
  };

  async function detectWebcam() {
    let md = navigator.mediaDevices;
    if (!md || !md.enumerateDevices) return false;
    try {
      const devices = await md.enumerateDevices();
      const hasVideoInput = devices.some(
        (device) => "videoinput" === device.kind
      );

      if (hasVideoInput) {
        // Check if permission is granted for video input
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  async function detectMicrophone() {
    let md = navigator.mediaDevices;
    if (!md || !md.enumerateDevices) return false;
    try {
      const devices = await md.enumerateDevices();
      const hasAudioInput: boolean = devices.some(
        (device) => "audioinput" === device.kind
      );

      if (hasAudioInput) {
        // Check if permission is granted for audio input
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  // useEffect(() => {
  //   if (roomDetailsSelector && roomDetailsSelector.room && roomDetailsSelector.user && roomJoined != roomDetailsSelector.room.id) {

  //     var generatedStreamId = roomDetailsSelector.user.username.replace(/\s/g, "").replace(/[\W_]/g, "") + "_" + makeid(10);
  //     console.log("generatedStreamId", generatedStreamId)
  //     console.log("antmedia.publishStreamId", antmedia?.publishStreamId)

  //     console.log('roomName----', roomName)
  //     if (antmedia.publishStreamId) antmedia.handleLeaveFromRoom();

  //     antmedia.joinRoom(roomName, generatedStreamId);
  //     setRoomJoined(roomDetailsSelector.room.id)

  //   }

  //   console.log("roomDetailsSelector----", roomDetailsSelector)
  // }, [roomDetailsSelector])

  // useEffect(() => {    COMMENTED
  //   if (roomDetailsSelector) {
  //     setMuteAll(
  //       getBooleanStatus(
  //         roomDetailsSelector &&
  //         roomDetailsSelector.user &&
  //         roomDetailsSelector.user.room_user_settings &&
  //         roomDetailsSelector.user.room_user_settings.mute_incoming_sound
  //       )
  //     );
  //   }
  // }, [roomDetailsSelector]);

  // useEffect(() => {   COMMENTED
  //   if (roomDetailsSelector && roomDetailsSelector.room && roomDetailsSelector.room.voice_enabled == 1) {
  //     if (roomDetailsSelector.user.room_user_status.is_mic == 1) {
  //       setOpenMicrophone(true)
  //     }
  //     else {
  //       setOpenMicrophone(false)
  //     }
  //   }
  //   else {
  //     setOpenMicrophone(false)
  //   }
  // }, [roomDetailsSelector])

  // const { publishVideo, stopPublishing, enableDisableMic } = useAntMediaHook();

  const hideAlert = () => {
    setAlert(null);
  };

  const showAlert = () => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes"
        cancelBtnText="No"
        cancelBtnBsStyle="danger"
        confirmBtnBsStyle="success"
        allowEscape={false}
        closeOnClickOutside={false}
        title="Remove from favourite list"
        onConfirm={() => webCameraOnOffToggle(1)}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        Are you sure to remove from favourite contact list?
      </SweetAlert>
    );
  };

  const roomVideoUploadModalOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    if (openWebCamera) {
      toast.error("Close Webcam First and upload video");
    } else if (ownVideoUrl) {
      toast.error(
        "You have already upload a video please wait for finish and upload new one"
      );
    } else {
      setShowRoomVideoUploadModal(true);
    }
  };

  const openWebCam = (e: any) => {
    e.preventDefault();
    // if (ownVideoUrl) {
    //     toast.error('You have already upload a video please wait for finish and start webcam')
    // }
    let found = roomDetailsSelector.members.filter(
      (x: any) => x.user_id == userSelector?.id && x.is_uploadvideo != null
    );
    if (found && found.length) {
      toast.error(
        "You have already upload a video please wait for finish and start webcam"
      );
    } else {
      webCameraOnOffToggle(0);
    }
  };

  const webCameraOnOffToggle = (deviceClose: number) => {
    // if (myLocalData) {
    let params = {
      room_id: r_id,
      is_cemera: deviceClose ? 0 : openWebCamera ? 0 : 1,
      is_device_close: 1,
      // video_stream_id: myLocalData.streamId,
      video_stream_id: "",
    };
    groupCategoryApi.callCameraonOffToggle(
      params,
      (message: string, resp: any) => {
        hideAlert();
      },
      (message: string) => {}
    );
    // getRoomDetails()
    // }
  };

  // from VideoEmbeder.tsx page camera open

  const handleOpenWebcam = () => {
    setOpenWebCamera(!openWebCamera);
    webCameraOnOffToggle(0);
  };

  //call api camonoff on component unmount
  // useEffect(() => {    COMMENTED
  //   return () => {
  //     groupCategoryAction.emptyRoomDetails(); //01-09-2021 videoembeder.tsx unmount code to here and comment in videoembeder.tsx
  //     webCameraOnOffToggle(1);
  //     // window.removeEventListener('beforeunload', handleUnload);
  //   };
  // }, []);

  // Reactjs Browser Tab Close Event
  // useEffect(() => {
  //     window.addEventListener('beforeunload', handleUnload);
  // }, [])

  // const handleUnload = (e: any) => {
  //     var message = "\o/";
  //     e.preventDefault();
  //     const dialogText = 'A dialog text when leaving the page';
  //     e.returnValue = dialogText;
  //     // return webCameraOnOffToggle(1);
  // }

  const roomVideoUploadCloseModal = () => {
    if (showRoomVideoUploadModal) setShowRoomVideoUploadModal(false);
  };

  const handleExitRoom = (e: any) => {
    e.preventDefault();
    var params = {
      room_id: r_id,
    };
    groupCategoryApi.callExitFromRoom(
      params,
      (message: string, resp: any) => {
        toast.success(message);
        history.replace("");
        groupCategoryAction.emptyRoomListCategoryWise();
        history.push(`groups`);
        localStorage.removeItem("isAdminlock");
        localStorage.removeItem("sortNicknameAlphabetically");
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const onContextUserMenuClick = (e: any, member: any) => {
    e.preventDefault();
    setMembersData(member);
    setLoginUsersData(fetchRoomDetailsData.user);

    //  If is_block == null && login user id != selected user id then menu will open
    // if (!member.is_block && (member && member.details && member.details.id != userSelector?.id)) {
    // if (!member.is_block && member && member.details) {
    contextMenu.show({
      id: "user_menu_id",
      event: e,
      props: {
        memberDetails: member,
      },
    });
    // }
  };

  const whisperMessageModalClose = () => {
    if (showWhisperMessageModal) setWhisperMessageModal(false);
  };

  const customizedNicknameModalClose = () => {
    if (showCustomizedNicknameModal) setCustomizedNicknameModal(false);
  };

  const copyNicknameToClipboard = (nickname: string) => {
    try {
      navigator.clipboard.writeText(nickname);
      toast.success("Nickname copied");
    } catch (error) {
      toast.error("Unable to copied nickname");
    }
  };

  const getRoomDetails = () => {
    const params = {
      room_id: r_id,
    };
    groupCategoryApi.callGetRoomDetails(
      params,
      (message: string, resp: any) => {
        if (resp && resp.list && resp.list.length) {
        }
      },
      (message: string) => {
        console.error("Error at room details fetch");
      }
    );
  };

  const handleRemoveContactListAlert = (id: number, username: string) => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes"
        cancelBtnText="No"
        cancelBtnBsStyle="danger"
        confirmBtnBsStyle="success"
        allowEscape={false}
        closeOnClickOutside={false}
        title="Remove from Contact List"
        onConfirm={() => removeFromContactList(id, username)}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        {`Are you sure you want to remove ${username} from your Contact List`}
      </SweetAlert>
    );
  };

  const addToContactList = (id: number) => {
    const params = {
      contact_user_id: id,
    };
    groupCategoryApi.callAddtoContactList(
      params,
      (message: string, resp: any) => {
        if (resp) {
          getRoomDetails();
        }
      },
      (message: string) => {
        console.error("Error at add to room contact list");
      }
    );
  };

  const removeFromContactList = (id: number, username: string) => {
    const params = {
      contact_user_id: id,
    };
    groupCategoryApi.callRemoveFromContactList(
      params,
      (message: string, resp: any) => {
        if (resp) {
          toast.success(
            `${username} has been successfully removed from your contact list`
          );
          hideAlert();
          getRoomDetails();
        }
      },
      (message: string) => {
        console.error("Error at remove from contact list");
      }
    );
  };

  const addAsFavouriteContact = (id: number) => {
    const params = {
      contact_user_id: id,
    };
    groupCategoryApi.callAddAsFavouriteContact(
      params,
      (message: string, resp: any) => {
        if (resp) {
          getRoomDetails();
        }
      },
      (message: string) => {
        console.error("Error at add as favourite contact");
      }
    );
  };

  const addToBlockList = (id: number) => {
    const params = {
      block_user_id: id,
    };
    groupCategoryApi.callAddToBlockList(
      params,
      (message: string, resp: any) => {
        if (resp) {
          getRoomDetails();
        }
      },
      (message: string) => {
        console.error("Error at add to block list");
      }
    );
  };

  const addToIgnoreList = (id: number) => {
    const params = {
      room_id: r_id,
      ignore_user_id: id,
    };
    groupCategoryApi.callAddToIgnoreList(
      params,
      (message: string, resp: any) => {
        if (resp) {
          getRoomDetails();
        }
      },
      (message: string) => {
        console.error("Error at add to ignore list");
      }
    );
  };

  const removeFromIgnoreList = (id: number) => {
    const params = {
      room_id: r_id,
      ignore_user_id: id,
    };
    groupCategoryApi.callRemoveFromIgnoreList(
      params,
      (message: string, resp: any) => {
        if (resp) {
          getRoomDetails();
        }
      },
      (message: string) => {
        console.error("Error at remove from ignore list");
      }
    );
  };

  //Raise My Hand
  const raiseUserHandAtRoom = (e: any) => {
    const params = { room_id: r_id };
    groupCategoryApi.callRaiseHandAtRoom(
      params,
      (message: string, resp: any) => {
        if (resp) {
          // getRoomDetails()
        }
      },
      (message: string) => {
        console.error("Error at raise hand api call");
      }
    );
  };

  //Remove my raise hand
  const raiseUserHandRemoveAtRoom = (e: any) => {
    e.preventDefault();
    const params = { room_id: r_id };
    groupCategoryApi.callRaiseHandRemoveAtRoom(
      params,
      (message: string, resp: any) => {
        if (resp) {
          if (message == "Hand removed successfully.") {
            setHandRaise(false);
          }
        }
      },
      (message: string) => {
        console.error("Error at raise hand remove api call");
      }
    );
  };

  const [equalizerAnchorEl, setEqualizerAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const [equalizerValue, setEqualizerValue] = useState(0.5);

  const handleSoundEquilizer = (e: any) => {
    e.preventDefault();
    setEqualizerAnchorEl(equalizerAnchorEl ? null : e.currentTarget);
  };

  const openEqualizer = Boolean(equalizerAnchorEl);
  const openEqualizerId = openEqualizer ? "simple-popper" : undefined;

  const handleEqualizerChange = (e: any) => {
    setEqualizerValue(e.target.value);
  };

  useEffect(() => {
    document.querySelectorAll("video, audio").forEach((elem: any) => {
      elem.volume = equalizerValue;
    });
  }, [equalizerValue]);

  const handleMuteAllMembers = (e: any) => {
    e.preventDefault();

    const params = {
      room_id: r_id,
      key_name: MENU_OPERATIONS.MUTE_INCOMING_SOUND,
      key_value:
        roomDetailsSelector &&
        roomDetailsSelector.user &&
        roomDetailsSelector.user.room_user_settings &&
        roomDetailsSelector.user.room_user_settings[
          MENU_OPERATIONS.MUTE_INCOMING_SOUND
        ]
          ? 0
          : 1,
    };

    groupCategoryApi.callChangeUserRoomSettings(
      params,
      (message: string, resp: any) => {
        if (resp) {
          setMuteAll(!muteAll);
          getRoomDetails();
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  // View Profile at Member list
  const handleViewProfile = (id: number) => {
    setSelectedUserId(id);
    setShowViewProfileModal(true);
  };

  const onViewProfileModalClose = () => {
    setShowViewProfileModal(false);
  };

  const handleRedDotForIndividualUser = (
    redDotType: string,
    userId: number,
    data: any
  ) => {
    var redDotValue: number = 0;
    switch (redDotType) {
      case MENU_OPERATIONS.RED_DOT_ALL:
        redDotValue = data.mic && data.text && data.cam ? 0 : 1;
        break;
      case MENU_OPERATIONS.RED_DOT_FOR_MIC:
        redDotValue = data.mic ? 0 : 1;
        break;
      case MENU_OPERATIONS.RED_DOT_FOR_TEXT:
        redDotValue = data.text ? 0 : 1;
        break;
      case MENU_OPERATIONS.RED_DOT_FOR_CAM:
        redDotValue = data.cam ? 0 : 1;
        break;
      default:
        break;
    }
    const params = {
      room_id: r_id,
      user_id: userId,
      red_dot_type: redDotType,
      is_red_dot: redDotValue,
    };
    groupCategoryApi.callRedDotForIndividualUser(
      params,
      (message: string, resp: any) => {
        if (resp) {
        }
      },
      (message: string) => {
        console.error(message);
      }
    );
  };

  /*---------------------- Admin Activity Function ---------------------------*/

  const removeUserHandFromRoom = (room_id: number, user_id: number) => {
    const params = { room_id, user_id };
    groupCategoryApi.callRemoveHandFromRoom(
      params,
      (message: string, resp: any) => {
        if (resp) {
          getRoomDetails();
        }
      },
      (message: string) => {
        console.error("Error at remove hand api call");
      }
    );
  };

  const kickUserFromRoom = (room_id: number, user_id: number) => {
    const params = { room_id, user_id };
    groupCategoryApi.callKickUserFromRoom(
      params,
      (message: string, resp: any) => {
        if (resp) {
          getRoomDetails();
        }
      },
      (message: string) => {
        console.error("Error at kick user api call");
      }
    );
  };

  const handleSendPm = (id: number) => {
    //if id equals login user id then not open pm window
    // if (id != userSelector?.id) {
    const params = {
      user_id: id,
    };

    pmWindowApi.callSendPms(
      params,
      (message: string, resp: any) => {
        if (resp) {
          const userId = cryptr.encrypt(resp.id);
          // history.replace("");
          history.push(`/pm/${userId}`);
        } else {
          toast.error(message);
        }
      },
      (message: string, resp: any) => {
        toast.error(message);
      }
    );
    // }
  };

  /*---------------------- End Admin Activity Function ---------------------------*/

  //for stricker
  const openStickerBuyModal = (id: number) => {
    // e.preventDefault()
    // setByStickerModalType('ownStickerBuy')
    setSelectedUser([id]);
    setShowStickerBuyModal(true);
  };
  const handleOnCloseSticker = () => {
    setShowStickerBuyModal(false);
    setSelectedUser([]);
    // setSelectedContactList([])
    // setByStickerModalType('')
    // getStickerCategory()
  };

  const contextMenuOperationParams = (data: {
    id: number;
    userName: string;
    customize_nickname: any;
    whisper_channel: any;
    operation: string;
  }) => {
    switch (data.operation) {
      case MENU_OPERATIONS.SEND_PM:
        // if (antmedia.publishStreamId) antmedia.handleLeaveFromRoom();
        handleSendPm(data.id);
        break;
      case MENU_OPERATIONS.WHISPER_MESSAGE:
        setWhisperMessageModal(true);
        setMembersData({
          id: data.id,
          userName: data.userName,
          type: CHAT_TYPE.WHISPER,
          customize_nickname: data.customize_nickname,
          whisper_channel: data.whisper_channel,
        });
        break;
      case MENU_OPERATIONS.CUSTOMIZED_NICKNAME:
        setCustomizedNicknameModal(true);
        setMembersData({
          id: data.id,
          userName: data.userName,
          customize_nickname: data.customize_nickname,
        });
        break;
      case MENU_OPERATIONS.COPY_NICKNAME:
        copyNicknameToClipboard(data.userName);
        break;
      case MENU_OPERATIONS.ADD_TO_CONTACT_LIST:
        addToContactList(data.id);
        break;
      case MENU_OPERATIONS.ADD_TO_FAVOURITE_CONTACT:
        addAsFavouriteContact(data.id);
        break;
      case MENU_OPERATIONS.ADD_TO_BLOCK_LIST:
        addToBlockList(data.id);
        break;
      case MENU_OPERATIONS.REMOVE_FROM_CONTACT_LIST:
        // removeFromContactList(data.id)
        handleRemoveContactListAlert(
          data.id,
          data.customize_nickname ? data.customize_nickname : data.userName
        );
        break;
      case MENU_OPERATIONS.KICK_USER:
        kickUserFromRoom(r_id, data.id);
        break;
      case MENU_OPERATIONS.REMOVE_USER_HAND:
        removeUserHandFromRoom(r_id, data.id);
        break;
      case MENU_OPERATIONS.ADD_TO_IGNORE_USER_LIST:
        addToIgnoreList(data.id);
        break;
      case MENU_OPERATIONS.REMOVE_IGNORE_USER_LIST:
        removeFromIgnoreList(data.id);
        break;
      case MENU_OPERATIONS.VIEW_USER_WEBCAM:
        // history.push('#subscriber-' + data.id)
        let found = document.getElementById("viewcam-" + data.id);

        if (found) {
          found.click();
        }
        break;

      case MENU_OPERATIONS.VIEW_PROFILE:
        handleViewProfile(data.id);
        break;

      case MENU_OPERATIONS.RED_DOT_ALL:
        handleRedDotForIndividualUser(MENU_OPERATIONS.RED_DOT_ALL, data.id, {
          mic: roomDetailsSelector.members[
            roomDetailsSelector.members.findIndex(
              (x: any) => x.user_id == data.id
            )
          ].red_dot_mic,
          text: roomDetailsSelector.members[
            roomDetailsSelector.members.findIndex(
              (x: any) => x.user_id == data.id
            )
          ].red_dot_text,
          cam: roomDetailsSelector.members[
            roomDetailsSelector.members.findIndex(
              (x: any) => x.user_id == data.id
            )
          ].red_dot_camera,
        });
        break;
      case MENU_OPERATIONS.RED_DOT_FOR_MIC:
        handleRedDotForIndividualUser(
          MENU_OPERATIONS.RED_DOT_FOR_MIC,
          data.id,
          {
            mic: roomDetailsSelector.members[
              roomDetailsSelector.members.findIndex(
                (x: any) => x.user_id == data.id
              )
            ].red_dot_mic,
            text: null,
            cam: null,
          }
        );
        break;
      case MENU_OPERATIONS.RED_DOT_FOR_TEXT:
        handleRedDotForIndividualUser(
          MENU_OPERATIONS.RED_DOT_FOR_TEXT,
          data.id,
          {
            text: roomDetailsSelector.members[
              roomDetailsSelector.members.findIndex(
                (x: any) => x.user_id == data.id
              )
            ].red_dot_text,
            mic: null,
            cam: null,
          }
        );
        break;
      case MENU_OPERATIONS.RED_DOT_FOR_CAM:
        handleRedDotForIndividualUser(
          MENU_OPERATIONS.RED_DOT_FOR_CAM,
          data.id,
          {
            cam: roomDetailsSelector.members[
              roomDetailsSelector.members.findIndex(
                (x: any) => x.user_id == data.id
              )
            ].red_dot_camera,
            text: null,
            mic: null,
          }
        );
        break;
      case MENU_OPERATIONS.SEND_VIRTUAL_GIFT:
        openStickerBuyModal(data.id);
        break;

      case MENU_OPERATIONS.SEND_GIFT_SUBSCRIPTION:
        openStickerBuyModal(data.id);
        break;

      default:
        break;
    }
  };

  // Room Delete socket fire action & page redirected to group page
  useEffect(() => {
    deleteRoomUsersSelector &&
      deleteRoomUsersSelector.length &&
      deleteRoomUsersSelector.map((x: any) => {
        if (
          x.user_id === (userSelector && userSelector.id) &&
          roomDetailsSelector.room.id === x.room_id
        ) {
          //is_admin : 3 for room owner. in future below message will remove for owner
          toast.error("Room deleted!");
          history.replace("");
          history.push(`groups`);
        }
      });
  }, [deleteRoomUsersSelector]);

  // Close socket fire action & page redirected to group page
  useEffect(() => {
    closeRoomUsersSelector &&
      closeRoomUsersSelector.length &&
      closeRoomUsersSelector.map((x: any) => {
        if (
          x.user_id === (userSelector && userSelector.id) &&
          roomDetailsSelector.room.id === x.room_id
        ) {
          //is_admin : 3 for room owner. in future below message will remove for owner
          // toast.error("Room does not exist!")
          groupCategoryAction.emptyCloseRoomValues([]);
          history.replace("");
          history.push(`groups`);
        }
      });
  }, [closeRoomUsersSelector]);

  // console.log("roomDetailsSelector", roomDetailsSelector)

  // const handleGrabMic = (grab: number) => {
  //     const params = {
  //         room_id: fetchRoomDetailsData.room.id,
  //         is_grab: grab
  //     }
  //     groupCategoryApi.callGrabMic(params, (message: string, resp: any) => {
  //         if (resp) {
  //             toast.success(message)
  //             if (userSelector) {
  //                 groupCategoryAction.normalUserEnableMic({ userId: userSelector.id, enable: grab })
  //             }
  //         }
  //     }, (message: string) => {
  //         toast.error(message)
  //     })
  // }

  //when admin/owner revoke mike(remove all mic,give mic to all,simultenious mike every time click this menu reset normal user mic) from other user if user talk to other then revoke talk permission
  //NOTE:APPLICABLE ONLY FOR ROOM NORMAL USER

  useEffect(() => {
    // if (roomDetailsSelector && roomDetailsSelector.room && roomDetailsSelector.room.join_status && [0].includes(roomDetailsSelector.room.join_status.is_admin)) {
    if (revokeMicFromNormalUser) {
      // if (revokeMicFromNormalUser && myLocalData) {
      // setOpenMicrophone(false)
      const params = {
        // room_id: fetchRoomDetailsData.room.id,
        room_id: parseInt(roomValue.current.value),
        is_grab: 0,
        // video_stream_id: myLocalData.streamId,
        video_stream_id: "",
      };
      groupCategoryApi.callGrabMic(
        params,
        (message: string, resp: any) => {
          if (resp) {
            // toast.success(message)
            if (userSelector) {
              groupCategoryAction.normalUserEnableMic({
                userId: userSelector.id,
                enable: 0,
              });
            }
            setOpenMicrophone(false);
            // setMicrophoneState(false);
          }
        },
        (message: string) => {
          toast.error(message);
        }
      );
      // reset revokeMicFromNormalUser to false
      groupCategoryAction.resetNormalUserMicHandleIsChanged(false);
    }
    // }
  }, [revokeMicFromNormalUser]);

  // end of the revoke logic

  const isOwnVideoExist = useCallback(() => {
    if (
      userSelector &&
      roomDetailsSelector &&
      roomDetailsSelector.members &&
      roomDetailsSelector.members.length
    ) {
      let found = roomDetailsSelector.members.filter(
        (x: any) => x.user_id == userSelector.id && x.is_uploadvideo != null
      );
      if (found && found.length) {
        setIsOwnVideoAvailable(true);
        setOwnVideoUrl(found[0]);
      } else {
        setIsOwnVideoAvailable(false);
        setOwnVideoUrl(null);
      }
    }
  }, [userSelector, roomDetailsSelector]);

  const isOwnStreamExist = useCallback(() => {
    if (
      userSelector &&
      roomDetailsSelector &&
      roomDetailsSelector.members &&
      roomDetailsSelector.members.length
    ) {
      let found = roomDetailsSelector.members.filter(
        (x: any) => x.user_id == userSelector.id && x.video_stream_id != null
        // &&
        // x.video_stream_id.includes(`room_${roomDetailsSelector.room.id}`)
      );
      if (found && found.length && !openWebCamera) {
        // startStream();
        enableDisableCamera();
      } else {
        if (!openWebCamera || found.length == 0) {
          let videox: any = document.querySelector("#myVideo")!;
          videox.srcObject = null;
          setOpenWebCamera(false);
          setWebcamStream(null);
          if (webcamStream) {
            webcamStream.getTracks().forEach((track: any) => {
              track.stop();
            });
          }
          // webCameraOnOffToggle(1);
        }
      }
    }
  }, [roomDetailsSelector, userSelector, openWebCam, fetchRoomDetailsData]);

  const enableDisableCamera = async () => {
    // if (openWebCamera) {

    //   setOpenWebCamera(false)
    //   mediaSettings?.toggleSetCam({
    //     eventStreamId: "localVideo",
    //     isCameraOn: false,
    //   });

    //   if (myLocalData?.streamId) {
    //     antmedia.checkAndTurnOffLocalCamera(myLocalData.streamId);
    //     antmedia.handleSendNotificationEvent(
    //       "CAM_TURNED_OFF",
    //       myLocalData.streamId
    //     );

    //     antmedia.mediaManager.localVideo = document.getElementById("localVideo");
    //     antmedia.mediaManager.localVideo.srcObject =
    //       null;

    //   } else {
    //     antmedia.checkAndTurnOffLocalCamera("localVideo");
    //   }
    // }
    // else {

    //   let isWebCamAttached = await detectWebcam();

    //   if (!isWebCamAttached) {
    //     setMediaDevicesError(
    //       < CustomSweetAlert
    //         type="warning"
    //         showCancel={false}
    //         confirmBtnText="Ok"

    //         cancelBtnBsStyle="danger"
    //         confirmBtnBsStyle="warning"
    //         allowEscape={false}
    //         closeOnClickOutside={false}
    //         title="No Video device detected! Please, do the following"
    //         onConfirmFunc={() => {
    //           setMediaDevicesError(null)
    //         }
    //         }
    //         focusCancelBtn={true}
    //         innerText={
    //           <>
    //             <p>a. Check your webcam is connected to your device.</p>
    //             <p>b. Check if you have proper driver installed for your webcam</p>
    //             <p>c. Check if your webcam is powered.</p>
    //             <p>d. Check if your webcam is not used by other browser or application.</p>
    //           </>}
    //       />
    //     )
    //     return
    //   }

    //   let isMicrophoneAttached = await detectMicrophone();
    //   if (!isMicrophoneAttached) {
    //     setMediaDevicesError(
    //       < CustomSweetAlert
    //         type="warning"
    //         showCancel={false}
    //         confirmBtnText="Ok"

    //         cancelBtnBsStyle="danger"
    //         confirmBtnBsStyle="warning"
    //         allowEscape={false}
    //         closeOnClickOutside={false}
    //         title="No Audio device detected! Please, do the following"
    //         onConfirmFunc={() => {
    //           setMediaDevicesError(null)
    //         }
    //         }
    //         focusCancelBtn={true}
    //         innerText={
    //           <>
    //             <p>a. Check your microphone is connected to your device.</p>
    //             <p>b. Check if you have proper driver installed for your microphone</p>
    //             <p>c. Check if your microphone is powered.</p>
    //             <p>d. Check if your microphone is not used by other browser or application.</p>
    //           </>}
    //       />
    //     )
    //     return
    //   }

    //   if (myLocalData?.streamId) {

    //     setOpenWebCamera(true)
    //     mediaSettings?.toggleSetCam({
    //       eventStreamId: "localVideo",
    //       isCameraOn: true,
    //     });

    //     antmedia.checkAndTurnOnLocalCamera(myLocalData.streamId);
    //     antmedia.handleSendNotificationEvent(
    //       "CAM_TURNED_ON",
    //       myLocalData.streamId
    //     );

    //     if (mediaSettings && myLocalData) {
    //       antmedia.mediaManager.localVideo = document.getElementById("localVideo");
    //       antmedia.mediaManager.localVideo.srcObject =
    //         antmedia.mediaManager.localStream;
    //     }

    //   } else {
    //     antmedia.checkAndTurnOnLocalCamera("localVideo");
    //   }
    // }

    webCameraOnOffToggle(0);
  };
  const startStream = () => {
    if (openWebCamera) {
      stopStream();
    } else {
      // Check if device has camera
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then((stream) => {
          if (stream) {
            let videox: any = document.querySelector("#myVideo")!;
            videox.srcObject = stream;
            setOpenWebCamera(true);
            setWebcamStream(stream);
            // publishVideo(
            //   `stream_${roomDetailsSelector?.user?.id}_room_${roomDetailsSelector?.room?.id}`,
            //   stream
            // )
            webCameraOnOffToggle(0);
          }
        })
        .catch((err) => {
          setOpenWebCamera(false);
          if (webcamStream) {
            webcamStream.getTracks().forEach((track: any) => {
              track.stop();
            });
            // stopPublishing(
            //   `stream_${roomDetailsSelector?.user?.id}_room_${roomDetailsSelector?.room?.id}`
            // );
          }
        });
    }
  };

  const stopStream = () => {
    setOpenWebCamera(false);

    // if(webcamStream){
    webcamStream.getTracks().forEach((track: any) => {
      track.stop();
    });
    // }

    // stopPublishing(
    //   `stream_${roomDetailsSelector?.user?.id}_room_${roomDetailsSelector?.room?.id}`
    // );
    webCameraOnOffToggle(0);
  };

  // useEffect(() => {  COMMENTED
  //   isOwnVideoExist();
  //   isOwnStreamExist();
  // }, [roomDetailsSelector]);

  // const handleOnMicrophone = () => {
  //     // e.preventDefault()
  //     setOpenMicrophone(true)
  // }

  const [mediaDevicesError, setMediaDevicesError] = useState<any>(null);

  //  Grab microphone
  const handleOnMouseDown = async () => {
    let isMicrophoneAttached = await detectMicrophone();
    if (!isMicrophoneAttached) {
      setMediaDevicesError(
        <CustomSweetAlert
          type="warning"
          showCancel={false}
          confirmBtnText="Ok"
          cancelBtnBsStyle="danger"
          confirmBtnBsStyle="warning"
          allowEscape={false}
          closeOnClickOutside={false}
          title="No Audio device detected! Please, do the following"
          onConfirmFunc={() => {
            setMediaDevicesError(null);
          }}
          focusCancelBtn={true}
          innerText={
            <>
              <p>a. Check your microphone is connected to your device.</p>
              <p>
                b. Check if you have proper driver installed for your microphone
              </p>
              <p>c. Check if your microphone is powered.</p>
            </>
          }
        />
      );
      return;
    }

    // mediaSettings?.toggleSetMic({
    //   eventStreamId: 'localVideo',
    //   isMicMuted: false,
    // });
    // antmedia.unmuteLocalMic();
    // if (mediaSettings?.myLocalData?.streamId) {
    //   antmedia.handleSendNotificationEvent('MIC_UNMUTED', mediaSettings?.myLocalData?.streamId);
    // }

    setOpenMicrophone(true);
    // setMicrophoneState(true)

    const params = {
      room_id: parseInt(roomValue.current.value),
      is_grab: 1,
      // video_stream_id: myLocalData.streamId,
      video_stream_id: "",
    };
    groupCategoryApi.callGrabMic(
      params,
      (message: string, resp: any) => {
        if (resp) {
          // enableDisableMic(0)

          // toast.success(message)
          if (userSelector) {
            groupCategoryAction.normalUserEnableMic({
              userId: userSelector.id,
              enable: 1,
            });
            // setOpenMicrophone(true);

            // getRoomDetails()
          }
          // setOpenMicrophone(true);
        }
      },
      (message: string) => {
        // toast.error(message);
      }
    );
    // } else {
    //     setOpenMicrophone(true)
    // }
  };

  //  Release grab mic
  const handleOnMouseUp = () => {
    // mediaSettings?.toggleSetMic({
    //   eventStreamId: 'localVideo',
    //   isMicMuted: true,
    // });
    // antmedia.muteLocalMic();
    // if (mediaSettings?.myLocalData?.streamId) {
    //   antmedia.handleSendNotificationEvent('MIC_MUTED', mediaSettings?.myLocalData?.streamId);
    //   antmedia.updateAudioLevel(mediaSettings?.myLocalData?.streamId, 0);
    // }
    setOpenMicrophone(false);
    // setMicrophoneState(false)

    const params = {
      room_id: parseInt(roomValue.current.value),
      is_grab: 0,
      // video_stream_id: myLocalData.streamId,
      video_stream_id: "",
    };
    groupCategoryApi.callGrabMic(
      params,
      (message: string, resp: any) => {
        if (resp) {
          // enableDisableMic(1)
          // toast.success(message)
          if (userSelector) {
            groupCategoryAction.normalUserEnableMic({
              userId: userSelector.id,
              enable: 0,
            });
            // setOpenMicrophone(false);

            // getRoomDetails()
          }
          // setOpenMicrophone(false);
        }
      },
      (message: string) => {
        // toast.error(message);
      }
    );

    // } else {
    //     setOpenMicrophone(false)
    // }
  };

  const handleClick = () => {
    handleOnMouseUp();
  };

  const callback = React.useCallback(() => {
    // alert("Long pressed!");
    // handleOnMouseUp()
    handleOnMouseDown();
  }, []);

  const bind = useLongPress(callback, {
    onStart: () => {
      // handleOnMouseDown()
    },
    onFinish: () => {
      handleOnMouseUp();
    },
    onCancel: () => {
      handleOnMouseUp();
    },
    //onMove: () => console.log("Detected mouse or touch movement"),
    threshold: 200,
    captureEvent: true,
    cancelOnMovement: false,
    detect: LongPressDetectEvents.BOTH,
  });

  const handleLockUnlockMic = () => {
    if (openMicrophone) {
      //Un grab mic
      handleOnMouseUp();
    } else {
      //Grab mic
      handleOnMouseDown();
    }
  };

  //red dot apply if user is in taking mode then release mic and disabled mic icon for both push to talk and lockmic
  // useEffect(() => {  COMMENTED
  //   // if microphone open then proceed
  //   if (openMicrophone) {
  //     if (
  //       roomDetailsSelector &&
  //       roomDetailsSelector.user &&
  //       roomDetailsSelector.user.room_user_status &&
  //       roomDetailsSelector.user.room_user_status.red_dot_mic
  //     ) {
  //       handleOnMouseUp();
  //     }
  //   }
  // }, [roomDetailsSelector]);

  //red dot apply if user is in webstreeming mode then close webcam and disabled cam icon for webcam and upload video
  // useEffect(() => {      COMMENTED
  //   // if webcam open then proceed
  //   if (openWebCamera) {
  //     if (
  //       roomDetailsSelector &&
  //       roomDetailsSelector.user &&
  //       roomDetailsSelector.user.room_user_status &&
  //       roomDetailsSelector.user.room_user_status.red_dot_camera
  //     ) {
  //       setOpenWebCamera(!openWebCamera);
  //       webCameraOnOffToggle(0);
  //     }
  //   }
  // }, [roomDetailsSelector]);

  // useEffect(() => {
  //   console.log("MUTING AUDIO USE EFFECT")
  //   mediaSettings?.toggleSetMic({
  //     eventStreamId: 'localVideo',
  //     isMicMuted: true,
  //   });
  //   antmedia.muteLocalMic();
  //   if (mediaSettings?.myLocalData?.streamId) {
  //     antmedia.handleSendNotificationEvent('MIC_MUTED', mediaSettings?.myLocalData?.streamId);
  //     antmedia.updateAudioLevel(mediaSettings?.myLocalData?.streamId, 0);
  //   }
  // }, [])

  const [micDisabled, setMicDisabled] = useState<any>(false);

  const startStreamInsideRoom = () => {
    if (openWebCamera) {
      stopStream();
    } else {
      // Check if device has camera
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then((stream) => {
          if (stream) {
            let videox: any = document.querySelector("#myVideo")!;
            videox.srcObject = stream;
            setOpenWebCamera(true);
            setWebcamStream(stream);
            // publishVideo(
            //   `stream_${roomDetailsSelector?.user?.id}_room_${roomDetailsSelector?.room?.id}`,
            //   stream
            // )
            webCameraOnOffToggle(0);
          }
        })
        .catch((err) => {
          setOpenWebCamera(false);
          if (webcamStream) {
            webcamStream.getTracks().forEach((track: any) => {
              track.stop();
            });
            // stopPublishing(
            //   `stream_${roomDetailsSelector?.user?.id}_room_${roomDetailsSelector?.room?.id}`
            // );
          }
          console.log(err);
        });
    }
  };

  useEffect(() => {
    if (
      roomDetailsSelector &&
      roomDetailsSelector.members &&
      roomDetailsSelector.room_setting &&
      userSelector
    ) {
      let findCount = roomDetailsSelector.members.filter((ele: any) => {
        return ele.is_mic == 1 && userSelector.id != ele.user_id;
      });
      if (
        findCount.length < roomDetailsSelector.room_setting.simultaneous_mics
      ) {
        setMicDisabled(false);
      } else {
        let findObj = roomDetailsSelector.members.find((ele: any) => {
          return ele.is_mic == 1 && userSelector.id == ele.user_id;
        });
        setMicDisabled(findObj ? false : true);
      }
    }
  }, [roomDetailsSelector]);

  useEffect(() => {
    handleUsersList();
  }, [fetchRoomDetailsData]);

  const handleUsersList = () => {
    if (fetchRoomDetailsData?.room?.room_type_id === 2) {
      setUsersList(fetchRoomDetailsData?.members);
    } else {
      setUsersList(
        fetchRoomDetailsData?.members?.filter(
          (user: any) => user.is_admin === 0
        )
      );
    }
  };

  const signInAs = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS);
  const {
    id: userId,
    send_bird_user: { sb_access_token },
  } = signInAs
    ? JSON.parse(signInAs)
    : {
        id: null,
        send_bird_user: { sb_access_token: null },
      };

  const currentMembersWithVideo = currentCallMembers
    .filter((mems) => {
      return mems?.isVideoEnabled && mems?.user?.userId !== userId;
    })
    .map((mems) => {
      return mems?.user.userId;
    });
  const currentMembersWithAudio = currentCallMembers
    .filter((mems) => {
      return mems?.isAudioEnabled && mems?.user?.userId !== userId;
    })
    .map((mems) => {
      return mems?.user.userId;
    });

  const micLimit = allowedMicCount;

  // if(fetchRoomDetailsData &&
  //   fetchRoomDetailsData.user &&
  //   fetchRoomDetailsData.user.room_user_status &&
  //   getBooleanStatus(
  //     fetchRoomDetailsData.user.room_user_status.is_raise_hand
  //   ))

  const startWebCam = async () => {
    await onStartVideo();
    // createFirstLiveEvent("311")
  };

  useEffect(() => {
    if (
      giftAcceptedNotification &&
      fetchRoomDetailsData?.members &&
      usersList
    ) {
      const userWithGift = fetchRoomDetailsData?.members?.find(
        (user: any) => user?.user_id == giftAcceptedNotification?.from_user_id
      );
      if (userWithGift) {
        setUsersGift((prevUsersGift: any) => [userWithGift, ...prevUsersGift]);
        const timeout = setTimeout(() => {
          setUsersGift((prevUsersGift: any) =>
            prevUsersGift.filter(
              (user: any) => user.user_id !== userWithGift.user_id
            )
          );
        }, 25000);
        timeouts.current.push(timeout);
      }
      setGiftAcceptedNotification(null);
    }
  }, [giftAcceptedNotification, fetchRoomDetailsData, usersList]);

  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  const userStyle = {
    marginBottom: "2px",
  };

  const sortMembers = (members: any[]) => {
    return members.sort((a, b) => {
      if (a.is_admin === 3) return -1;
      if (b.is_admin === 3) return 1;
      return 0;
    });
  };

  const sortedMembers = sortMembers(fetchRoomDetailsData?.members || []); // AdminList

  const uniqueUsersList =
    usersList && usersList.length > 0
      ? Array.from(new Set(usersList.map((u) => u.user_id)))
          .map((id) => usersList.find((u) => u.user_id === id))
          .filter(
            (user) =>
              !usersGift.some(
                (giftedUser: any) => giftedUser.user_id === user?.user_id
              )
          )
      : [];

  const adminUserIds = new Set(
    sortedMembers
      .filter((member) => member.is_admin !== 0)
      .map((admin) => admin.details.id)
  );

  const giftedUserIds = new Set(usersGift.map((user: any) => user.details.id));

  useEffect(() => {
    const sortUsersAlphabetically = (users: any) => {
      if (!users || users.length === 0) return [];
      return users
        .map((user: any) => ({
          user,
          username: user?.details?.username || "Unknown",
        }))
        .sort((a: any, b: any) => {
          let usernameA = a.username.toLowerCase();
          let usernameB = b.username.toLowerCase();
          return usernameA.localeCompare(usernameB);
        });
    };

    if (sortNicknameAlphabetically) {
      setSortedUsersList(sortUsersAlphabetically(uniqueUsersList));
      setSortedAdminList(sortUsersAlphabetically(sortedMembers));
      setSortedGiftedList(sortUsersAlphabetically(usersGift));
      setIsSorted(true);
    } else {
      setSortedUsersList(uniqueUsersList);
      setSortedAdminList(sortedMembers);
      setSortedGiftedList(usersGift);
      setIsSorted(false);
    }
  }, [sortNicknameAlphabetically, usersList, sortedMembers, usersGift]);

  const renderGiftedList = isSorted
    ? sortedGiftedList.map((user) => user.user)
    : usersGift;

  const renderAdminList = isSorted
    ? sortedAdminList.map((user) => user.user)
    : sortedMembers;

  const renderUserList = isSorted
    ? sortedUsersList.map((user) => user.user)
    : uniqueUsersList;

  // const handleClickSort = () => {
  //   if (isSorted) {
  //     setIsSorted(false);
  //   } else {
  //     sortAlphabetically();
  //   }
  // };

  return (
    <React.Fragment>
      {/* {audioTracks.map((audio: any, index: any) => (
        <VideoCard
          key={index}
          onHandlePin={() => { }}
          id={audio.streamId}
          track={audio.track}
          autoPlay
          name={""}
          style={{ display: "none" }}
        />
      ))} */}
      <input
        type="hidden"
        ref={roomValue}
        id="roomid"
        value={
          roomDetailsSelector && roomDetailsSelector.room
            ? roomDetailsSelector.room.id
            : 0
        }
      />
      <input
        type="hidden"
        ref={normalOrAdminMember}
        id="normalOrAdminMember"
        value={
          roomDetailsSelector &&
          roomDetailsSelector.room &&
          roomDetailsSelector.room.join_status
            ? roomDetailsSelector.room.join_status.is_admin
            : null
        }
      />

      {alert}
      {/* <video id="localVideo" autoPlay playsInline muted/> */}
      <div className="col-sm-3">
        <div className="webcam-show">
          <div className="webcam-show-head">
            {/* <VideoCard
              onHandlePin={() => {
                pinVideo("localVideo");
              }}
              id="localVideo"
              autoPlay
              name="You"
              muted
              hidePin={true}
            /> */}

            {/* {
              participants.length > 0 &&
              participants.map(({ id, videoLabel, track, name }: any, index: any) => {
                if (id !== "localVideo") {
                  return (
                    <div className="unpinned" key={index}>
                      <div className="single-video-container">
                        <VideoCard
                          id={id}
                          track={track}
                          autoPlay
                          name={name}
                        />
                      </div>
                    </div>
                  );
                }
                 else {
                  return (
                    <div className="unpinned">
                      <div className="single-video-container " key={index}>
                        <VideoCard
                          onHandlePin={() => {
                            pinVideo("localVideo");
                          }}
                          id="localVideo"
                          autoPlay
                          name="You"
                          muted
                        />
                      </div>
                    </div>
                  );
                }
              })} */}

            <div
              className="webcam-name"
              style={{
                color: getSubscriptionColor(
                  fetchRoomDetailsData && fetchRoomDetailsData.user
                ),
              }}
            >
              <span
                style={{
                  backgroundColor: getStatusColor(
                    userSelector && userSelector.visible_status
                  ),
                }}
              />
              {roomDetailsSelector && roomDetailsSelector?.user
                ? roomDetailsSelector.user.username
                : "---"}
              {roomDetailsSelector?.user &&
                roomDetailsSelector?.user?.user_badge &&
                roomDetailsSelector?.user?.user_badge?.current_badge &&
                new Date(
                  roomDetailsSelector?.user?.user_badge?.expiry_date.replaceAll(
                    "-",
                    "/"
                  )
                ).getTime() > new Date().getTime() && (
                  <img
                    src={
                      roomDetailsSelector?.user?.user_badge?.current_badge?.icon
                        ?.original
                    }
                    alt="badge"
                    style={{
                      marginLeft: "4px",
                      verticalAlign: "middle",
                      width: "12px",
                      height: "auto",
                    }}
                  />
                )}
            </div>
            <div
              className={
                roomDetailsSelector &&
                roomDetailsSelector.user &&
                roomDetailsSelector.user.room_user_status &&
                roomDetailsSelector.user.room_user_status.red_dot_camera
                  ? "dropdown webcam-status disable-link"
                  : "dropdown webcam-status"
              }
              style={
                roomDetailsSelector &&
                roomDetailsSelector.room &&
                roomDetailsSelector.room.video_enabled == 0
                  ? {
                      pointerEvents: "none",
                    }
                  : {}
              }
            >
              <img
                id="page-header-user-dropdown"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                src={
                  openCall && videoAccess
                    ? "/img/webcam-icon.png"
                    : "/img/webcam-white-icon.png"
                }
                alt="webcam"
              />
              <div className="dropdown-menu dropdown-menu-right">
                {/* {participants
                  .filter((p: any) => p.videoLabel !== p.id)
                  .map(({ id, videoLabel, track, name }: any, index: any) => (
                    <>
                      <div
                        className="single-video-container not-pinned"
                        key={index}
                        style={{
                          width: "var(--width)",
                          height: "var(--height)",
                          maxWidth: "var(--maxwidth)",
                        }}
                      >
                        <VideoCard
                          onHandlePin={() => {
                            pinVideo(id, videoLabel);
                          }}
                          id={id}
                          track={track}
                          autoPlay
                          name={name}
                        />
                      </div>
                    </>
                  ))} */}

                <button
                  className="dropdown-item"
                  // href="#"
                  // onClick={async (e) => {
                  //   if (
                  //     roomDetailsSelector &&
                  //     roomDetailsSelector.user &&
                  //     getRoomTypeValidation(
                  //       fetchRoomDetailsData &&
                  //         fetchRoomDetailsData.room &&
                  //         fetchRoomDetailsData.room.type
                  //     )
                  //   ) {
                  //     // startStream();
                  //     enableDisableCamera();
                  //   }
                  // }}
                >
                  <i className="bx bx-wallet font-size-16 align-middle mr-1" />
                  {openCall && videoAccess ? (
                    <span
                      key="t-my-wallet"
                      onClick={() => {
                        onStopVideo();
                      }}
                    >
                      Close Webcam
                    </span>
                  ) : (
                    <span
                      key="t-my-wallet"
                      onClick={() => {
                        if (!videoAccess) {
                          startWebCam();
                        }
                      }}
                    >
                      Open Webcam
                    </span>
                  )}
                </button>

                <button
                  className="dropdown-item"
                  // href="#"
                  onClick={(e) => {
                    if (
                      getRoomTypeValidation(
                        fetchRoomDetailsData &&
                          fetchRoomDetailsData.room &&
                          fetchRoomDetailsData.room.type
                      )
                    )
                      roomVideoUploadModalOpen(e);
                  }}
                >
                  <i className="bx bx-wallet font-size-16 align-middle mr-1" />
                  <span key="t-my-wallet">Upload Video</span>
                </button>
              </div>
            </div>
          </div>
          {/* {isOwnVideoAvailable ?
                            <OwnVideoPlayer
                                roomDetailsData={fetchRoomDetailsData}
                                ownVideoUrl={ownVideoUrl}
                            /> */}
          {/* : */}

          {/* <div className={`webcam-body actual-local-video`}>
            <video
              className={`${openCall && videoAccess ? "d-block" : "d-none"}`}
              autoPlay
              id={`memberVideoBox-${userId}`}
            />

            {!openCall ||
              (!videoAccess && (
                <VideoEmbeder
                  roomDetailsData={null}
                  openWebCamera={false}
                  openMicrophone={false}
                  muteAll={false}
                  handleOpenWebcam={() => {}}
                />
              ))}
          </div> */}

          <div className={`webcam-body actual-local-video`}>
            <video
              className={`${openCall && videoAccess ? "d-block" : "d-none"}`}
              autoPlay
              id={`memberVideoBox-${userId}`}
            />

            {(!openCall || !videoAccess) && (
              <VideoEmbeder
                roomDetailsData={null}
                openWebCamera={false}
                openMicrophone={false}
                muteAll={false}
                handleOpenWebcam={() => {}}
              />
            )}
          </div>
          {/* } */}
        </div>

        <div className="room-member-list-show">
          <div className="room-member-list-show-head">
            <div className="room-member-list-show-name">
              {/* {
                                fetchRoomDetailsData && fetchRoomDetailsData.user && fetchRoomDetailsData.user.room_user_status ?
                                    (fetchRoomDetailsData.user.room_user_status.is_admin ? <span className="room-admin">@ </span> : '')
                                    : ''
                            }
                            {
                                fetchRoomDetailsData && fetchRoomDetailsData.user ? fetchRoomDetailsData.user.username : '---'
                            } */}
              <span>Users List</span>
            </div>
          </div>
          <div className="room-member-list-show-body">
            {fetchRoomDetailsData &&
            fetchRoomDetailsData.members &&
            fetchRoomDetailsData.members.length ? (
              <>
                {/* Gifted user to be on the top of all Regular users even Top of Admin users */}
                {renderGiftedList
                  .filter(
                    (members: any) => !adminUserIds.has(members.details.id)
                  )
                  .map((members: any, userIndex: number) => {
                    const webCamIsOn = currentMembersWithVideo.includes(
                      `${members.user_id}`
                    );
                    const microPhoneIsOn = currentMembersWithAudio.includes(
                      `${members.user_id}`
                    );

                    return (
                      <span
                        className="main-prof"
                        onContextMenu={(e) =>
                          onContextUserMenuClick(e, members)
                        }
                        key={userIndex}
                        style={userStyle}
                      >
                        <div>
                          {/* <p> */}
                          <span
                            style={{
                              color: getSubscriptionColor(
                                roomDetailsSelector && roomDetailsSelector.room
                                  ? members &&
                                    members.details &&
                                    members.details.is_subscribed
                                    ? {
                                        ...members,
                                        subscription_info:
                                          members.details.is_subscribed,
                                      }
                                    : null
                                  : null
                              ),
                            }}
                            onDoubleClick={() => {
                              !members.is_block &&
                                handleSendPm(members.details.id);
                            }}
                          >
                            <FaGift style={{ marginRight: "5px" }} />

                            {members.customize_nickname
                              ? members.customize_nickname.nickname
                              : members.details.username}
                            {members.details &&
                            members.details.badge_data &&
                            members.details.badge_data.current_badge &&
                            new Date(
                              members.details.badge_data.expiry_date.replaceAll(
                                "-",
                                "/"
                              )
                            ).getTime() > new Date().getTime() ? (
                              <img
                                src={
                                  members.details?.badge_data?.current_badge
                                    ?.icon?.original
                                }
                                height={20}
                                width={20}
                                className="m-2"
                                alt=""
                              />
                            ) : (
                              ""
                            )}
                          </span>

                          <span className="right-pos">
                            {getRoomTypeValidation(
                              fetchRoomDetailsData &&
                                fetchRoomDetailsData.room &&
                                fetchRoomDetailsData.room.type
                            ) ? (
                              <>
                                {webCamIsOn ? (
                                  <a
                                    href={"#subscriber-" + members.user_id}
                                    id={"viewcam-" + members.user_id}
                                  >
                                    <img
                                      src="/img/webcam-icon.png"
                                      alt="webcam-on"
                                    />
                                  </a>
                                ) : null}

                                {microPhoneIsOn ? (
                                  <a href="#">
                                    <img src="/img/onlymic.png" alt="mic-on" />
                                  </a>
                                ) : null}
                              </>
                            ) : null}
                            {getBooleanStatus(members.is_raise_hand) ? (
                              <img
                                src="/img/raise-hand-icon.png"
                                alt="raise-hand"
                              />
                            ) : null}
                            {members.red_dot_camera ||
                            members.red_dot_mic ||
                            members.red_dot_text ? (
                              <img
                                height="20"
                                width="20"
                                src="/img/redDot.png"
                                alt="red-dot"
                              />
                            ) : null}
                          </span>
                          {/* </p> */}
                        </div>
                      </span>
                    );
                  })}

                {renderAdminList
                  .filter((member: any) => member.is_admin !== 0)
                  .map((admin: any, index: number) => (
                    <div key={index} style={userStyle}>
                      <span
                        className="room-admin"
                        style={{
                          color: getSubscriptionColor(admin.details),
                        }}
                      >
                        {giftedUserIds.has(admin.details.id) && (
                          <FaGift style={{ marginRight: "5px" }} />
                        )}
                        @
                        {admin.customize_nickname
                          ? admin.customize_nickname.nickname
                          : admin.details.username}
                        {admin.details &&
                        admin.details.badge_data &&
                        admin.details.badge_data.current_badge &&
                        new Date(
                          admin.details.badge_data.expiry_date.replaceAll(
                            "-",
                            "/"
                          )
                        ).getTime() > new Date().getTime() ? (
                          <img
                            src={
                              admin.details?.badge_data?.current_badge?.icon
                                ?.original
                            }
                            height={20}
                            width={20}
                            className="m-2"
                            alt=""
                          />
                        ) : (
                          ""
                        )}
                      </span>
                    </div>
                  ))}

                {renderUserList?.map((members: any, userIndex: number) => {
                  // console.log("Members sorted:", members);
                  // console.log("reennnderrrrddd listtttttttt", renderUserList);

                  const webCamIsOn = currentMembersWithVideo.includes(
                    `${members.user_id}`
                  );
                  const microPhoneIsOn = currentMembersWithAudio.includes(
                    `${members.user_id}`
                  );

                  return (
                    <span
                      className="main-prof"
                      onContextMenu={(e) => onContextUserMenuClick(e, members)}
                      key={userIndex}
                      style={userStyle}
                    >
                      <div>
                        {/* <p> */}
                        <span
                          style={{
                            color: getSubscriptionColor(
                              roomDetailsSelector && roomDetailsSelector.room
                                ? members &&
                                  members.details &&
                                  members.details.is_subscribed
                                  ? {
                                      ...members,
                                      subscription_info:
                                        members.details.is_subscribed,
                                    }
                                  : null
                                : null
                            ),
                          }}
                          onDoubleClick={() => {
                            !members.is_block &&
                              handleSendPm(members.details.id);
                          }}
                        >
                          {/* {userWithGiftIcon === members.user_id && (
                              <FaGift style={{ marginRight: "5px" }} />
                            )} */}

                          {members.customize_nickname
                            ? members.customize_nickname.nickname
                            : members.details.username}
                          {members.details &&
                          members.details.badge_data &&
                          members.details.badge_data.current_badge &&
                          new Date(
                            members.details.badge_data.expiry_date.replaceAll(
                              "-",
                              "/"
                            )
                          ).getTime() > new Date().getTime() ? (
                            <img
                              src={
                                members.details?.badge_data?.current_badge?.icon
                                  ?.original
                              }
                              height={20}
                              width={20}
                              className="m-2"
                              alt=""
                            />
                          ) : (
                            ""
                          )}
                        </span>

                        <span className="right-pos">
                          {getRoomTypeValidation(
                            fetchRoomDetailsData &&
                              fetchRoomDetailsData.room &&
                              fetchRoomDetailsData.room.type
                          ) ? (
                            <>
                              {webCamIsOn ? (
                                <a
                                  href={"#subscriber-" + members.user_id}
                                  id={"viewcam-" + members.user_id}
                                >
                                  <img
                                    src="/img/webcam-icon.png"
                                    alt="webcam-on"
                                  />
                                </a>
                              ) : null}

                              {microPhoneIsOn ? (
                                <a href="#">
                                  <img src="/img/onlymic.png" alt="mic-on" />
                                </a>
                              ) : null}
                            </>
                          ) : null}
                          {getBooleanStatus(members.is_raise_hand) ? (
                            <img
                              src="/img/raise-hand-icon.png"
                              alt="raise-hand"
                            />
                          ) : null}
                          {members.red_dot_camera ||
                          members.red_dot_mic ||
                          members.red_dot_text ? (
                            <img
                              height="20"
                              width="20"
                              src="/img/redDot.png"
                              alt="red-dot"
                            />
                          ) : null}
                        </span>
                        {/* </p> */}
                      </div>
                    </span>
                  );
                })}
              </>
            ) : (
              <div className="mem-name-list" style={{ borderBottom: "none" }}>
                <p>No users available</p>
              </div>
            )}

            {/* <a href="#"></a> */}
          </div>

          {
            // getRoomTypeValidationForTextOnly(
            //     fetchRoomDetailsData &&
            //     fetchRoomDetailsData.room &&
            //     fetchRoomDetailsData.room.type
            // )
            // ?
            <div className="show-mem-footer">
              {fetchRoomDetailsData &&
              fetchRoomDetailsData.user &&
              fetchRoomDetailsData.user.room_user_settings &&
              fetchRoomDetailsData.user.room_user_settings.push_to_talk ? (
                <button
                  // {...bind}
                  className="mute_class"
                  id="muteid"
                  disabled={
                    !openCall
                    // fetchRoomDetailsData &&
                    // fetchRoomDetailsData.room &&
                    // fetchRoomDetailsData.room.join_status &&
                    // fetchRoomDetailsData.room_setting &&
                    // // [1, 2, 3].includes(fetchRoomDetailsData.room.join_status.is_admin) ||
                    // fetchRoomDetailsData.room.voice_enabled == 1 &&
                    // (fetchRoomDetailsData.room_setting.give_mic_to_all == 1 ||
                    //   ([1, 2, 3].includes(
                    //     fetchRoomDetailsData.room_setting.simultaneous_mics
                    //   ) &&
                    //     [0, 1, 2, 3].includes(
                    //       parseInt(
                    //         fetchRoomDetailsData.room.join_status.is_admin
                    //       )
                    //     ) &&
                    //     fetchRoomDetailsData.user.room_user_status
                    //       .red_dot_mic == 0)) &&
                    // ((fetchRoomDetailsData.allow_mic == 1 &&
                    //   fetchRoomDetailsData.user.room_user_status.red_dot_mic ==
                    //     0) ||
                    //   (fetchRoomDetailsData.allow_mic == 0 &&
                    //     fetchRoomDetailsData.user.room_user_status.is_mic ==
                    //       1 &&
                    //     fetchRoomDetailsData.user.room_user_status
                    //       .red_dot_mic == 0)) &&
                    // !micDisabled
                    //   ? // fetchRoomDetailsData.user.room_user_status.red_dot_mic == 0
                    //     false
                    //   : true
                  }
                  onMouseDown={() => {
                    if (currentMembersWithAudio.length >= allowedMicCount) {
                      toast.error(
                        `Only ${micLimit} mics are allowed at a time`
                      );
                      return;
                    }
                    if (!openCall) return;
                    onUnmute();
                    if (
                      getRoomTypeValidationForTextOnly(
                        fetchRoomDetailsData &&
                          fetchRoomDetailsData.room &&
                          fetchRoomDetailsData.room.type
                      )
                    )
                      handleOnMouseDown();
                  }}
                  onMouseUp={() => {
                    // if(currentMembersWithAudio.length >= micLimit) {
                    //   return
                    // }
                    if (!openCall) return;
                    onMute();
                    if (
                      getRoomTypeValidationForTextOnly(
                        fetchRoomDetailsData &&
                          fetchRoomDetailsData.room &&
                          fetchRoomDetailsData.room.type
                      )
                    )
                      handleOnMouseUp();
                  }}
                  onMouseOut={() => {
                    if (currentMembersWithAudio.length >= micLimit) {
                      return;
                    }
                    if (!openCall) return;
                    onMute();
                    if (
                      getRoomTypeValidationForTextOnly(
                        fetchRoomDetailsData &&
                          fetchRoomDetailsData.room &&
                          fetchRoomDetailsData.room.type
                      )
                    )
                      handleOnMouseUp();
                  }}
                  // onClick={() => {
                  //   if (
                  //     getRoomTypeValidationForTextOnly(
                  //       fetchRoomDetailsData &&
                  //       fetchRoomDetailsData.room &&
                  //       fetchRoomDetailsData.room.type
                  //     )
                  //   ) handleLockUnlockMic()
                  // }}
                  type="button"
                >
                  {openMicrophone ? (
                    <img src="/img/mic-unmute-blue.png" alt="mic-unmute" />
                  ) : (
                    <img src="/img/mic-unmute.png" alt="mic-mute" />
                  )}
                  {openMicrophone ? (
                    <span>Talk</span>
                  ) : (
                    <span>
                      Push <br />
                      To Talk
                    </span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  className="mute_class"
                  // disabled=
                  // {
                  //     fetchRoomDetailsData && fetchRoomDetailsData.room && fetchRoomDetailsData.room.join_status &&
                  //         fetchRoomDetailsData.room_setting &&
                  //         [1, 2, 3].includes(fetchRoomDetailsData.room.join_status.is_admin) ||
                  //         (fetchRoomDetailsData.room_setting.give_mic_to_all == 1 || [1, 2, 3].includes(fetchRoomDetailsData.room_setting.simultaneous_mics) && [0].includes(parseInt(fetchRoomDetailsData.room.join_status.is_admin)) &&
                  //             ((fetchRoomDetailsData.allow_mic == 1) || (fetchRoomDetailsData.allow_mic == 0 && fetchRoomDetailsData.user.room_user_status.is_mic == 1))) ? false : true
                  // }
                  disabled={
                    fetchRoomDetailsData &&
                    fetchRoomDetailsData.room &&
                    fetchRoomDetailsData.room.join_status &&
                    fetchRoomDetailsData.room_setting &&
                    // [1, 2, 3].includes(fetchRoomDetailsData.room.join_status.is_admin) ||

                    fetchRoomDetailsData.room.voice_enabled == 1 &&
                    (fetchRoomDetailsData.room_setting.give_mic_to_all == 1 ||
                      ([1, 2, 3].includes(
                        fetchRoomDetailsData.room_setting.simultaneous_mics
                      ) &&
                        [0, 1, 2, 3].includes(
                          parseInt(
                            fetchRoomDetailsData.room.join_status.is_admin
                          )
                        ) &&
                        fetchRoomDetailsData.user.room_user_status
                          .red_dot_mic == 0)) &&
                    ((fetchRoomDetailsData.allow_mic == 1 &&
                      fetchRoomDetailsData.user.room_user_status.red_dot_mic ==
                        0) ||
                      (fetchRoomDetailsData.allow_mic == 0 &&
                        fetchRoomDetailsData.user.room_user_status.is_mic ==
                          1 &&
                        fetchRoomDetailsData.user.room_user_status
                          .red_dot_mic == 0)) &&
                    !micDisabled
                      ? false
                      : true
                  }
                  onClick={() => {
                    if (!openCall) return;
                    if (openMicrophone) {
                      if (currentMembersWithAudio.length >= micLimit) {
                        toast.error(
                          `Only ${micLimit} mics are allowed at a time`
                        );
                        return;
                      }
                      onUnmute();
                    } else {
                      onMute();
                    }
                    if (
                      getRoomTypeValidationForTextOnly(
                        fetchRoomDetailsData &&
                          fetchRoomDetailsData.room &&
                          fetchRoomDetailsData.room.type
                      )
                    )
                      handleLockUnlockMic();
                  }}
                >
                  {openMicrophone ? (
                    <img
                      src="/img/push-to-talk-unlock-icon.png"
                      alt="unlock-talk"
                    />
                  ) : (
                    <img
                      src="/img/push-to-talk-lock-icon.png"
                      alt="lock-talk"
                    />
                  )}
                  {openMicrophone ? (
                    <span>
                      Lock <br /> Mic
                    </span>
                  ) : (
                    <span>
                      Unlock <br /> Mic
                    </span>
                  )}
                </button>
              )}

              {fetchRoomDetailsData &&
              fetchRoomDetailsData.user &&
              fetchRoomDetailsData.user.room_user_status &&
              getBooleanStatus(
                fetchRoomDetailsData.user.room_user_status.is_raise_hand
              ) ? (
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a
                  href="#"
                  onClick={(e) => {
                    if (
                      getRoomTypeValidationForTextOnly(
                        fetchRoomDetailsData &&
                          fetchRoomDetailsData.room &&
                          fetchRoomDetailsData.room.type
                      )
                    )
                      raiseUserHandRemoveAtRoom(e);
                  }}
                >
                  <img src="/img/lower-hand.png" alt="Lower-hand" />
                  <span>
                    Lower
                    <br />
                    Hand
                  </span>
                </a>
              ) : (
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a
                  href="#"
                  onClick={(e) => {
                    if (
                      getRoomTypeValidationForTextOnly(
                        fetchRoomDetailsData &&
                          fetchRoomDetailsData.room &&
                          fetchRoomDetailsData.room.type
                      )
                    ) {
                      raiseUserHandAtRoom(e);
                    }
                  }}
                >
                  <img src="/img/raise-hand-white-icon.png" alt="raise-hand" />
                  <span>
                    Raise
                    <br />
                    Hand
                  </span>
                </a>
              )}

              <Popper
                id={openEqualizerId}
                open={openEqualizer}
                anchorEl={equalizerAnchorEl}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "0px 10px 0px 10px",
                    display: "flex",
                  }}
                >
                  <VolumeDownIcon />
                  <input
                    className="equalizer-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={equalizerValue}
                    onChange={handleEqualizerChange}
                    style={{ color: "blue" }}
                  />
                  <VolumeUpIcon />
                </div>
              </Popper>

              <a href="#" onClick={(e) => handleSoundEquilizer(e)}>
                <img
                  src="/img/White volume_adjustment_symbol- (1).png"
                  alt=""
                />
                <span>Volume</span>
              </a>
              <a
                href="#"
                onClick={(e) => {
                  // handleMuteAllMembers(e)
                  document.querySelectorAll("video, audio").forEach((elem) => {
                    if (elem.id != "localVideo") {
                      muteAll ? unmuteMe(elem) : muteMe(elem);
                    }
                  });
                  setMuteAll(!muteAll);
                }}
              >
                {muteAll ? (
                  <img src="/img/mute-all-icon-deepblue.png" alt="mute" />
                ) : (
                  <img src="/img/unmute-all.png" alt="unmute" />
                )}
                <span>
                  {muteAll ? "Unmute" : "Mute"}
                  <br />
                  {/* all */}
                </span>
              </a>

              {/* <a href="#" onClick={handleClickSort}>
                {isSorted ? (
                  <AiOutlineUnorderedList
                    size={20}
                    style={{ marginLeft: "5px" }}
                  />
                ) : (
                  <AiOutlineSortAscending
                    size={20}
                    style={{ marginLeft: "5px" }}
                  />
                )}
                <span>{isSorted ? "Original List" : "Sort Nickname"}</span>
              </a> */}
            </div>
            // : null
          }
        </div>

        <div className="exit-btn-wrap">
          <a href="#" onClick={(e) => handleExitRoom(e)} className="btn-exit">
            <img src="/img/exit-icon.png" alt="" />
            Exit Room
          </a>
        </div>
      </div>

      <SideBarUsersContextMenu
        getParams={contextMenuOperationParams}
        members={membersData}
        loginUsers={loginUsersData}
      />

      {showWhisperMessageModal ? (
        <SendWhisperMessageModal
          onClose={whisperMessageModalClose}
          shouldShow={showWhisperMessageModal}
          fetchData={membersData}
        />
      ) : null}

      {showCustomizedNicknameModal ? (
        <CustomizedNicknameModal
          onClose={customizedNicknameModalClose}
          onSuccess={getRoomDetails}
          shouldShow={showCustomizedNicknameModal}
          fetchData={membersData}
        />
      ) : null}

      {showRoomVideoUploadModal ? (
        <UploadRoomVideoModal
          onClose={roomVideoUploadCloseModal}
          shouldShow={showRoomVideoUploadModal}
          roomId={r_id}
        />
      ) : null}

      {showViewProfileModal && (
        <ViewProfileModal
          onClose={onViewProfileModalClose}
          shouldShow={showViewProfileModal}
          addToContactList={() => {}}
          isAddedToContactList={true}
          userId={selectedUserId}
        />
      )}

      {showStickerBuyModal ? (
        <StickerBuyModal
          onClose={handleOnCloseSticker}
          shouldShow={showStickerBuyModal}
          byModalType={"giftSendStickerBuy"} //ownStickerBuy or giftSendStickerBuy
          selectedContactList={selectedUser}
          entityId={r_id}
          type={"room"}
        />
      ) : null}

      {mediaDevicesError}
    </React.Fragment>
  );
}

export default RoomsDetailsUsersSidebarPage;
