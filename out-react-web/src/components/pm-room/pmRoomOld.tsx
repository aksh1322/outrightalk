import React, { useEffect, useRef, useState, useMemo, useContext } from "react";
import Slider from "react-slick";
import { useDispatch } from "react-redux";
import {
  BOUNDARY_STICKER_SIZE,
  CHAT_TYPE,
  createMarkup,
  CRYPTO_SECRET_KEY,
  DEFAULT_STICKER_SIZE,
  getBooleanStatus,
  getChatTime,
  getNameInitials,
  HEADER_MENU_SELECTION_TYPE,
  MENU_OPERATIONS,
  PM_TYPE,
  stripHtml,
  TOKBOX_KEY,
  typingStringGenerate,
  URLS,
  ACTIONS,
  getSubscriptionColor,
} from "src/_config";
import OT from "@opentok/client";
import { useHistory } from "react-router-dom";
import ContentEditable from "react-contenteditable";
import OtherPmUsers from "./common/otherPmUsers";
import SendVideoMessagePmModal from "./modal/videoMessageModal/videoMessagePmModal";
import SendVoiceMessagePmModal from "./modal/voiceMessageModal/voiceMessagePmModal";
// import ShareYoutubeVideoPmModal from "./modal/shareYoutubeVideoModal/shareYoutubeVideoPmModal";
import AddUserPmModal from "./modal/addUserModal/addUserPmModal";
import CallNotificationModal from "./modal/callNotificationModal/callNotificationModal";
import RemoveUserPmModal from "./modal/removeUserModal/removeUserPmModal";
import StickerBuyModal from "src/components/commonModals/stickerBuyModal/stickerBuyModal";
import { useCommonApi } from "src/_common/hooks/actions/commonApiCall/appCommonApiCallHook";
import {
  useAppPmWindowDetails,
  useAppPmWindowChatDetailsSelector,
  useAppPmChatDataSelectDeselect,
  useAppActivePmsRouteSelector,
  usePmChatTimestampToogleSelector,
  usePmChatTypingSelector,
  useAppPmWindowIsCallAcceptedSelector,
} from "src/_common/hooks/selectors/pmWindowSelector";
import { useParams } from "react-router";
import Picker from "emoji-picker-react";
import "rc-color-picker/assets/index.css";
import ColorPicker from "rc-color-picker";
import debounce from "lodash/debounce";
import { useLongPress, LongPressDetectEvents } from "use-long-press";
import { toast } from "react-toastify";
import {
  useAppSocketInstanceContainer,
  useAppUserDetailsSelector,
} from "src/_common/hooks/selectors/userSelector";
import { usePmWindowApi } from "src/_common/hooks/actions/pmWindow/appPmWindowApiHook";
import clsx from "clsx";
import { useAppPmWindowAction } from "src/_common/hooks/actions/pmWindow/appPmWindowActionHook";
import { useTextEditorSelector } from "src/_common/hooks/selectors/groupCategorySelector";
import { useAppPmWindowIncomingCall } from "src/_common/hooks/selectors/pmWindowSelector";
import ContactListForGiftModal from "src/components/commonModals/contactListForGiftSend/ContactListModal";
import { useAppUserPreferencesSelector } from "src/_common/hooks/selectors/userPreferenceSelector";
import UserLocationShowModal from "./modal/showUserLocationModal/showUserLocationModal";
// import useAntMediaHook from "src/hooks/useAntMedia";
// import { AntmediaContext } from "src";
// import { MediaSettingsContext, SettingsContext } from "src/containers/pm-room/pmRoom";
// import VideoCard from "./VideoCard";
import SweetAlert from "react-bootstrap-sweetalert";

const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

const settings = {
  dots: false,
  infinite: false,
  slidesToShow: 4,
  slidesToScroll: 4,
  swipeToSlide: true,
  autoplay: false,
};

export default function PmRoomPage({
  // myLocalData,
  // participants,
  roomName,
}: any) {
  // const antmedia = useContext<any>(AntmediaContext);

  // const settings = useContext<any>(SettingsContext);
  // const mediaSettings = useContext<any>(MediaSettingsContext);
  // const { messageDrawerOpen, participantListDrawerOpen, pinnedVideoId, pinVideo, audioTracks, globals } =
  //   settings;

  const [roomJoined, setRoomJoined] = useState<any>(null);

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

  // useEffect(() => {      COMMENTED
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

  const commonApi = useCommonApi();
  const pmWindowApi = usePmWindowApi();
  const pmWindowAction = useAppPmWindowAction();
  const { pmId } = useParams<any>();
  const pm_id: number = parseInt(cryptr.decrypt(pmId));
  const userSelector = useAppUserDetailsSelector();
  const pmWindowDetailsSelector = useAppPmWindowDetails();
  const preferenceSelector = useAppUserPreferencesSelector();
  const typing = usePmChatTypingSelector();
  const timeStampToogleSelector = usePmChatTimestampToogleSelector();
  const chatDataSelectDeselectSelector = useAppPmChatDataSelectDeselect();
  const fromRoute = useAppActivePmsRouteSelector();
  const pmChatDetails = useAppPmWindowChatDetailsSelector();
  const [checkedValues, setCheckedValues] = useState<number[]>([]);
  const [showOtherMembers, setShowOtherMembers] = useState<boolean>(false);
  const [showVideoMessageModal, setShowVideoMessageModal] =
    useState<boolean>(false);
  const [showVoiceMessageModal, setShowVoiceMessageModal] =
    useState<boolean>(false);
  const [showShareYoutubeVideoModal, setShowShareYoutbeVideoModal] =
    useState<boolean>(false);
  const [showAddUserPmModal, setShowAddUserPmModal] = useState<boolean>(false);
  const [webcamStream, setWebcamStream] = useState<any>(null);
  const [showRemoveUserPmModal, setShowRemoveUserPmModal] =
    useState<boolean>(false);

  const [chatText, setChatText] = useState("");
  const chatTextRef = useRef("");
  const contentEditableFocus = useRef<any>();
  const [isEnterKeySendMsg, setIsEnterKeySendMsg] = useState(true);
  const enterMsgSend = useRef<any>();
  const history = useHistory();
  const typingRef = useRef<any>();

  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [colorPicker, setColorPicker] = useState("#000000");

  const [stickerEmojiOpen, setStickerEmojiOpen] = useState(false);
  const [isStickerOrEmoji, setIsStickerOrEmoji] = useState("emoji");
  const [stickerCategories, setStickerCategories] = useState<any>([]);
  const [showStickerBuyModal, setShowStickerBuyModal] =
    useState<boolean>(false);
  const [selectedStickerCategory, setSelectedStickerCategory] =
    useState<number>();
  const [categorywiseSticker, setCategorywiseSticker] = useState<any>([]);
  const [showChatTimestamp, setShowChatTimeStamp] = useState<boolean>(false);
  const [showPmTyping, setShowPmTyping] = useState<boolean>(false);
  const [firstTimeChatScroll, setFirstTimechatScroll] = useState<boolean>(true);

  const [pmWindowName, setPmWindowName] = useState<any>("untitled chat");

  const dispatch = useDispatch();
  const pmWindowIncomingCallSelector = useAppPmWindowIncomingCall();
  const socketContainer: any = useAppSocketInstanceContainer();
  const textEditorSelector = useTextEditorSelector();

  const [isAdminOrNot, setisAdminOrNot] = useState<boolean>(false);

  const [isWebCamOn, setIsWebCamOn] = useState<boolean>(false);
  const [isMicOn, setIsMicOn] = useState<boolean>(false);

  const [startVideoCall, setStartVideoCall] = useState<boolean>(false);
  const [startAudioCall, setStartAudioCall] = useState<boolean>(false);

  const [currentSession, setCurrentSession] = useState<any>();
  const [currentPublisher, setCurrentPublisher] = useState<any>();
  const [streams, setStreams] = useState<any>([]);
  const [currentSubscribers, setCurrentSubscribers] = useState<any>([]);
  const [fromStreamDestroyed, setFromStreamDestroyed] =
    useState<boolean>(false);

  const [showContactListModal, setContactListModalModal] =
    useState<boolean>(false);
  const [byStickerModalType, setByStickerModalType] = useState<any>();
  const [selectedContactList, setSelectedContactList] = useState<any>([]);

  const [isSpellCheck, setIsSpellCheck] = useState<boolean>(false);
  const [isSpelcheckAvailable, setIsSpellCheckAvailable] =
    useState<boolean>(false);

  const [showUsersLocationModal, setShowUsersLocationModal] =
    useState<boolean>(false);

  const [showCallNotificationModal, setShowCallNotificationModal] =
    useState<boolean>(false);

  var timeout: any = undefined;

  // const { publishVideo, stopPublishing } = useAntMediaHook();

  const [isCalling, setIsCalling] = useState(false);

  const [callType, setCallType] = useState<string>("");

  const isPmCallAccepted = useAppPmWindowIsCallAcceptedSelector();

  const [isVideoCallMuted, setIsVideoCallMuted] = useState(false);

  useEffect(() => {
    pmWindowDetailsSelector &&
      setCallType(
        pmWindowDetailsSelector.is_video_on == 1
          ? "video"
          : pmWindowDetailsSelector.is_voice_on == 1
          ? "voice"
          : ""
      );
  }, [pmWindowDetailsSelector]);

  useEffect(() => {
    let data = localStorage.getItem("receivingCallInsidePm");

    if (data && userSelector && pmWindowDetailsSelector && !roomJoined) {
      let parsedData = JSON.parse(data);

      if (
        parsedData.is_initiated_by != userSelector.id &&
        pmWindowDetailsSelector.id == parsedData.pmId
      ) {
        handleJoinRoom();
        localStorage.removeItem("receivingCallInsidePm");
      }
    }
  }, [userSelector, pmWindowDetailsSelector, isPmCallAccepted]);

  const handleJoinRoom = async () => {
    // setCallModal(null)
    // mediaSettings.setCam([
    //   {
    //     eventStreamId: "localVideo",
    //     isCameraOn: false, //start with camera on
    //   },
    // ])
    // mediaSettings.setMic([
    //   {
    //     eventStreamId: "localVideo",
    //     isMicMuted: false, //start with mic on
    //   },
    // ])
    // if (antmedia.publishStreamId) antmedia.handleLeaveFromRoom();
    // if (pmWindowDetailsSelector && userSelector && roomJoined != pm_id) {
    //   var generatedStreamId = userSelector.username.replace(/\s/g, "").replace(/[\W_]/g, "") + "_" + makeid(10);
    //   await antmedia.joinRoom(roomName, generatedStreamId);
    //   setRoomJoined(pm_id)
    // }
  };

  console.log("callType---", callType);

  // useEffect(() => {
  //   if (roomJoined && myLocalData) {
  //     if (callType == 'video') {
  //       startCamStream()
  //     }
  //     else if (callType == 'voice') {
  //       startAudioStream()
  //     }
  //   }
  // }, [roomJoined, myLocalData])

  // useEffect(() => {
  //   if (roomJoined && myLocalData && isCalling) {
  //     handleStartStream()
  //   }
  //   if (roomJoined && myLocalData && !isCalling) {
  //     handleAcceptRejectPmAudioVideoNotification("accept")
  //   }
  // }, [roomJoined, myLocalData, isCalling])

  console.log("pmWindowDetailsSelector-", pmWindowDetailsSelector);

  // useEffect(() => {
  //   if (pmWindowDetailsSelector && pmWindowDetailsSelector.is_initiated_by == 0) {

  //     setIsCalling(false)

  //     setIsVideoCallMuted(false)

  //     mediaSettings.setCam([
  //       {
  //         eventStreamId: "localVideo",
  //         isCameraOn: false, //start with camera on
  //       },
  //     ])

  //     mediaSettings.setMic([
  //       {
  //         eventStreamId: "localVideo",
  //         isMicMuted: true, //start with mic on
  //       },
  //     ])

  //     mediaSettings.setMyLocalData(null)

  //     if (antmedia.publishStreamId) antmedia.handleLeaveFromRoom();
  //     setRoomJoined(null)
  //     return
  //   }
  // }, [pmWindowDetailsSelector])

  const handleAcceptRejectPmAudioVideoNotification = (type: string) => {
    if (type === "accept") {
      let params = {
        pm_id: pm_id,
        type: type,
        // stream_id: myLocalData.streamId
        stream_id: "",
      };
      pmWindowApi.callPmCallAcceptReject(
        params,
        (message: string, resp: any) => {
          if (resp) {
            // handleRemoveSingleNotification(null, notificationId)
            // notificationAction.removeSingleNotification(notificationId)
            // const pmIdEncrypted = cryptr.encrypt(pmId)
            // history.replace('')
            // history.push(`pm/${pmIdEncrypted}`)
          }
        },
        (message: string) => {
          toast.error(message);
        }
      );
    } else {
      console.log("Call Reject");
      let params = {
        pm_id: pm_id,
        type: type,
        stream_id: null,
      };
      pmWindowApi.callPmCallAcceptReject(
        params,
        (message: string, resp: any) => {
          if (resp) {
            // handleRemoveSingleNotification(null, notificationId)
            // notificationAction.removeSingleNotification(notificationId)
          }
        },
        (message: string) => {
          toast.error(message);
        }
      );
      // handleRemoveSingleNotification(null, notificationId)
    }
  };

  // const [callModal, setCallModal] = useState<any>(null)

  // useEffect(() => {  COMMENTED

  //   if (pmWindowDetailsSelector && userSelector && roomJoined != pm_id) {
  //     var generatedStreamId = userSelector.username.replace(/\s/g, "").replace(/[\W_]/g, "") + "_" + makeid(10);
  //     antmedia.joinRoom(roomName, generatedStreamId);
  //     setRoomJoined(pm_id)
  //   }
  // }, [pmWindowDetailsSelector, userSelector])

  //cal related code here
  var session: any = "",
    publisher: any,
    subscriber: any;
  // cal related code end here

  //For hide show others members
  const handleShowOtherMembers = () => {
    setShowOtherMembers(!showOtherMembers);
  };

  //For Video Message modal
  const openVideoMessageModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowVideoMessageModal(true);
  };
  const closeVideoMessageModal = () => {
    if (showVideoMessageModal) setShowVideoMessageModal(false);
  };

  //For Voice Message modal
  const openVoiceMessageModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowVoiceMessageModal(true);
  };
  const closeVoiceMessageModal = () => {
    if (showVoiceMessageModal) setShowVoiceMessageModal(false);
  };

  //For show users location
  const openShowUsersLocationModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowUsersLocationModal(true);
  };
  const closeUserLOcationModalModal = () => {
    if (showUsersLocationModal) setShowUsersLocationModal(false);
  };

  //For Share Youtube Video Modal
  const openShareYoutubeVideoModal = () => {
    setShowShareYoutbeVideoModal(true);
  };
  const closeShareYoutubeVideoModal = () => {
    if (showShareYoutubeVideoModal) setShowShareYoutbeVideoModal(false);
  };

  //For send virtual gift

  const openContactListModal = (e: any) => {
    e.preventDefault();
    setContactListModalModal(true);
  };

  const contactListCloseModal = () => {
    if (showContactListModal) setContactListModalModal(false);
  };

  const openGiftSticker = (contactList: any) => {
    setSelectedContactList(contactList);
    setByStickerModalType("giftSendStickerBuy");
    setShowStickerBuyModal(true);
  };

  //if admin addmember removemember visible and functionality open

  useEffect(() => {
    if (pmWindowDetailsSelector) {
      let found =
        userSelector &&
        pmWindowDetailsSelector.users &&
        pmWindowDetailsSelector.users.length
          ? pmWindowDetailsSelector.users.filter(
              (x: any) => x.user_id == userSelector.id
            )
          : [];
      if (found && found.length) {
        if (found[0].is_admin) {
          setisAdminOrNot(true);
        } else {
          setisAdminOrNot(false);
        }
      }
    }
  }, [pmWindowDetailsSelector]);

  //For add user
  const openAddUserModal = () => {
    setShowAddUserPmModal(true);
  };
  const closeAddUserPmModal = () => {
    if (showAddUserPmModal) setShowAddUserPmModal(false);
  };

  //For remove user
  const openRemoveUserModal = () => {
    setShowRemoveUserPmModal(true);
  };
  const closeRemoveUserPmModal = () => {
    if (showRemoveUserPmModal) setShowRemoveUserPmModal(false);
  };

  function handleSelect(checkedName: number) {
    const newNames = checkedValues?.includes(checkedName)
      ? checkedValues?.filter((name) => name !== checkedName)
      : [...(checkedValues ?? []), checkedName];
    setCheckedValues(newNames);
    return newNames;
  }

  const chatHandleBlur = () => {
    // console.log('chatHandleBlur', chatTextRef.current);
    // console.log('chatHandleBlur chatText', chatText);
  };

  const sendMsg = (msgType: string) => {
    if (chatTextRef.current != "") {
      var params = {
        pm_id: pm_id,
        chat_body: chatTextRef.current,
        type: msgType,
      };
      chatTextRef.current = ""; //reset content editable div
      pmWindowApi.callSendPmWindowChat(
        params,
        (message: string, resp: any) => {
          setChatText("");
          contentEditableFocus.current.focus();
          setColorPicker("#000000");
        },
        (message: string) => {
          setChatText("");
          toast.error(message);
        }
      );
    } else {
      toast.error("Enter some text...");
    }
  };

  const chatOnKeyDown = (e: any) => {
    if (enterMsgSend.current.value == "sendMsg") {
      if (e.keyCode == 13 && e.shiftKey == false) {
        e.preventDefault();
        sendMsg("normal");
      }
    }
  };

  //chat area handle code here

  const chatHandleChange = (evt: any) => {
    chatTextRef.current = evt.target.value;
    setChatText(evt.target.value);
    debouncedEventHandler();
  };

  const eventHandler = () => {
    if (socketContainer) {
      socketContainer.emit("chatTyping", {
        userId: userSelector?.id,
        pmId: pm_id,
        userInfo: userSelector?.username,
        typing: true,
      });
      // socketContainer.emit('HeartBeat', { id: 96, roomId: 17, userInfo: 'thomas', typing: true });
      // clearTimeout(timeout)
      debouncedChangeHandler.cancel();
      // timeout = setTimeout(typingTimeout, 1500)
      debouncedChangeHandler();
    }
  };

  const typingTimeout = () => {
    if (socketContainer) {
      socketContainer.emit("chatTyping", {
        userId: userSelector?.id,
        pmId: pm_id,
        userInfo: userSelector?.username,
        typing: false,
      });
      // socketContainer.emit('HeartBeat', { id: 96, roomId: 17, userInfo: 'thomas', typing: true });
    }
  };

  const debouncedChangeHandler = useMemo(
    () => debounce(typingTimeout, 3600),
    [chatTextRef.current]
  );

  const debouncedEventHandler = useMemo(
    () => debounce(eventHandler, 1600),
    [chatTextRef.current]
  );

  //for stricker
  const openStickerBuyModal = (e: any) => {
    e.preventDefault();
    setByStickerModalType("ownStickerBuy");
    setShowStickerBuyModal(true);
  };
  const handleOnCloseSticker = () => {
    setShowStickerBuyModal(false);
    setSelectedContactList([]);
    setByStickerModalType("");
    getStickerCategory();
  };

  //For Format text
  const handleOpenToolBar = (e: any) => {
    e.preventDefault();
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.CHAT.TEXT_EDITOR_STATUS,
      payload: !textEditorSelector,
    });
    // setIsToolbarOpen(!isToolbarOpen);
  };

  const handleTextDecoration = (e: any, type: string, size: any) => {
    e.preventDefault();
    document.execCommand(type, false, size);
  };

  const handleChangeFont = (val: any) => {
    // handleTextDecoration('fontName', val.target.value)
    if (val.target.value) {
      document.execCommand("fontName", true, val.target.value);
    }
  };

  const handleFontSize = (val: any) => {
    if (val.target.value) {
      document.execCommand("fontSize", true, val.target.value);
    }
  };

  const changeHandler = (colors: any) => {
    setColorPicker(colors.color);
    document.execCommand("foreColor", true, colors.color);
  };

  //sticker handle
  const openStickerBox = (e: any) => {
    e.preventDefault();
    if (stickerEmojiOpen) {
      setStickerEmojiOpen(false);
    } else {
      setStickerEmojiOpen(true);
    }
  };

  const onEmojiClick = (event: any, emojiObject: any) => {
    // console.log('emojiObject', emojiObject)
    chatTextRef.current = chatTextRef.current + emojiObject.emoji;
    setChatText(chatTextRef.current);
    setStickerEmojiOpen(false);
  };

  const getOwnCategorywiseSticker = (e: any, catId: number) => {
    e.preventDefault();
    setSelectedStickerCategory(catId);
    let params = {};
    commonApi.callStickerOwn(
      params,
      (message: string, resp: any) => {
        if (resp && resp.length) {
          setCategorywiseSticker(resp);
        } else {
          setCategorywiseSticker([]);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handleEmojiSticker = (e: any, type: string) => {
    e.preventDefault();
    setIsStickerOrEmoji(type);
  };

  const pasteSticker = (
    imgUrl: string,
    height: number,
    width: number,
    title: string
  ) => {
    setStickerEmojiOpen(false);
    let sHeight: number =
      height && height > BOUNDARY_STICKER_SIZE ? height : DEFAULT_STICKER_SIZE; //If height > boundary then otherwise default value set
    let sWidth: number =
      width && width > BOUNDARY_STICKER_SIZE ? width : DEFAULT_STICKER_SIZE; //If width >boundary then otherwise default value set

    console.log("dgfhfghgjf", sHeight, sWidth);

    let sticker = `<img src=\"${imgUrl}\" height=\"${sHeight}\" width=\"${sWidth}\" alt="${
      title ? title : "sticker"
    }">`;

    var params = {
      pm_id: pm_id,
      chat_body: sticker,
      to_user_id: 0,
      type: "sticker",
    };
    chatTextRef.current = ""; //reset content editable div
    pmWindowApi.callSendPmWindowChat(
      params,
      (message: string, resp: any) => {},
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const renderSlides = () =>
    stickerCategories.map((stgrp: any, index: any) =>
      stgrp.id ? (
        <a
          key={index}
          href="#"
          className={stgrp.id == selectedStickerCategory ? "active" : ""}
          onClick={(e) => getCategorywiseSticker(e, stgrp.id)}
        >
          <img src={stgrp.icon.thumb} alt="" />
        </a>
      ) : (
        <a
          key={index}
          href="#"
          className={95000000089 == selectedStickerCategory ? "active" : ""}
          onClick={(e) => getOwnCategorywiseSticker(e, 95000000089)}
        >
          <img src="/img/own.png" alt="own" />
        </a>
      )
    );

  useEffect(() => {
    getPmWindowDetails();
    getAllChatFromPmWindow();
    getStickerCategory();
  }, [fromRoute]);

  const getPmWindowDetails = () => {
    let params = {
      pm_id: pm_id,
    };
    pmWindowApi.callGetPmsDetails(
      params,
      (message: string, resp: any) => {
        //Update Timestamp toogle Reducer data
        pmWindowAction.pmChatTimestampToogle(
          getBooleanStatus(
            resp && resp.pm_settings && resp.pm_settings.timestamp
          )
        );
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const getCategorywiseSticker = (e: any, catId: number) => {
    if (e) {
      e.preventDefault();
    }
    setSelectedStickerCategory(catId);
    let params = {
      category_id: catId,
    };
    commonApi.callGetAllStickerCategorywise(
      params,
      (message: string, resp: any) => {
        if (resp && resp.length) {
          setCategorywiseSticker(resp);
        } else {
          setCategorywiseSticker([]);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const getStickerCategory = () => {
    let params = {
      type: ["free", "own"],
    };
    commonApi.callGetStickerCategories(
      params,
      (message: string, resp: any) => {
        if (resp && resp.categories && resp.categories.length) {
          setStickerCategories(resp.categories);
          getCategorywiseSticker(null, resp.categories[0].id);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  //For set pm window name
  useEffect(() => {
    if (pmWindowDetailsSelector) {
      const filterPmWindowName =
        pmWindowDetailsSelector &&
        pmWindowDetailsSelector?.users?.length > 0 &&
        pmWindowDetailsSelector.users.filter(
          (x: any) => x.user_id != userSelector?.id
        );
      if (filterPmWindowName && filterPmWindowName.length) {
        setPmWindowName(filterPmWindowName);
      } else {
        setPmWindowName("untitled chat");
      }
    }
  }, [pmWindowDetailsSelector]);

  const getAllChatFromPmWindow = () => {
    const params = {
      pm_id: pm_id,
    };
    pmWindowApi.callGetPmWindowChat(
      params,
      (message: string, resp: any) => {
        if (resp && resp.chatfile) {
        }
      },
      (message: string) => {
        // toast.error(message)
      }
    );
  };

  // useEffect(() => {
  //     getAllChatFromPmWindow()
  // }, [])

  //Scroll chat area
  // useEffect(() => {
  //     // if (firstTimeChatScroll) {
  //     var objDiv = document.getElementById("chat-window-scroll-btm");
  //     if (objDiv) {
  //         objDiv.scrollTop = objDiv.scrollHeight;
  //     }
  //     // setFirstTimechatScroll(false)
  //     // }

  // }, [pmChatDetails])

  //If autoscroll on then scroll chat window otherwise not scroll
  useEffect(() => {
    setTimeout(() => {
      if (
        pmChatDetails &&
        pmChatDetails.length &&
        pmWindowDetailsSelector &&
        pmWindowDetailsSelector.pm_settings &&
        pmWindowDetailsSelector.pm_settings[MENU_OPERATIONS.AUTOSCROLL_TEXT]
      ) {
        var objDiv = document.getElementById("chat-window-scroll-btm");
        if (objDiv) {
          objDiv.scrollTop = objDiv.scrollHeight;
        }
      } else if (firstTimeChatScroll) {
        var objDiv = document.getElementById("chat-window-scroll-btm");
        if (objDiv) {
          objDiv.scrollTop = objDiv.scrollHeight;
        }
        setFirstTimechatScroll(false);
      }
    }, 1500);
  }, [pmChatDetails]);

  const handleCopy = () => {
    var copyPaste = "";
    if (checkedValues && checkedValues.length) {
      for (let i = 0; i < checkedValues.length; i++) {
        let found = pmChatDetails.filter((x: any) => x.id == checkedValues[i]);
        if (found && found.length) {
          copyPaste =
            copyPaste +
            found[0].user_details.username +
            ", " +
            getChatTime(found[0].post_converted_timestamp) +
            "\n";
          copyPaste = copyPaste + stripHtml(found[0].chat_body) + "\n \n";
        }
      }
    }
    /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyPaste);
    setCheckedValues([]);
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    // chatTextRef.current = chatTextRef.current + text
    // chatTextRef.current = 'hello'
    navigator.clipboard
      .readText()
      .then((text) => {
        let currentCopyCode = text.split("\n").map((item) => {
          return item.trim();
        });

        chatTextRef.current =
          chatTextRef.current +
          currentCopyCode
            .map((x: any) => (x ? `<div>${x}</div>` : `<div>&nbsp;</div>`))
            .join(" ");
        setChatText(chatTextRef.current);
        pmWindowAction.pmWindowChatDataSelectDeselect(null);
      })
      .catch((err) => {
        console.error("Failed to read clipboard contents: ", err);
      });
  };

  //Paste menu use effect
  useEffect(() => {
    if (chatDataSelectDeselectSelector === HEADER_MENU_SELECTION_TYPE.PASTE) {
      handlePaste();
    }
  }, [chatDataSelectDeselectSelector]);

  //Select, Select All & de select all functionality added here
  useEffect(() => {
    if (chatDataSelectDeselectSelector) {
      if (
        chatDataSelectDeselectSelector === HEADER_MENU_SELECTION_TYPE.SELECT_ALL
      ) {
        // const found = pmChatDetails && pmChatDetails.length ? pmChatDetails.filter((data: any) => [CHAT_TYPE.NORMAL].includes(data.type)) : [];
        if (pmChatDetails && pmChatDetails.length) {
          setCheckedValues(
            pmChatDetails &&
              pmChatDetails.length &&
              pmChatDetails.map((x: any) => x.id)
          );
        } else {
          setCheckedValues([]);
        }
      } else if (
        chatDataSelectDeselectSelector === HEADER_MENU_SELECTION_TYPE.COPY
      ) {
        handleCopy();
      }
      // else if (chatDataSelectDeselectSelector === HEADER_MENU_SELECTION_TYPE.PASTE) {
      //     handlePaste()
      // }
      else {
        setCheckedValues([]);
      }
    }
  }, [chatDataSelectDeselectSelector, pmChatDetails]);

  //Reset Check Uncheck selector after room unmount
  useEffect(() => {
    if (!pmWindowDetailsSelector) {
      return () => {
        pmWindowAction.pmWindowChatDataSelectDeselect(null);
      };
    }
  }, [pmWindowDetailsSelector]);

  useEffect(() => {
    if (
      preferenceSelector &&
      preferenceSelector.list &&
      preferenceSelector.list.length
    ) {
      // let enterKeyFound = preferenceSelector.list.filter((x: any) => x.key == 'pressing_enter_key');
      // if (enterKeyFound && enterKeyFound.length) {
      //     if (parseInt(enterKeyFound[0].val) == 1) {
      //         setIsEnterKeySendMsg(true)
      //     }
      //     else {
      //         setIsEnterKeySendMsg(false)
      //     }
      // }

      let chatTimestampFound = preferenceSelector.list.filter(
        (x: any) => x.key == "show_timestamp_pm"
      );

      if (chatTimestampFound && chatTimestampFound.length) {
        if (parseInt(chatTimestampFound[0].val) == 1) {
          setShowChatTimeStamp(true);
        } else {
          setShowChatTimeStamp(false);
        }
      }

      let showTypingInPm = preferenceSelector.list.filter(
        (x: any) => x.key == "show_typing_pm"
      );
      if (showTypingInPm && showTypingInPm.length) {
        if (parseInt(showTypingInPm[0].val) == 1) {
          setShowPmTyping(true);
        } else {
          setShowPmTyping(false);
        }
      }

      let spellCheckInPm = preferenceSelector.list.filter(
        (x: any) => x.key == "enable_spelling_checker_pm"
      );
      if (spellCheckInPm && spellCheckInPm.length) {
        if (parseInt(spellCheckInPm[0].val) == 1) {
          setIsSpellCheckAvailable(true);
        } else {
          setIsSpellCheckAvailable(false);
        }
      }
    }
  }, [preferenceSelector]);

  //Check if PM is single then check other user is offline of not if not offline then return false otherwise return true
  const getSinglePmUserVisibleStatus = (pmType: string, users: any[]) => {
    if (pmType === PM_TYPE.SINGLE) {
      let foundOthersUser =
        users && users.length
          ? users.filter((x: any) => x.user_id != userSelector?.id)
          : [];
      if (foundOthersUser && foundOthersUser.length) {
        if (foundOthersUser[0].user_info.visible_status === 4) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  };

  //Opentok related code

  const userImageShow = (membersId: any) => {
    let element = document.getElementById("img-" + membersId);
    if (element) {
      element.style.display = "block";
    }
  };

  const userImageHide = (membersId: any) => {
    let element = document.getElementById("img-" + membersId);
    if (element) {
      element.style.display = "none";
    }
  };

  const handleError = (error: any) => {
    if (error) {
      // toast.error(error.message)
      console.log("opentok error", error.message);
    }
  };

  // const initializeSession = (        COMMENTED
  //   type: string,
  //   videoWebcam: boolean,
  //   callType: string,
  //   audioMic: boolean,
  //   apiKey: any,
  //   sessionId: any,
  //   token: any
  // ) => {
  //   session = OT.initSession(apiKey, sessionId);
  //   setCurrentSession(session);
  //   // Create a publisher
  //   publisher = OT.initPublisher(
  //     "camera-me",
  //     {
  //       publishVideo: videoWebcam,
  //       publishAudio: audioMic,
  //       insertMode: "append",
  //       style: { buttonDisplayMode: "off", nameDisplayMode: "off" },
  //       width: "398px",
  //       height: "265px",
  //       name: userSelector
  //         ? JSON.stringify({
  //           username: userSelector.username,
  //           id: userSelector.id,
  //           videoStatus: 1,
  //           pmId: pm_id,
  //         })
  //         : JSON.stringify({ username: null, id: null, pmId: null }),
  //     },
  //     handleError
  //   );
  //   setCurrentPublisher(publisher);
  //   // Connect to the session
  //   session.connect(token, function (error: any) {
  //     // If the connection is successful, publish to the session
  //     if (error) {
  //       handleError(error);
  //     } else {
  //       console.log("socket fire");
  //       if (type == "callInitiate") {
  //         // if (videoWebcam && audioMic) {
  //         if (callType == "videoCallType") {
  //           setStartVideoCall(true);
  //         } else if (callType == "audioCallType") {
  //           setStartAudioCall(true);
  //         }
  //         // socketContainer.emit('HeartBeat', { id: userSelector?.id, pmId: pm_id, userInfo: userSelector?.username, session: pmWindowDetailsSelector.opentalk_info.session, token: pmWindowDetailsSelector.opentalk_info.token, callType: 'incomingCall' });
  //       } else if (type == "callReceive") {
  //         // if (videoWebcam && audioMic) {
  //         //     setStartVideoCall(true)
  //         // } else if (!videoWebcam && audioMic) {
  //         //     setStartAudioCall(true)
  //         // }
  //         if (callType == "videoCallType") {
  //           setStartVideoCall(true);
  //         } else if (callType == "audioCallType") {
  //           setStartAudioCall(true);
  //         }
  //       }
  //       userImageHide(userSelector?.id);
  //       session.publish(publisher, handleError);
  //     }
  //   });

  //   // Subscribing to stream
  //   let tempStreams = [...streams];
  //   let tempSubscribers = [...currentSubscribers];
  //   session.on("streamCreated", function (event: any) {
  //     console.log("streamCreated opentok receive call", event);
  //     // subscriber = session.subscribe(
  //     //     event.stream,
  //     //     "subscriber-",
  //     //     {
  //     //         insertMode: "append",
  //     //         style: { buttonDisplayMode: "off", nameDisplayMode: "off", audioLevelDisplayMode: "off" },
  //     //         width: "100%",
  //     //         height: "350px",
  //     //     },
  //     //     handleError
  //     // );
  //     let userId = JSON.parse(event.stream.name).id;
  //     let pmId = JSON.parse(event.stream.name).pmId;
  //     let found = tempStreams.filter((x: any) => x.userId == userId);
  //     if (found && found.length) {
  //       // do nothing already exists
  //     } else {
  //       if (pmId == pmWindowDetailsSelector.id) {
  //         subscriber = session.subscribe(
  //           event.stream,
  //           "subscriber-" + userId,
  //           {
  //             insertMode: "append",
  //             style: {
  //               buttonDisplayMode: "off",
  //               nameDisplayMode: "off",
  //               audioLevelDisplayMode: "off",
  //             },
  //             width: "398px",
  //             height: "265px",
  //           },
  //           handleError
  //         );
  //         userImageHide(userId);
  //         tempSubscribers.push(subscriber);
  //         tempStreams.push({ ...event.stream, userId: userId });
  //       }
  //     }
  //     setStreams(tempStreams);
  //     setCurrentSubscribers(tempSubscribers);
  //   });

  //   session.on("streamDestroyed", (event: any) => {
  //     // console.log("session dest: ", session);
  //     // console.log("publisher dest: ", publisher);
  //     console.log("streamDestroyed", event);

  //     let pmId = JSON.parse(event.stream.name).pmId;
  //     if (pmId == pmWindowDetailsSelector.id) {
  //       let userId = JSON.parse(event.stream.name).id;
  //       let found = tempStreams.filter((x: any) => x.userId == userId);
  //       if (found && found.length) {
  //         let indexId = tempStreams.findIndex((x: any) => x.userId === userId);
  //         if (indexId >= 0) {
  //           tempStreams.splice(indexId, 1);
  //           tempSubscribers.splice(indexId, 1);
  //         }
  //       }
  //       setStreams(tempStreams);
  //       setCurrentSubscribers(tempSubscribers);
  //       setFromStreamDestroyed(true);
  //       // console.log('strems======', streams)
  //       // setTimeout(() => {
  //       //     if (streams && streams.length > 0) {
  //       //         console.log('if part', streams)
  //       //         //do nothing if group call running
  //       //     }
  //       //     else {
  //       //         console.log('elsepart', streams)
  //       //         session && session.unpublish(publisher)
  //       //         session && session.disconnect()
  //       //         setStartVideoCall(false)
  //       //         setStartAudioCall(false)
  //       //     }
  //       // }, 1000)
  //       userImageShow(userId);
  //     }
  //   });
  // };

  // useEffect(() => {
  //   if (fromStreamDestroyed) {
  //     console.log("fromStreamDestroyed==>", fromStreamDestroyed);
  //     console.log("outside streams==>", streams);
  //     if (streams && streams.length) {
  //       console.log("if streams==>", streams);
  //       setFromStreamDestroyed(false);
  //     } else {
  //       console.log("else streams==>", streams);
  //       currentSession && currentSession.unpublish(currentPublisher);
  //       currentSession && currentSession.disconnect();
  //       setStartVideoCall(false);
  //       setStartAudioCall(false);
  //       setFromStreamDestroyed(false);
  //     }
  //   }
  // }, [fromStreamDestroyed, streams]);

  useEffect(() => {
    if (!startVideoCall) {
      userImageShow(userSelector?.id);
    }
  }, [startVideoCall]);

  // const handleReceiveIncomingCall = (      COMMENTED
  //   e: any,
  //   videoWebcam: boolean,
  //   audioMic: boolean,
  //   callType: string,
  //   type: string
  // ) => {
  //   if (e) {
  //     e.preventDefault();
  //   }
  //   if (
  //     pmWindowDetailsSelector &&
  //     pmWindowDetailsSelector.opentalk_info &&
  //     pmWindowDetailsSelector.opentalk_info.session &&
  //     pmWindowDetailsSelector.opentalk_info.token
  //   ) {
  //     initializeSession(
  //       type,
  //       videoWebcam,
  //       callType,
  //       audioMic,
  //       TOKBOX_KEY,
  //       pmWindowDetailsSelector.opentalk_info.session,
  //       pmWindowDetailsSelector.opentalk_info.token
  //     );
  //   } else {
  //     // toast.error("Invalid session")
  //   }
  // };

  useEffect(() => {
    if (
      pmWindowDetailsSelector &&
      (pmWindowDetailsSelector.is_video_on ||
        pmWindowDetailsSelector.is_voice_on)
    ) {
      var found =
        userSelector &&
        pmWindowDetailsSelector &&
        pmWindowDetailsSelector.users &&
        pmWindowDetailsSelector.users.length
          ? pmWindowDetailsSelector.users.filter(
              (x: any) => x.user_id == userSelector.id
            )
          : [];
      if (found && found.length) {
        if (found[0].is_accept_audio_video) {
          if (pmWindowDetailsSelector.is_video_on) {
            // handleReceiveIncomingCall(
            //   null,
            //   true,
            //   isMicOn,
            //   "videoCallType",
            //   "callReceive"
            // );
          } else {
            // handleReceiveIncomingCall(
            //   null,
            //   false,
            //   isMicOn,
            //   "audioCallType",
            //   "callReceive"
            // );
          }
        }
      }
    }
    // else {
    //     handleCallEnd(null,callType)
    // }
  }, [pmWindowDetailsSelector]);

  // const handleCallInitiate = (     COMMENTED
  //   e: any,
  //   videoWebcam: boolean,
  //   audioMic: boolean,
  //   callType: string,
  //   type: string
  // ) => {
  //   e.preventDefault();
  //   // call api called here

  //   var fieldName = "";

  //   const stream_id = `stream_user_${userSelector?.id}_room_${pm_id}`;

  //   if (callType == "videoCallType") {
  //     setIsWebCamOn(true);
  //     // setIsMicOn(audioMic)
  //     fieldName = "is_video_on";

  //     navigator.mediaDevices.getUserMedia({
  //       video: true,
  //       audio: false
  //     })
  //       .then(stream => {
  //         if (stream) {
  //           console.log('stream ------------>', stream);

  //           // let videox: any = document.querySelector('#myWebCam')!;
  //           // videox.srcObject = stream;
  //           setStartVideoCall(true);
  //           setWebcamStream(stream);
  //           publishVideo(stream_id, stream);
  //         }
  //       })
  //       .catch(err => {
  //         setStartVideoCall(false);
  //         console.log('Error', err);
  //         if (webcamStream) {
  //           webcamStream.getTracks().forEach((track: any) => {
  //             track.stop();
  //           });
  //           stopPublishing(stream_id);
  //         }
  //       })
  //   } else {
  //     setStartAudioCall(true);
  //     fieldName = "is_voice_on";
  //   }

  //   const params = {
  //     pm_id: pm_id,
  //     field_name: fieldName,
  //     field_value: 1,
  //     user_id: userSelector?.id,
  //     stream_id: (callType == "videoCallType") ? stream_id : null
  //   };
  //   pmWindowApi.callPmCallInitiateAndDisconnect(
  //     params,
  //     (message: string, resp: any) => {
  //       if (resp) {
  //         initializeSession(
  //           type,
  //           videoWebcam,
  //           callType,
  //           audioMic,
  //           TOKBOX_KEY,
  //           pmWindowDetailsSelector.opentalk_info.session,
  //           pmWindowDetailsSelector.opentalk_info.token
  //         );
  //       }
  //     },
  //     (message: string) => {
  //       // toast.error(message)
  //     }
  //   );
  // };

  // const handleCallEnd = (e: any, callType: string) => {        COMMENTED
  //   if (e) {
  //     e.preventDefault();
  //   }
  //   console.log("session: ", currentSession);
  //   console.log("publisher: ", currentPublisher);

  //   //callendApi call here
  //   var fieldName = "";
  //   if (callType == "videoCallType") {
  //     fieldName = "is_video_on";
  //     if (webcamStream) {
  //       webcamStream.getTracks().forEach((track: any) => {
  //         track.stop();
  //       });
  //       stopPublishing(`stream_user_${userSelector?.id}_room_${pm_id}`);
  //     }
  //   } else {
  //     fieldName = "is_voice_on";
  //   }

  //   const params = {
  //     pm_id: pm_id,
  //     field_name: fieldName,
  //     field_value: 0,
  //     user_id: userSelector?.id,
  //     stream_id: null
  //   };
  //   pmWindowApi.callPmCallInitiateAndDisconnect(
  //     params,
  //     (message: string, resp: any) => {
  //       if (resp) {
  //         // socketContainer.emit('HeartBeat', { id: userSelector?.id, pmId: pm_id, userInfo: userSelector?.username, session: pmWindowDetailsSelector.opentalk_info.session, token: pmWindowDetailsSelector.opentalk_info.token, callType: 'rejectCall' });
  //         currentSession && currentSession.unpublish(currentPublisher);
  //         currentSession && currentSession.disconnect();
  //         setStartVideoCall(false);
  //         setStartAudioCall(false);
  //         userImageShow(userSelector?.id);
  //       }
  //     },
  //     (message: string) => {
  //       toast.error(message);
  //     }
  //   );

  //   // socketContainer.emit('HeartBeat', { id: userSelector?.id, pmId: pm_id, userInfo: userSelector?.username, session: pmWindowDetailsSelector.opentalk_info.session, token: pmWindowDetailsSelector.opentalk_info.token, callType: 'rejectCall' });
  //   // currentSession && currentSession.unpublish(currentPublisher)
  //   // currentSession && currentSession.disconnect()
  //   // setStartVideoCall(false)
  //   // userImageShow(userSelector?.id)
  // };

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

  // console.log("myLocalData?.streamId", myLocalData?.streamId)

  // const handleOpenCam = (e: any) => {      COMMENTED
  //   e.preventDefault()
  //   navigator.mediaDevices
  //     .getUserMedia({
  //       video: true,
  //       audio: true,
  //     })
  //     .then((stream) => {
  //       if (stream) {
  //         let videox: any = document.querySelector("#localVideo")!;

  //         videox.srcObject = stream;

  //         setStartVideoCall(true)
  //       }
  //     })
  //     .catch((err) => {
  //       if (webcamStream) {
  //         webcamStream.getTracks().forEach((track: any) => {
  //           track.stop();
  //         });
  //         setStartVideoCall(false)
  //       }
  //       console.log(err);
  //     });
  // }

  // console.log("joined room mylocalda", myLocalData)

  const startCamStream = () => {
    // mediaSettings?.toggleSetCam({
    //   eventStreamId: "localVideo",
    //   isCameraOn: true,
    // });

    // if (myLocalData?.streamId) {
    //   antmedia.checkAndTurnOnLocalCamera(myLocalData.streamId);
    //   antmedia.handleSendNotificationEvent(
    //     "CAM_TURNED_ON",
    //     myLocalData.streamId
    //   );
    // } else {
    //   antmedia.checkAndTurnOnLocalCamera("localVideo");
    // }
    // if (mediaSettings && myLocalData) {
    //   if (document.getElementById("localVideo")) {
    //     antmedia.mediaManager.localVideo = document.getElementById("localVideo");
    //     antmedia.mediaManager.localVideo.srcObject =
    //       antmedia.mediaManager.localStream;
    //   }
    // }

    setStartVideoCall(true);
  };

  const startAudioStream = () => {
    console.log("audio call", "STARTING AUDIO STREAM");
    // mediaSettings?.toggleSetMic({
    //   eventStreamId: 'localVideo',
    //   isMicMuted: false,
    // });
    // antmedia.unmuteLocalMic();
    // if (mediaSettings?.myLocalData?.streamId) {
    //   antmedia.handleSendNotificationEvent('MIC_UNMUTED', mediaSettings?.myLocalData?.streamId);
    // }
    setStartAudioCall(true);
  };

  const startCallOnClick = async () => {
    console.log("STARTING CALL");
    setIsCalling(true);
    await handleJoinRoom();
  };

  const handleStartStream = async () => {
    let fieldName =
      callType == "video"
        ? "is_video_on"
        : callType == "voice"
        ? "is_voice_on"
        : callType == "webcamcall"
        ? "is_webcam_on"
        : "";

    if (callType == "video") {
      setStartVideoCall(true);
    } else if (callType == "voice") {
      setStartAudioCall(true);
    }

    const params = {
      pm_id: pm_id,
      field_name: fieldName,
      field_value: 1,
      user_id: userSelector?.id,
      // stream_id: myLocalData.streamId
      stream_id: "",

      // stream_id: ""
    };
    pmWindowApi.callPmCallInitiateAndDisconnect(
      params,
      (message: string, resp: any) => {
        if (resp) {
        }
      },
      (message: string) => {
        // toast.error(message)
      }
    );
    // }
  };

  const handleEndAudioStream = (e: any) => {
    e.preventDefault();
    if (startAudioCall) {
      // mediaSettings?.toggleSetMic({
      //   eventStreamId: 'localVideo',
      //   isMicMuted: true,
      // });
      // antmedia.muteLocalMic();
      // if (mediaSettings?.myLocalData?.streamId) {
      //   antmedia.handleSendNotificationEvent('MIC_MUTED', mediaSettings?.myLocalData?.streamId);
      //   antmedia.updateAudioLevel(mediaSettings?.myLocalData?.streamId, 0);
      // }

      setStartAudioCall(false);

      // console.log("ENDING CALL")
      // mediaSettings.setMic([
      //   {
      //     eventStreamId: "localVideo",
      //     isMicMuted: true, //start with camera on
      //   },
      // ])
      // mediaSettings.setMyLocalData(null);

      // if (antmedia.publishStreamId) antmedia.handleLeaveFromRoom();
      setRoomJoined(null);
      let fieldName = "is_voice_on";
      const params = {
        pm_id: pm_id,
        field_name: fieldName,
        field_value: 0,
        user_id: userSelector?.id,
        stream_id: null,
      };
      pmWindowApi.callPmCallInitiateAndDisconnect(
        params,
        (message: string, resp: any) => {
          if (resp) {
          }
        },
        (message: string) => {
          // toast.error(message)
        }
      );
    }
  };

  const handleEndCamStream = (e: any) => {
    e.preventDefault();
    if (startVideoCall) {
      // mediaSettings?.toggleSetCam({
      //   eventStreamId: "localVideo",
      //   isCameraOn: false,
      // });
      // let fieldName = ''

      // if (myLocalData?.streamId) {
      //   antmedia.checkAndTurnOffLocalCamera(myLocalData.streamId);
      //   antmedia.handleSendNotificationEvent(
      //     "CAM_TURNED_OFF",
      //     myLocalData.streamId
      //   );
      // } else {
      //   antmedia.checkAndTurnOffLocalCamera("localVideo");
      // }
      // fieldName = "is_video_on"
      // if (mediaSettings && myLocalData) {
      //   antmedia.mediaManager.localVideo = document.getElementById("localVideo");
      //   antmedia.mediaManager.localVideo.srcObject =
      //     null
      // }

      setStartVideoCall(false);

      // console.log("ENDING CALL")
      // mediaSettings.setCam([
      //   {
      //     eventStreamId: "localVideo",
      //     isCameraOn: false, //start with camera on
      //   },
      // ])
      // mediaSettings.setMyLocalData(null)
      // if (antmedia.publishStreamId) antmedia.handleLeaveFromRoom();
      setRoomJoined(null);

      const params = {
        pm_id: pm_id,
        // field_name: fieldName,
        field_name: "",
        field_value: 0,
        user_id: userSelector?.id,
        stream_id: null,
      };
      pmWindowApi.callPmCallInitiateAndDisconnect(
        params,
        (message: string, resp: any) => {
          if (resp) {
          }
        },
        (message: string) => {
          // toast.error(message)
        }
      );
    }
  };

  const handleToggleVideo = (e: any) => {
    e.preventDefault();
    setIsWebCamOn(!isWebCamOn);
    currentPublisher.publishVideo(!isWebCamOn);
  };

  const handleLockUnlockMic = () => {
    setIsMicOn(!isMicOn);
    currentPublisher.publishAudio(!isMicOn);
  };

  //push to talk code here
  const handleOnMouseDown = () => {
    // setIsMicOn(true)
    setIsMicOn(!isMicOn);
    currentPublisher.publishAudio(!isMicOn);
  };

  //Release grab mic
  const handleOnMouseUp = () => {
    // setIsMicOn(false)
    setIsMicOn(!isMicOn);
    currentPublisher.publishAudio(!isMicOn);
  };

  const callback = React.useCallback(() => {
    setIsMicOn(!isMicOn);
    currentPublisher.publishAudio(!isMicOn);
    // handleOnMouseDown()
  }, []);

  const bind = useLongPress(handleOnMouseDown, {
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

  //all initiate callend when we left this page

  // useEffect(() => {
  //     console.log('fgfgfgfg first', startVideoCall)
  //     return (() => {
  //         console.log('unmount page', startVideoCall)
  //         if (startVideoCall) {
  //             console.log('startVideoCall', startVideoCall)
  //             handleCallEnd(null, 'videoCall')
  //         }
  //         if (startAudioCall) {
  //             console.log('startVideoCall', startAudioCall)
  //             handleCallEnd(null, 'audioCall')
  //         }
  //     })

  // }, [])

  // console.log('alltime call',startVideoCall)

  const handleOnKeyUp = (e: any) => {
    // console.log('handleOnKeyUp',socketContainer)
    // console.log('handleOnKeyUp',userSelector)
    // if (socketContainer) {
    //     console.log('inside container handleonUp')
    //     socketContainer.emit('chatTyping', { userId: userSelector?.id, pmId: pm_id, userInfo: userSelector?.username, typing: true });
    //     // socketContainer.emit('HeartBeat', { id: 96, roomId: 17, userInfo: 'thomas', typing: true });
    //     clearTimeout(timeout)
    //     timeout = setTimeout(typingTimeout, 1500)
    // }
  };

  const handleCloseOthersRoomPmUsersWindow = () => {
    let params = {
      pm_id: pm_id,
    };
    pmWindowApi.callExitPmWindow(
      params,
      (message: string, resp: any) => {
        history.push(URLS.USER.DASHBOARD);
      },
      (message: string) => {}
    );
  };

  const handleSpellCheck = () => {
    setIsSpellCheck(!isSpellCheck);
  };

  const checkNicknameInChatTitle = (): string => {
    const userNames = pmWindowName.split(",");

    let users: any[] = [];
    let title: any;

    if (pmWindowDetailsSelector && pmWindowDetailsSelector.users) {
      pmWindowDetailsSelector.users.map((u: any) => {
        const find = userNames.includes(u.user_info.username);
        if (find) users.push(u.user_info);
      });
    }

    if (users.length) {
      title = users.map((u: any) => (
        <span
          style={{
            color: getSubscriptionColor(u),
          }}
        >
          {u.username}
        </span>
      ));
    } else {
      title = pmWindowName;
    }

    return title;
  };

  return (
    <React.Fragment>
      <div className="container-fluid">
        {/* {callModal} */}
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
        <div className="row justify-content-start">
          <div className="col-sm-12">
            <div className="page-heading-panel d-flex justify-content-between mb-2">
              <h1>
                {typeof pmWindowName === "object" && pmWindowName.length
                  ? pmWindowName.map((x: any, index: number) =>
                      x.user_info.customize_nickname &&
                      x.user_info.customize_nickname.nickname ? (
                        <span
                          style={{
                            color: getSubscriptionColor(x.user_info),
                          }}
                        >
                          {x.user_info.customize_nickname.nickname}
                          {index < pmWindowName.length - 1 && ","}{" "}
                        </span>
                      ) : (
                        <span
                          style={{
                            color: getSubscriptionColor(x.user_info),
                          }}
                        >
                          {x.user_info.username}
                          {index < pmWindowName.length - 1 && ","}{" "}
                        </span>
                      )
                    )
                  : pmWindowName}
              </h1>
              {/* {
                                pmWindowIncomingCallSelector ?
                                    <button type="button" onClick={() => handleReceiveIncomingCall(null, true, false, 'callReceive')}>
                                        Receive Call
                                    </button>
                                    : null
                            } */}
              {
                // !showOtherMembers ?
                <div className="d-flex">
                  <button
                    type="button"
                    className="btn theme-btn btn-danger waves-effect"
                    onClick={() => handleCloseOthersRoomPmUsersWindow()}
                  >
                    Close
                  </button>
                </div>
                // : null
              }
            </div>

            {/* Other pm users Start */}

            {
              // showOtherMembers ?
              <OtherPmUsers
                onWindowClose={handleShowOtherMembers}
                streams={streams}
                // myLocalData={myLocalData}
                // participants={participants}
                roomName={roomName}
                getPmWindowDetails={getPmWindowDetails}
              />
              // : null
            }

            {/* Other pm users End */}

            <div className="room-chat-window-wrap dark-box-inner">
              <div className="row">
                <div className="col-md-9">
                  <div
                    className="room-chat-window separated-window"
                    id="chat-window-scroll-btm"
                    style={{ maxWidth: "100%" }}
                  >
                    {userSelector && pmChatDetails && pmChatDetails.length
                      ? pmChatDetails.map((chat: any, index: number) => (
                          <div
                            key={index}
                            className={clsx({
                              "msg-other-wrap":
                                chat.type === CHAT_TYPE.NORMAL ||
                                chat.type === CHAT_TYPE.STICKER,
                              // 'msg-other-wrap whisper-msg': chat.type === CHAT_TYPE.WHISPER,
                              "msg-center":
                                chat.type === CHAT_TYPE.WELCOME ||
                                chat.type === CHAT_TYPE.EXIT ||
                                chat.type === CHAT_TYPE.GIFT,
                            })}
                          >
                            {chatDataSelectDeselectSelector &&
                            chat.type !== CHAT_TYPE.WELCOME &&
                            chat.type !== CHAT_TYPE.EXIT &&
                            chat.type !== CHAT_TYPE.GIFT &&
                            (chatDataSelectDeselectSelector ===
                              HEADER_MENU_SELECTION_TYPE.SELECT ||
                              chatDataSelectDeselectSelector ===
                                HEADER_MENU_SELECTION_TYPE.SELECT_ALL) ? (
                              <div
                                className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success"
                                style={{ marginTop: "8px" }}
                              >
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  id={"chat-msg" + chat.id}
                                  checked={checkedValues.includes(chat.id)}
                                  onChange={() => handleSelect(chat.id)}
                                />
                                <label
                                  className="custom-control-label"
                                  htmlFor={"chat-msg" + chat.id}
                                />
                              </div>
                            ) : null}

                            {[
                              CHAT_TYPE.NORMAL,
                              CHAT_TYPE.WHISPER,
                              CHAT_TYPE.STICKER,
                            ].includes(chat.type) ? (
                              <div className="other-img-wrap">
                                {chat &&
                                chat.user_details &&
                                chat.user_details.avatar.thumb ? (
                                  // && getBooleanStatus(chat.user_details.avatar && chat.user_details.avatar.visible_avatar ? chat.user_details.avatar.visible_avatar : 0) && chat.user_details.avatar.thumb
                                  <img
                                    src={chat.user_details.avatar.thumb}
                                    alt={chat.user_details.username}
                                  />
                                ) : (
                                  <span className="chat-avatar">
                                    {getNameInitials(
                                      chat.user_details.username
                                    )}
                                  </span>
                                )}
                              </div>
                            ) : null}

                            {[CHAT_TYPE.NORMAL, CHAT_TYPE.WHISPER].includes(
                              chat.type
                            ) ? (
                              <div className="other-msg">
                                {chat.type !== CHAT_TYPE.WHISPER ? (
                                  <div className="time-stamp">
                                    <span
                                      style={{
                                        // color: chat.user_id == userSelector.id ? '#7f7f7f' : getSubscriptionColor(chat.user_id != userSelector.id ? chat.user_details
                                        //   : null)
                                        color: getSubscriptionColor(
                                          chat.user_details
                                        ),
                                      }}
                                      className={clsx({
                                        "my-message":
                                          chat.user_id == userSelector.id,
                                        "other-message":
                                          chat.user_id != userSelector.id,
                                      })}
                                    >
                                      {chat.customize_nickname &&
                                      chat.customize_nickname.nickname
                                        ? chat.customize_nickname.nickname
                                        : chat.user_details.username}
                                    </span>

                                    {timeStampToogleSelector &&
                                    showChatTimestamp ? (
                                      <span>
                                        {" " +
                                          getChatTime(
                                            chat.post_converted_timestamp
                                          )}
                                      </span>
                                    ) : null}
                                  </div>
                                ) : null}

                                <div className="msg-list wh_message wh_msg_fix">
                                  {chat.type === CHAT_TYPE.WHISPER ? (
                                    chat.user_id != userSelector.id ? (
                                      <h2>
                                        <img
                                          src="/img/whisper-reply-icon.png"
                                          alt="whisper-chat"
                                        />
                                        From{" "}
                                        {chat && chat.user_details
                                          ? chat.user_details.username
                                          : "--"}
                                        {timeStampToogleSelector &&
                                        showChatTimestamp ? (
                                          <span>
                                            {"-" +
                                              " " +
                                              getChatTime(
                                                chat.post_converted_timestamp
                                              )}
                                          </span>
                                        ) : null}
                                      </h2>
                                    ) : (
                                      <h2>
                                        <img
                                          src="/img/whisper-reply-icon.png"
                                          alt="whisper-chat"
                                        />
                                        To{" "}
                                        {chat && chat.to_user_details
                                          ? chat.to_user_details.username
                                          : "--"}
                                        {timeStampToogleSelector &&
                                        showChatTimestamp ? (
                                          <span>
                                            {"-" +
                                              " " +
                                              getChatTime(
                                                chat.post_converted_timestamp
                                              )}
                                          </span>
                                        ) : null}
                                      </h2>
                                    )
                                  ) : null}

                                  <p
                                    dangerouslySetInnerHTML={createMarkup(
                                      chat.chat_body
                                    )}
                                  />
                                </div>
                              </div>
                            ) : null}

                            <div className="other-msg">
                              {chat.type === CHAT_TYPE.STICKER ? (
                                <>
                                  <div className="time-stamp">
                                    <span
                                      className={clsx({
                                        "my-message":
                                          chat.user_id == userSelector.id,
                                        "other-message":
                                          chat.user_id != userSelector.id,
                                      })}
                                    >
                                      {chat.customize_nickname &&
                                      chat.customize_nickname.nickname
                                        ? chat.customize_nickname.nickname
                                        : chat.user_details.username}
                                    </span>

                                    {timeStampToogleSelector &&
                                    showChatTimestamp ? (
                                      <span>
                                        {" " +
                                          getChatTime(
                                            chat.post_converted_timestamp
                                          )}
                                      </span>
                                    ) : null}
                                  </div>

                                  <p
                                    className="message_sticker"
                                    onContextMenu={(e) => e.preventDefault()}
                                    dangerouslySetInnerHTML={createMarkup(
                                      chat.chat_body
                                    )}
                                  />
                                </>
                              ) : null}
                            </div>

                            {[
                              CHAT_TYPE.WELCOME,
                              CHAT_TYPE.EXIT,
                              CHAT_TYPE.GIFT,
                            ].includes(chat.type) ? (
                              // <strong>
                              <p
                                dangerouslySetInnerHTML={createMarkup(
                                  chat.chat_body
                                )}
                              />
                            ) : // </strong>
                            null}
                          </div>
                        ))
                      : null}
                  </div>
                  <div
                    className="compose-box separated-compose-box"
                    style={{ maxWidth: "100%" }}
                  >
                    <div className="top-btn-set-wrap">
                      <div className="top-left-btns">
                        {/* {isAdminOrNot ?
                          (
                            <button
                              type="button"
                              onClick={openAddUserModal}
                              disabled={
                                (pmWindowDetailsSelector &&
                                  pmWindowDetailsSelector.users &&
                                  pmWindowDetailsSelector.users.length >= 3) ||
                                  getSinglePmUserVisibleStatus(
                                    pmWindowDetailsSelector.pm_type,
                                    pmWindowDetailsSelector.users
                                  )
                                  ? true
                                  : false
                              }
                            >
                              <img src="/img/add-user-icon.png" alt="" />
                              Add User
                            </button>
                          ) : null} */}

                        {/* {isAdminOrNot ?
                          ( */}
                        <button
                          type="button"
                          onClick={openAddUserModal}
                          disabled={
                            (pmWindowDetailsSelector &&
                              pmWindowDetailsSelector.users &&
                              pmWindowDetailsSelector.users.length >= 3) ||
                            (pmWindowDetailsSelector &&
                              pmWindowDetailsSelector.users &&
                              getSinglePmUserVisibleStatus(
                                pmWindowDetailsSelector.pm_type,
                                pmWindowDetailsSelector.users
                              ))
                              ? true
                              : // : false
                              !isAdminOrNot
                              ? true
                              : false
                          }
                        >
                          <img src="/img/add-user-icon.png" alt="" />
                          Add User
                        </button>
                        {/* ) : null} */}

                        <button
                          type="button"
                          onClick={openShareYoutubeVideoModal}
                        >
                          <img src="/img/youtube-share-icon.png" alt="" />
                          YouTube
                        </button>
                        {/* {isAdminOrNot ?
                          (
                            <button
                              type="button"
                              onClick={openRemoveUserModal}
                              disabled={
                                pmWindowDetailsSelector &&
                                  pmWindowDetailsSelector.users &&
                                  pmWindowDetailsSelector.users.length <= 2
                                  ? true
                                  : false
                              }
                            >
                              <img src="/img/remove-user-icon.png" alt="" />
                              Remove User
                            </button>
                          ) : null} */}

                        {/* {isAdminOrNot ?
                          ( */}
                        <button
                          type="button"
                          onClick={openRemoveUserModal}
                          disabled={
                            pmWindowDetailsSelector &&
                            pmWindowDetailsSelector.users &&
                            pmWindowDetailsSelector.users.length <= 2
                              ? true
                              : // : false
                              !isAdminOrNot
                              ? true
                              : false
                          }
                        >
                          <img src="/img/remove-user-icon.png" alt="" />
                          Remove User
                        </button>
                        {/* ) : null} */}
                      </div>

                      <div className="top-right-btns">
                        {startVideoCall ? (
                          <a
                            href="#"
                            className="end-call"
                            onClick={(e) => {
                              pmWindowAction.pmCallAccepted(null);
                              handleEndCamStream(e);
                            }}
                          >
                            <img
                              src="/img/hide-webcam-icon.png"
                              alt="end-call"
                            />
                          </a>
                        ) : (
                          <a
                            href="#"
                            className={startAudioCall ? "disable-link" : ""}
                            onClick={(e) => {
                              setCallType("video");
                              startCallOnClick();
                            }}
                          >
                            <img src="/img/webcam-white-icon.png" alt="" />
                          </a>
                        )}

                        {startVideoCall ? (
                          isVideoCallMuted ? (
                            <a
                              href="#"
                              // className="end-call"
                              onClick={(e) => {
                                // setIsVideoCallMuted(!isVideoCallMuted);
                                // mediaSettings?.toggleSetMic({
                                //   eventStreamId: 'localVideo',
                                //   isMicMuted: false,
                                // });
                                // antmedia.unmuteLocalMic();
                                // if (mediaSettings?.myLocalData?.streamId) {
                                //   antmedia.handleSendNotificationEvent('MIC_UNMUTED', mediaSettings?.myLocalData?.streamId);
                                // }
                                // console.log("MIC-","UNMUTING MIC")
                              }}
                            >
                              Unmute
                              {/* <img src="/img/mic-mute.png" height={22} width={22} alt="" /> */}
                            </a>
                          ) : (
                            <a
                              href="#"
                              // className={startVideoCall ? "disable-link" : ""}
                              onClick={(e) => {
                                // setIsVideoCallMuted(!isVideoCallMuted);
                                // mediaSettings?.toggleSetMic({
                                //   eventStreamId: 'localVideo',
                                //   isMicMuted: true,
                                // });
                                // antmedia.muteLocalMic();
                                // if (mediaSettings?.myLocalData?.streamId) {
                                //   antmedia.handleSendNotificationEvent('MIC_MUTED', mediaSettings?.myLocalData?.streamId);
                                //   antmedia.updateAudioLevel(mediaSettings?.myLocalData?.streamId, 0);
                                // }
                                // console.log("MIC-","MUTING MIC")
                              }}
                            >
                              Mute
                              {/* <img src="/img/voice.png" height={22} width={22} alt="" /> */}
                            </a>
                          )
                        ) : null}

                        {startAudioCall ? (
                          <a
                            href="#"
                            className="end-call"
                            onClick={(e) => {
                              pmWindowAction.pmCallAccepted(null);
                              handleEndAudioStream(e);
                            }}
                          >
                            <img
                              src="/img/mic-mute.png"
                              height={22}
                              width={22}
                              alt=""
                            />
                          </a>
                        ) : (
                          <a
                            href="#"
                            className={startVideoCall ? "disable-link" : ""}
                            onClick={(e) => {
                              setCallType("voice");
                              startCallOnClick();
                            }}
                          >
                            <img
                              src="/img/voice.png"
                              height={22}
                              width={22}
                              alt=""
                            />
                          </a>
                        )}
                      </div>
                    </div>
                    {textEditorSelector ? (
                      <div className="toolbar-container">
                        <ul className="chat-toolbar">
                          <li>
                            <select onChange={handleChangeFont}>
                              <option value="">Select</option>
                              <option value="Roboto">Roboto</option>
                              <option value="Lato">Lato</option>
                              <option value="MonteCarlo">MonteCarlo</option>
                              <option value="Comic Sans MS">
                                Comic Sans MS
                              </option>
                              <option value="Open Sans">Open Sans</option>
                            </select>
                          </li>
                          <li>
                            {/* <span onClick={() => handleTextDecoration('bold', undefined)}>Bold</span> */}
                            <a
                              href="#"
                              onClick={(e) =>
                                handleTextDecoration(e, "bold", undefined)
                              }
                            >
                              B
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              onClick={(e) =>
                                handleTextDecoration(e, "italic", undefined)
                              }
                            >
                              I
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              onClick={(e) =>
                                handleTextDecoration(e, "Underline", undefined)
                              }
                            >
                              U
                            </a>
                          </li>
                          <li>
                            <select onChange={handleFontSize}>
                              <option value="">Select</option>
                              <option value="1">Small</option>
                              <option value="3">Normal</option>
                              <option value="4">Large</option>
                              <option value="6">Huge</option>
                            </select>
                          </li>

                          <li>
                            <ColorPicker
                              color={colorPicker}
                              alpha={30}
                              onChange={changeHandler}
                              // onClose={closeHandler}
                              placement="topLeft"
                              className="some-class"
                            >
                              <span className="rc-color-picker-trigger" />
                            </ColorPicker>
                          </li>
                          <li className="ch_cross">
                            <a href="#" onClick={(e) => handleOpenToolBar(e)}>
                              <i className="bx bx-x cancel_img waves-effect"></i>
                            </a>
                          </li>
                        </ul>
                      </div>
                    ) : null}
                    <div className="com-text-box">
                      {/* <textarea placeholder="Type here..." defaultValue={""} /> */}

                      <ContentEditable
                        // tagName="pre"
                        innerRef={contentEditableFocus}
                        html={chatTextRef.current}
                        onBlur={chatHandleBlur}
                        disabled={false}
                        onChange={chatHandleChange}
                        onKeyDown={chatOnKeyDown}
                        onKeyUp={handleOnKeyUp}
                        className="pm-chat-content-editable"
                        placeholder="Type here..."
                        spellCheck={isSpellCheck}
                      />
                      <input
                        type="hidden"
                        ref={enterMsgSend}
                        id="enter-msg-key"
                        value={isEnterKeySendMsg ? "sendMsg" : "newLine"}
                      />
                      <button
                        type="button"
                        onClick={() => sendMsg("normal")}
                        disabled={chatText ? false : true}
                      >
                        <img src="/img/sent-msg-icon.png" alt="" />
                      </button>
                    </div>

                    {/* Emoji & Stricker start here */}

                    {stickerEmojiOpen ? (
                      <div className="emoji-sticker-box">
                        {isStickerOrEmoji == "emoji" ? (
                          <div className="emoji-section">
                            <Picker onEmojiClick={onEmojiClick} />
                          </div>
                        ) : (
                          <div className="sticker-section">
                            <div className="sticker-head">
                              <div className="left-head">
                                <Slider {...settings}>{renderSlides()}</Slider>
                              </div>
                              <div className="right-head">
                                {/* <a href="#" data-toggle="modal" data-target="#newSticker"><i className="bx bx-plus"></i></a> */}
                                <a
                                  href="#"
                                  onClick={(e) => openStickerBuyModal(e)}
                                >
                                  <i className="bx bx-plus"></i>
                                </a>
                              </div>
                            </div>
                            <div className="sticker-body">
                              {categorywiseSticker &&
                              categorywiseSticker.length ? (
                                categorywiseSticker.map((sticker: any) => (
                                  <div
                                    onClick={() => {
                                      const height = sticker?.sticker_info
                                        ? sticker?.sticker_info.height
                                        : sticker.height;
                                      const width = sticker?.sticker_info
                                        ? sticker?.sticker_info.width
                                        : sticker.width;

                                      pasteSticker(
                                        sticker.icon.thumb,
                                        height,
                                        width,
                                        sticker.title
                                      );
                                    }}
                                    className="sticker-box"
                                  >
                                    <img src={sticker.icon.thumb} alt="" />
                                  </div>
                                ))
                              ) : (
                                <div className="no-sticker-available">
                                  No sticker Available
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="two-tabs">
                          <a
                            href="#"
                            className={
                              isStickerOrEmoji == "emoji" ? "active" : ""
                            }
                            onClick={(e) => handleEmojiSticker(e, "emoji")}
                          >
                            <i className="fas fa-smile"></i>
                          </a>
                          <a
                            href="#"
                            className={
                              isStickerOrEmoji == "sticker" ? "active" : ""
                            }
                            onClick={(e) => handleEmojiSticker(e, "sticker")}
                          >
                            <i className="fas fa-sticky-note"></i>
                          </a>
                        </div>
                      </div>
                    ) : null}

                    {/* Format text start here */}

                    {isToolbarOpen ? (
                      <div className="toolbar-container">
                        <ul className="chat-toolbar">
                          <li>
                            <select onChange={handleChangeFont}>
                              <option value="">Select</option>
                              <option value="Roboto">Roboto</option>
                              <option value="Lato">Lato</option>
                              <option value="MonteCarlo">MonteCarlo</option>
                              <option value="Comic Sans MS">
                                Comic Sans MS
                              </option>
                              <option value="Open Sans">Open Sans</option>
                            </select>
                          </li>
                          <li>
                            {/* <span onClick={() => handleTextDecoration('bold', undefined)}>Bold</span> */}
                            <a
                              href="#"
                              onClick={(e) =>
                                handleTextDecoration(e, "bold", undefined)
                              }
                            >
                              B
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              onClick={(e) =>
                                handleTextDecoration(e, "italic", undefined)
                              }
                            >
                              I
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              onClick={(e) =>
                                handleTextDecoration(e, "Underline", undefined)
                              }
                            >
                              U
                            </a>
                          </li>
                          <li>
                            <select onChange={handleFontSize}>
                              <option value="">Select</option>
                              <option value="1">Small</option>
                              <option value="3">Normal</option>
                              <option value="4">Large</option>
                              <option value="6">Huge</option>
                            </select>
                          </li>

                          <li>
                            <ColorPicker
                              color={colorPicker}
                              alpha={30}
                              onChange={changeHandler}
                              // onClose={closeHandler}
                              placement="topLeft"
                              className="some-class"
                            >
                              <span className="rc-color-picker-trigger" />
                            </ColorPicker>
                          </li>
                          <li className="ch_cross">
                            <a href="#" onClick={(e) => handleOpenToolBar(e)}>
                              <i className="bx bx-x cancel_img waves-effect"></i>
                            </a>
                          </li>
                        </ul>
                      </div>
                    ) : null}

                    {/* Format text End here */}

                    <div className="com-action-left">
                      <a
                        href="#"
                        className="active"
                        onClick={(e) => handleOpenToolBar(e)}
                      >
                        <img src="/img/text-icon.png" alt="" />
                        <span>Format Text</span>
                      </a>
                      <a href="#" onClick={(e) => openContactListModal(e)}>
                        <img src="/img/gift-icon.png" alt="" />
                        <span>Send Virtual Gifts</span>
                      </a>
                      <a href="#" onClick={(e) => openStickerBox(e)}>
                        <img src="/img/sticker-icon.png" alt="" />
                        {/* <span>Send Emoji</span> */}
                        <span>Emoji & Stickers</span>
                      </a>
                      <a
                        href="#"
                        onClick={(e) => openShowUsersLocationModal(e)}
                      >
                        <img src="/img/user-location-icon.png" alt="" />
                        <span>Show User's Location</span>
                      </a>
                      <a href="#">
                        <img src="/img/translate-icon.png" alt="" />
                        <span>Translate Language</span>
                      </a>
                      <button
                        onClick={handleSpellCheck}
                        className={
                          isSpellCheck
                            ? "btn-spell-check active"
                            : "btn-spell-check"
                        }
                        disabled={!isSpelcheckAvailable}
                      >
                        <img src="/img/auto-correct-icon.png" alt="" />
                        <span>Spell Check</span>
                      </button>
                      <a href="#" onClick={(e) => openVideoMessageModal(e)}>
                        <img src="/img/send-video-icon.png" alt="" />
                        <span>Send Video Message</span>
                      </a>
                      <a href="#" onClick={(e) => openVoiceMessageModal(e)}>
                        <img src="/img/voice.png" alt="" />
                        <span>Send Voicemail</span>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <img
                    src={"/img/Banner2.png"}
                    alt=""
                    style={{ maxWidth: "100%" }}
                    className="mb-3"
                  />
                  <img
                    src={"/img/Banner5.png"}
                    alt=""
                    style={{ maxWidth: "100%" }}
                  />
                </div>
              </div>

              {showPmTyping ? (
                <div className="typing-message">
                  <span>{typingStringGenerate(typing)}</span>
                  {typing && typing.length ? " is typing..." : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {/* end row */}
      </div>

      {showCallNotificationModal ? (
        <CallNotificationModal
          shouldShow={showCallNotificationModal}
          onClose={() => setShowCallNotificationModal(false)}
          getPmWindowDetails={getPmWindowDetails}
          pmId={pm_id}
        />
      ) : null}

      {showVideoMessageModal ? (
        <SendVideoMessagePmModal
          shouldShow={showVideoMessageModal}
          onClose={closeVideoMessageModal}
        />
      ) : null}
      {showVoiceMessageModal ? (
        <SendVoiceMessagePmModal
          shouldShow={showVoiceMessageModal}
          onClose={closeVoiceMessageModal}
        />
      ) : null}
      {/* {showShareYoutubeVideoModal ? (
        <ShareYoutubeVideoPmModal
          shouldShow={showShareYoutubeVideoModal}
          onClose={closeShareYoutubeVideoModal}
        />
      ) : null} */}
      {showAddUserPmModal ? (
        <AddUserPmModal
          shouldShow={showAddUserPmModal}
          onClose={closeAddUserPmModal}
          getPmWindowDetails={getPmWindowDetails}
          pmId={pm_id}
        />
      ) : null}
      {showRemoveUserPmModal ? (
        <RemoveUserPmModal
          shouldShow={showRemoveUserPmModal}
          onClose={closeRemoveUserPmModal}
          getPmWindowDetails={getPmWindowDetails}
          pmId={pm_id}
        />
      ) : null}

      {showStickerBuyModal ? (
        <StickerBuyModal
          onClose={handleOnCloseSticker}
          shouldShow={showStickerBuyModal}
          byModalType={byStickerModalType} //ownStickerBuy or giftSendStickerBuy
          selectedContactList={selectedContactList}
          entityId={parseInt(cryptr.decrypt(pmId))}
          type={"pm"}
        />
      ) : null}

      {showContactListModal ? (
        <ContactListForGiftModal
          onClose={contactListCloseModal}
          onSuccess={openGiftSticker}
          shouldShow={showContactListModal}
          type={"stickerGiftSend"}
          isPMUsers={true}
        />
      ) : null}

      {showUsersLocationModal ? (
        <UserLocationShowModal
          shouldShow={showUsersLocationModal}
          onClose={closeUserLOcationModalModal}
        />
      ) : null}
    </React.Fragment>
  );
}
