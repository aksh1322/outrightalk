import {
  GroupChannel,
  GroupChannelHandler,
  GroupChannelModule,
  MessageFilter,
} from "@sendbird/chat/groupChannel";
import Picker from "emoji-picker-react";
import ColorPicker from "rc-color-picker";
import "rc-color-picker/assets/index.css";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import ContentEditable from "react-contenteditable";
import { FaTimes } from "react-icons/fa";
import ReactPlayer from "react-player";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import Slider from "react-slick";
import { toast } from "react-toastify";
import { useCommonApi } from "src/_common/hooks/actions/commonApiCall/appCommonApiCallHook";
import { useAppPmWindowAction } from "src/_common/hooks/actions/pmWindow/appPmWindowActionHook";
import { usePmWindowApi } from "src/_common/hooks/actions/pmWindow/appPmWindowApiHook";
import { useAppUserAction } from "src/_common/hooks/actions/user/appUserActionHook";
import { useUserApi } from "src/_common/hooks/actions/user/appUserApiHook";
import {
  useAppInstanceInvitedUsers,
  useTextEditorSelector,
} from "src/_common/hooks/selectors/groupCategorySelector";
import {
  useAppActivePmsRouteSelector,
  useAppPmChatDataSelectDeselect,
  useAppPmWindowChatDetailsSelector,
  useAppPmWindowDetails,
  useAppPmWindowIsCallAcceptedSelector,
  usePmChatTypingSelector,
  usePmStartCallOnClickFieldSelector,
  usePmTimeStampSelector,
} from "src/_common/hooks/selectors/pmWindowSelector";
import { useAppUserPreferencesSelector } from "src/_common/hooks/selectors/userPreferenceSelector";
import {
  useAppSocketInstanceContainer,
  useAppUserCallDetails,
  useAppUserDetailsSelector,
} from "src/_common/hooks/selectors/userSelector";
import useOutsideClick from "src/_common/hooks/useClickOutside";
import {
  ACTIONS,
  BOUNDARY_STICKER_SIZE,
  CRYPTO_SECRET_KEY,
  DEFAULT_STICKER_SIZE,
  HEADER_MENU_SELECTION_TYPE,
  LOGIN_STORAGE,
  MENU_OPERATIONS,
  SENDBIRD_APP_ID,
  SOCKET_URL,
  URLS,
  getBooleanStatus,
  getChatTime,
  getNameInitials,
  getSubscriptionColor,
  getSubscriptionColorInRoom,
  stripHtml,
} from "src/_config";
import { ReactComponent as EndCallSvg } from "src/assets/svg/end-call-icon.svg";
import { ReactComponent as CallSvg } from "src/assets/svg/phonecall2_83997.svg";
import { ReactComponent as SpeakerOffSvg } from "src/assets/svg/speaker-cross-svgrepo-com.svg";
import { ReactComponent as SpeakerOnSvg } from "src/assets/svg/speaker-wave-2-svgrepo-com.svg";
import { ReactComponent as VideoCallSvg } from "src/assets/svg/video_camera_icon_124245.svg";
import ContactListForGiftModal from "src/components/commonModals/contactListForGiftSend/ContactListModal";
import StickerBuyModal from "src/components/commonModals/stickerBuyModal/stickerBuyModal";
import {
  useCallContext,
  useChatContext,
  useFileContext,
  useNotificationsContext,
  useSendBird,
  useSendBirdCall,
} from "src/hooks";
import useSocket from "use-socket.io-client";
import BuyVirtualGiftModal from "../commonModals/buyVitrualGift/buyVirtualGiftModal";
import OtherPmUsers from "./common/otherPmUsers";
import CustomSweetAlert from "./customSweetAlert";
import AddUserPmModal from "./modal/addUserModal/addUserPmModal";
import CallNotificationModal from "./modal/callNotificationModal/callNotificationModal";
import RemoveUserPmModal from "./modal/removeUserModal/removeUserPmModal";
import SendFilePmModal from "./modal/sendFileModal/sendFilePmModal";
import ShareYoutubeVideoPmModal from "./modal/shareYoutubeVideoModal/shareYoutubeVideoPmModal";
import UserLocationShowModal from "./modal/showUserLocationModal/showUserLocationModal";
import TranslationModal from "./modal/translationModal/translationModal";
import SendVideoMessagePmModal from "./modal/videoMessageModal/videoMessagePmModal";
import SendVoiceMessagePmModal from "./modal/voiceMessageModal/voiceMessagePmModal";
// import { useUserPreferenceApi } from "src/_common/hooks/actions/userPreference/appUserPreferenceApiHook";
// import { useUserApi } from "src/_common/hooks/actions/user/appUserApiHook";
import SendbirdChat from "@sendbird/chat";
import debounce from "lodash/debounce";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";

const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

function PmRoomPage({ roomName }: any) {
  const userApi = useUserApi();
  const [isDndModeActive, setIsDndModeActive] = useState(false);

  const { startCall, startCallAudio, onStartVideo, endAudioCall, endCall } =
    useSendBirdCall("pm");

  const {
    openCall,
    openAudioCall,
    audioAccess,
    videoAccess,
    setAudioAccess,
    setVideoAccess,
    setOpenCall,
    invitationRec,
    acceptedFromInvite,
    setAcceptedFromInvite,
    microphoneState,
  } = useCallContext();
  const { isAccepted } = useNotificationsContext();
  const [socket] = useSocket(SOCKET_URL, {
    autoConnect: false,
  });
  const { showSendFileModal, setShowSendFileModal } = useFileContext();

  const value = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS);
  const {
    id: signedInUserId,
    send_bird_user: { sb_access_token: signedInUserToken },
  } = value
    ? JSON.parse(value)
    : {
        id: null,
        send_bird_user: { sb_access_token: null },
      };
      let appId: string = SENDBIRD_APP_ID;
      const sb = SendbirdChat.init({
        appId,
        modules: [new GroupChannelModule()],
      });
    
  const userCallDetails = useAppUserCallDetails();
  const userAction = useAppUserAction();
  const commonApi = useCommonApi();
  const pmWindowApi = usePmWindowApi();
  const pmWindowAction = useAppPmWindowAction();
  const notificationSelector = useAppInstanceInvitedUsers();
  const { pmId } = useParams<any>();
  const pm_id: number = parseInt(cryptr.decrypt(pmId));
  const userSelector = useAppUserDetailsSelector();

  const pmWindowDetailsSelector = useAppPmWindowDetails();

  const preferenceSelector = useAppUserPreferencesSelector();
  const typing = usePmChatTypingSelector();
  const CheckTimeStamp = usePmTimeStampSelector();

  const chatDataSelectDeselectSelector = useAppPmChatDataSelectDeselect();
  const fromRoute = useAppActivePmsRouteSelector();
  const pmChatDetails = useAppPmWindowChatDetailsSelector();
  const groupCategoryApi = useGroupCategoryApi();
  const [checkedValues, setCheckedValues] = useState<number[]>([]);
  const [showOtherMembers, setShowOtherMembers] = useState<boolean>(false);
  const [chatText, setChatText] = useState("");
  const [showVideoMessageModal, setShowVideoMessageModal] =
    useState<boolean>(false);
  const [showVoiceMessageModal, setShowVoiceMessageModal] =
    useState<boolean>(false);
  const [showShareYoutubeVideoModal, setShowShareYoutbeVideoModal] =
    useState<boolean>(false);
  // const [viewYoutubeVideoPmModal, setViewYoutubeVideoPmModal] =
  //   useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [showAddUserPmModal, setShowAddUserPmModal] = useState<boolean>(false);
  const [showtranslationModal, setShowTranslationModal] =
    useState<boolean>(false);
  const [showCreditAlert, setShowcreditalert] = useState<any>(false);
  const [showRemoveUserPmModal, setShowRemoveUserPmModal] =
    useState<boolean>(false);

  const [disableSendBtn, setDisableSendBtn] = useState(true);
  const chatTextRef = useRef("");
  const contentEditableFocus = useRef<any>();
  const [isEnterKeySendMsg, setIsEnterKeySendMsg] = useState(true);
  const [checkAutoReplyMessage, setautoReplyMessage] = useState(false);
  const enterMsgSend = useRef<any>();
  const history = useHistory();

  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [colorPicker, setColorPicker] = useState("#000000");
  const [stickerEmojiOpen, setStickerEmojiOpen] = useState(false);
  const [checkAddUser, setCheckAddUser] = useState(false);
  const [isStickerOrEmoji, setIsStickerOrEmoji] = useState("emoji");
  const [stickerCategories, setStickerCategories] = useState<any>([]);
  const [showStickerBuyModal, setShowStickerBuyModal] =
    useState<boolean>(false);
  const [selectedStickerCategory, setSelectedStickerCategory] =
    useState<number>();
  const [categorywiseSticker, setCategorywiseSticker] = useState<any>([]);
  const [showChatTimestamp, setShowChatTimeStamp] = useState<any>();
  const [showPmTyping, setShowPmTyping] = useState<any>();
  const [isProfileCheck, setIsProfileCheck] = useState<boolean>(false);

  const [firstTimeChatScroll, setFirstTimechatScroll] = useState<boolean>(true);

  const [pmWindowName, setPmWindowName] = useState<any>([]);

  const dispatch = useDispatch();
  const socketContainer: any = useAppSocketInstanceContainer();
  const textEditorSelector = useTextEditorSelector();

  const [isAdminOrNot, setisAdminOrNot] = useState<boolean>(false);

  const [startVideoCall, setStartVideoCall] = useState<boolean>(false);
  const [startAudioCall, setStartAudioCall] = useState<boolean>(false);
  const [streams, setStreams] = useState<any>([]);
  const [inviteForUsers, setInviteForUsers] = useState<any>([]);
  const [isPlayVideo, setIsPlayVideo] = useState(false);
  const [showContactListModal, setContactListModalModal] =
    useState<boolean>(false);
  const [byStickerModalType, setByStickerModalType] = useState<any>();
  const [selectedContactList, setSelectedContactList] = useState<any>([]);

  const [isSpellCheck, setIsSpellCheck] = useState<boolean>(false);
  const [isSpelcheckAvailable, setIsSpellCheckAvailable] =
    useState<boolean>(false);
  const [isTranslateAvailable, setIsTranslateCheckAvailable] =
    useState<boolean>(false);
  const [showUsersLocationModal, setShowUsersLocationModal] =
    useState<boolean>(false);

  const [showCallNotificationModal, setShowCallNotificationModal] =
    useState<boolean>(false);

  const [isCalling, setIsCalling] = useState(false);

  const [callType, setCallType] = useState<string>("");

  const emojiStickerRef = useRef<any>(null);
  const emojiStickerBtnRef = useRef<any>(null);

  const isPmCallAccepted = useAppPmWindowIsCallAcceptedSelector();

  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isPageMuted, setIsPageMuted] = useState(false);
  const [disabledYouTtubeButton, setDisabledYouTtubeButton] = useState(false);
  const [invitationSender, setInvitationSender] = useState<any>();

  const [filteredRoomChat, setFilteredRoomChat] = useState<[]>([]);
  const [isWaitingForOthersToJoin, setIsWaitingForOthersToJoin] =
    useState<any>(null);
  const startingCallOnClick = usePmStartCallOnClickFieldSelector();
  const messageListElementRef = useRef<HTMLDivElement | null>(null);
  const [currentUsersInRoom, setCurrentUsersInRoom] = useState<any>();
  const [roomJoined, setRoomJoined] = useState<any>(null);
  const [messageIn, setMessage] = useState<any>(null);
  const [showTranslationAlert, setShowTranslationAlert] = useState<any>(false);
  const [usercredits, setUserCredits] = useState<any>(null);
  const [videoInviteAccept, setVideoInviteAccept] = useState<any>(null);
  const [videoInvitationReciever, setVideoInvitationReciever] = useState<any>();
  const [rejectedAlert, setRejectedAlert] = useState<any>();
  const [translationcharCount, setTranslationCharCount] = useState<any>();
  const [checkedLanguage, setcheckedLanguage] = useState<any>();
  const [reactPlayeStyle, setReactPlayerStyle] = useState<any>("none");
  const [showBuyVirtualGift, setShowBuyVirtualGift] = useState<any>(false);
  const [openVirtualCreditsModal, setOpenVirtualCreditsModal] =
    useState<any>(null);
  const [showReminderAlert, setshowReminderAlert] = useState<any>(null);
  const [pmUsers, setPmUsers] = useState<any>(null);
  const [typingmembers, Setmembers] = useState<any>();
  const [channel, setChannel] = useState<any>();
  const [allAutoReplyMsg, setallAutoReplyMsg] = useState<any>({});

  const {
    populateCurrentRoomChat,
    clearCurrentRoomChatInfo,
    joinARoom,
    sendMessageInRoom,
    checkTranslate,
  } = useSendBird(scrollToBottom);
  const {
    currentRoomChat,
    setCurrentRoomURL,
    currentRoomURL,
    currentRoomMembers,
    currentPmAdminUserId,
    setCurrentPmAdminUserId,
  } = useChatContext();
  const {
    currentCallRoomId,
    currentAudioCallRoomId,
    setCurrentCallRoomId,
    setCurrentAudioCallRoomId,
    setShowAlert,
    showAlert,
    showYoutubeAlert,
    setShowYoutubeAlert,
    callRoom,
    audioCallRoom,
    setOpenAudioCall,
  } = useCallContext();

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
  function scrollToBottom() {
    if (
      messageListElementRef.current &&
      messageListElementRef.current !== null
    ) {
      messageListElementRef.current.scrollTo(
        0,
        messageListElementRef.current.scrollHeight
      );
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

  // stop both mic and camera
  function stopBothVideoAndAudio() {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })

      .then((stream) => {
        stream.getTracks().forEach(function (track: any) {
          track.stop();
        });
      })
      .catch((err: any) => {
        console.log("track err", err);
      });
  }

  const sliderSettings = {
    dots: false,
    infinite: false,
    slidesToShow: 4,
    slidesToScroll: 4,
    swipeToSlide: true,
    autoplay: false,
  };

  useEffect(() => {
    setShowChatTimeStamp(CheckTimeStamp);
  }, [CheckTimeStamp]);

  useEffect(() => {
    const preferenceBasedChats = preferenceSelector?.list.find(
      (data: any) =>
        data?.field_label === "Save chat history" && data?.val === "2"
    );
    if (preferenceBasedChats) {
      const currentDate = new Date();
      const timestamp = currentDate.getTime() - 7 * 24 * 60 * 60 * 1000;

      const chatsOneWeekAgo = currentRoomChat?.filter((chat: any) => {
        return (
          chat.createdAt >= timestamp && chat.createdAt <= currentDate.getTime()
        );
      });
      setFilteredRoomChat(chatsOneWeekAgo);
    } else {
      setFilteredRoomChat(currentRoomChat);
    }
  }, [preferenceSelector, currentRoomChat]);

  useEffect(() => {
    let profileCheck = preferenceSelector?.list.filter(
      (x: any) => x.key == "not_display_profile_pic_pm"
    );
    if (profileCheck && profileCheck?.length) {
      // if (parseInt(profileCheck[0]?.val) == 1) {
      //   setIsProfileCheck(false);
      // } else {
      //   setIsProfileCheck(true);
      // }
      parseInt(profileCheck[0]?.val) == 1
        ? setIsProfileCheck(false)
        : setIsProfileCheck(true);
    }
  }, [preferenceSelector]);

  useEffect(() => {
    socket.connect();
    socket.on("Invite", (data: any) => {
      if (data?.type === "share" && data.payload?.pm_id == pm_id) {
        const checkUser = data?.payload.inviteForUsers.find(
          (user: any) => user.id == userSelector?.id
        );
        setIsPlayVideo(false);
        setReactPlayerStyle("none");
        setVideoInviteAccept(false);
        setInvitationSender(data?.payload?.sender);
        if (checkUser) {
          setShowYoutubeAlert(true);
          setVideoUrl(data?.payload?.url);
          setVideoInvitationReciever(data?.payload?.inviteForUsers);
        }
        setDisabledYouTtubeButton(true);
      }
      if (
        data?.type === "accepted" &&
        data?.payload?.accepted &&
        data?.payload?.toUser?.id == userSelector?.id &&
        data.payload?.pm_id == pm_id
      ) {
        setRejectedAlert(
          <SweetAlert
            warning
            confirmBtnText="Ok"
            confirmBtnBsStyle="primary"
            allowEscape={false}
            closeOnClickOutside={false}
            title="Invitation Confirmation"
            onConfirm={() => setRejectedAlert(false)}
            onCancel={() => {
              setRejectedAlert(false);
            }}
            focusCancelBtn={true}
          >
            {`Invitation is aceepted by ${data?.payload?.byUser?.name}`}
          </SweetAlert>
        );
        setReactPlayerStyle("");
      }
      if (
        data?.type === "rejected" &&
        !data?.payload?.accepted &&
        data.payload?.pm_id == pm_id
      ) {
        setRejectedAlert(
          <SweetAlert
            warning
            confirmBtnText="Ok"
            confirmBtnBsStyle="danger"
            allowEscape={false}
            closeOnClickOutside={false}
            title="Invitation Rejected"
            onConfirm={() => setRejectedAlert(false)}
            onCancel={() => {
              setRejectedAlert(false);
            }}
            focusCancelBtn={true}
          >
            {`Invitation is reajected by ${data?.payload?.byUser?.name}`}
          </SweetAlert>
        );
      }
      if (
        data?.type === "start" &&
        data?.payload?.play &&
        data.payload?.pm_id == pm_id
      ) {
        setIsPlayVideo(true);
      }
      if (
        data?.type === "stop" &&
        !data?.payload?.play &&
        data.payload?.pm_id == pm_id
      ) {
        setIsPlayVideo(false);
      }
      if (
        data?.type === "close" &&
        data?.payload?.closeModal &&
        data?.payload?.closeBy?.id != userSelector?.id &&
        data?.payload?.closeSender &&
        data.payload?.pm_id == pm_id
      ) {
        setVideoUrl("");
        setDisabledYouTtubeButton(false);
        const isVideoInvitationAccept = localStorage.getItem(
          "videoInvitationAccept"
        );
        if (isVideoInvitationAccept) {
          setRejectedAlert(
            <SweetAlert
              warning
              confirmBtnText="Ok"
              confirmBtnBsStyle="danger"
              allowEscape={false}
              closeOnClickOutside={false}
              title="Video Closed"
              onConfirm={() => setRejectedAlert(false)}
              onCancel={() => {
                setRejectedAlert(false);
              }}
              focusCancelBtn={true}
            >
              {`Video Ended by ${data?.payload?.closeBy?.name}`}
            </SweetAlert>
          );
        }
      }
      if (
        data?.type === "close" &&
        data?.payload?.closeModal &&
        data?.payload?.closeBy?.id != userSelector?.id &&
        !data?.payload?.closeSender &&
        data.payload?.pm_id == pm_id
      ) {
        setRejectedAlert(
          <SweetAlert
            warning
            confirmBtnText="Ok"
            confirmBtnBsStyle="danger"
            allowEscape={false}
            closeOnClickOutside={false}
            title="Video Closed"
            onConfirm={() => setRejectedAlert(false)}
            onCancel={() => {
              setRejectedAlert(false);
            }}
            focusCancelBtn={true}
          >
            {`Video Ended by ${data?.payload?.closeBy?.name}`}
          </SweetAlert>
        );
        // }
      }
    });

    return () => {
      socket.disconnect();
      // clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (userCallDetails) {
      if (
        userCallDetails.call_inside == "PM" &&
        userCallDetails.element_id == pm_id &&
        !roomJoined
      ) {
        handleJoinRoom();
      }
    }
  }, [userCallDetails]);

  useEffect(() => {
    if (pmWindowDetailsSelector) {
      setCallType(
        pmWindowDetailsSelector.is_video_on === 1
          ? "video"
          : pmWindowDetailsSelector.is_voice_on === 1
          ? "voice"
          : ""
      );
    }
    let SavedTimeStampArray = JSON.parse(
      localStorage.getItem("timeStamp") || "[]"
    );

    if (SavedTimeStampArray.length) {
      const checktimeStampAvailable = SavedTimeStampArray?.filter(
        (x: any) => x.pm_id == pm_id
      );
      if (checktimeStampAvailable.length) {
        setShowChatTimeStamp(checktimeStampAvailable);
        pmWindowAction.SetTimeStamp(checktimeStampAvailable);
      } else {
        var timeStamp: any = {
          pm_id: pm_id,
          settings: {
            show_timestamp_pm:
              pmWindowDetailsSelector &&
              pmWindowDetailsSelector?.pm_settings?.show_timestamp_pm == 1
                ? true
                : false,
          },
        };
        SavedTimeStampArray.push(timeStamp);
        localStorage.setItem("timeStamp", JSON.stringify(SavedTimeStampArray));
        const getData = JSON.parse(localStorage.getItem("timeStamp") || "[]");
        const checktimeStampAvailable = getData?.filter(
          (x: any) => x.pm_id == pm_id
        );
        setShowChatTimeStamp(checktimeStampAvailable);
        pmWindowAction.SetTimeStamp(checktimeStampAvailable);
      }
    } else {
      var timeStamp: any = {
        pm_id: pm_id,
        settings: {
          show_timestamp_pm:
            pmWindowDetailsSelector &&
            pmWindowDetailsSelector?.pm_settings?.show_timestamp_pm == "1"
              ? true
              : false,
        },
      };
      SavedTimeStampArray.push(timeStamp);
      localStorage.setItem("timeStamp", JSON.stringify(SavedTimeStampArray));
      const getData = JSON.parse(localStorage.getItem("timeStamp") || "[]");
      setShowChatTimeStamp(getData);
      pmWindowAction.SetTimeStamp(getData);
    }
  }, [pmWindowDetailsSelector]);

  useEffect(() => {
    if (
      pmWindowDetailsSelector &&
      userSelector &&
      pmWindowDetailsSelector.is_initiated_by == userSelector.id
    ) {
      let isCallAccepted = pmWindowDetailsSelector.users.find((ele: any) => {
        return ele.is_accept_audio_video == 1 && ele.user_id != userSelector.id;
      });
      let names: any = [];
      pmWindowDetailsSelector.users.forEach((ele: any) => {
        if (ele.user_id != userSelector.id) names.push(ele.user_info.username);
      });
      let usernames = names.join(", ");

      !isCallAccepted
        ? setIsWaitingForOthersToJoin(
            <CustomSweetAlert
              type="warning"
              showCancel
              confirmBtnText="Ok"
              cancelBtnText="End Call"
              cancelBtnBsStyle="danger"
              confirmBtnBsStyle="success"
              allowEscape={false}
              closeOnClickOutside={false}
              title="Ringing"
              onConfirmFunc={() => {
                setIsWaitingForOthersToJoin(null);
              }}
              onCancelFunc={() => {
                callType == "video"
                  ? handleEndCamStream()
                  : handleEndAudioStream();
                pmWindowAction.pmCallAccepted(null);
                setIsWaitingForOthersToJoin(null);
              }}
              focusCancelBtn={true}
              innerText={`You have invited ${usernames} to start the video session`}
            />
          )
        : setIsWaitingForOthersToJoin(null);
    }
  }, [pmWindowDetailsSelector, userSelector]);

  useEffect(() => {
    let data = localStorage.getItem("receivingCallInsidePm");

    if (
      data &&
      userSelector &&
      pmWindowDetailsSelector &&
      !roomJoined &&
      !userCallDetails
    ) {
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

  const handleJoinRoom = async () => {};

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
    setIsPlayVideo(false);
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

  useEffect(() => {
    if (currentRoomMembers) {
      // setPmWindowName(
      //   currentRoomMembers.map((member: any) => member.nickname).join(", ")
      // );
      setInviteForUsers(
        currentRoomMembers
          .filter((member: any) => member?.userId != userSelector?.id)
          .map((filteredMember: any) => {
            return {
              id: filteredMember?.userId,
              name: filteredMember?.nickname,
            };
          })
      );
    }
  }, [currentRoomMembers]);

  // for translation modal
  const openTranslationModal = () => {
    setShowTranslationModal(true);
  };

  const closeTranslationModal = () => {
    if (showtranslationModal) {
      setShowTranslationModal(false);
    }
  };

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

  const handleCloseBuyVirtualGiftModal = () => {
    setShowBuyVirtualGift(false);
    if (openVirtualCreditsModal) {
      localStorage.removeItem("open_virtual_credits_modal");
      setOpenVirtualCreditsModal(null);
    }
  };

  const chatHandleBlur = () => {};
  const containsLink = (text: string) => {
    const linkRegex =
      /(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-zA-Z0-9]+([-.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/.*)?/;
    return linkRegex.test(text);
  };
  // const preference = useUserPreferenceApi();
  // useEffect(() => {
  //   let params = {};
  //   preference.callGetUserPreference(
  //     params,
  //     (message: string, resp: any) => {
  //       console.log(resp,"callgetuserprefernces");

  //     },
  //     (message: string) => {
  //       toast.error(message);
  //     }
  //   );
  // }, []);

  // const preference=useUserPreferenceApi();
  //   useEffect(() => {
  //     getUserAutoReplyMsg();
  //   }, [])

  //   const getUserAutoReplyMsg = () => {
  //     preference.callGetUserAutoReply((message: string, resp: any) => {
  // const allMessage=resp;
  //       if (userSelector &&
  //         userSelector.auto_reply_message?.enable_auto_reply == 1 &&
  //         userSelector.auto_reply_message?.send_automatic_chatting_with_me == 1) {

  //       const data = allMessage?.list?.find((msg:any) => {
  //         return msg.id == userSelector.auto_reply_message.selected_message_id;
  //       });

  //       notificationSelector.filter((x:any)=> x.type=="pm_notification")
  //       .map((x:any)=>{
  //         console.log('');

  //       })
  //       const message=data.message;
  //       console.log(message,"Message");

  //       //  sendMessageInRoom(message, "chat");
  //       // setallAutoReplyMsg(data);
  //     }
  //       // console.log('resp auto reply', resp)
  //       // if (resp && resp.list && resp.list.length) {
  //       //   resp.list.push({
  //       //     id: 0,
  //       //     message: 'Select Message'
  //       //   })
  //       //   setWelcomeMsgList(resp.list.sort(sort_by('id', false, parseInt)))
  //       // }
  //       // toast.success(message)
  //     }, (message: string) => {
  //       toast.error(message)
  //     })
  //   }



  const sendMsg = async (msgType: string = "normal") => {
    if (chatTextRef.current != "") {
      // const message = `<span style="font-size: 13px;color: #162334;">${chatTextRef.current}</span>`;
      const message = chatTextRef.current;
      const actualLength = message
        .replace(/&nbsp;/g, " ")
        .replace(/<[^>]*>/g, "");
      if (actualLength?.length > 299) {
        toast.error("You have exceeded the maximum character limit!");
      } else {
        try {
          var Newparams = {
            entity_id: pm_id,
            room_type_id:0,
            channel_url:currentRoomURL
      
          };
          const message_id: any = await sendMessageInRoom(message, "chat",Newparams);
          if (message_id) {
            const params = {
              pm_id: pm_id,
              chat_body: message,
              type: msgType,
              message_id: message_id,
            };

            //reset content editable div
            pmWindowApi.callSendPmWindowChat(
              params,
              (message: string, resp: any) => {
                setChatText("");
                contentEditableFocus.current.focus();
              },
              (message: string) => {
                setChatText("");
                toast.error(message);
              }
            );
          }
        } catch (error) {
          toast.error("Failed to send message");
        }
      }
    } else {
      toast.error("Enter some text...");
    }
  };

  const chatOnKeyDown = (e: any) => {
    setIsSpellCheck(!isSpellCheck);
    if (enterMsgSend.current.value == "sendMsg") {
      if (e.keyCode == 13 && e.shiftKey == false) {
        e.preventDefault();
        sendMsg("normal");
        chatTextRef.current = "";
      }
    }
  };

  // const chatHandleChange = (evt: any) => {
  //   chatTextRef.current = evt.target.value;
  //   if (chatTextRef.current.length !== 0) {
  //     setDisableSendBtn(false);
  //   setIsSpellCheck(!isSpellCheck);
  //   debouncedEventHandler()
  //   } else {
  //     setDisableSendBtn(true);
  //   }
  // };

  const chatHandleChange = (evt: any) => {
    chatTextRef.current = evt.target.value;
    if (chatTextRef.current.length !== 0) {
      setDisableSendBtn(false);
      setChatText(evt.target.value);
      setIsSpellCheck(!isSpellCheck);
      debouncedEventHandler();
      channel && channel.startTyping();
    } else {
      setDisableSendBtn(true);
    }
  };
  const channelHandler = new GroupChannelHandler({
    onTypingStatusUpdated: (channel) => {
      const members = channel.getTypingUsers();
      Setmembers(members);
      // Refresh the typing status of members within the channel.
    },
  });
  sb.groupChannel.addGroupChannelHandler("typing", channelHandler);
  
  const DisplayTypingIndicator = (members: any) => {
    // console.log(members,"members");
    
    let typingIndicatorText = "";
    members.length === 1
      ? (typingIndicatorText = members[0]?.nickname + " is typing...")
      : members.length === 2
      ? (typingIndicatorText =
          members[0]?.nickname + ", " + members[1]?.nickname + " are typing...")
      : (typingIndicatorText =
          members[0]?.nickname +
          ", " +
          members[1]?.nickname +
          " and others are typing...");

    return <div className="typing-indicator">{typingIndicatorText}</div>;
  };

  const eventHandler = async () => {
    if (socketContainer && showPmTyping) {
      // socketContainer.emit("chatTyping", {
      //   userId: userSelector?.id,
      //   pmId: pm_id,
      //   userInfo: userSelector?.username,
      //   typing: true,
      // });
      // socketContainer.emit('HeartBeat', { id: 96, roomId: 17, userInfo: 'thomas', typing: true });
      // clearTimeout(timeout)
      debouncedChangeHandler.cancel();
      // timeout = setTimeout(typingTimeout, 1500)
      debouncedChangeHandler();
    }
  };

  const typingTimeout = () => {
    // if (socketContainer) {
    //   socketContainer.emit("chatTyping", {
    //     userId: userSelector?.id,
    //     pmId: pm_id,
    //     userInfo: userSelector?.username,
    //     typing: false,
    //   });
    //   // socketContainer.emit('HeartBeat', { id: 96, roomId: 17, userInfo: 'thomas', typing: true });
    // }
    const endtyping = channel?.endTyping();
  };

  const debouncedChangeHandler = useMemo(
    () => debounce(typingTimeout, 3600),
    [chatTextRef.current]
  );

  const debouncedEventHandler = useMemo(
    () => debounce(eventHandler, 1600),
    [chatTextRef.current]
  );

  const chatKeyPress = (e: any) => {
    setIsSpellCheck(!isSpellCheck);
    if (e.target.innerHTML?.length > 299) {
      toast.error("You have exceeded the maximum character limit!");
      e.preventDefault();
    }
  };

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
  };

  const handleTextDecoration = (e: any, type: string, size: any) => {
    e.preventDefault();
    document.execCommand(type, false, size);
  };

  const handleChangeFont = (val: any) => {
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
    setStickerEmojiOpen((prevState) => !prevState);
  };

  const closeEmojiBox = () => {
    setStickerEmojiOpen(false);
  };

  useOutsideClick(emojiStickerRef, closeEmojiBox, emojiStickerBtnRef);

  const onEmojiClick = (emojiObject: any) => {
    const previousValue = chatTextRef.current;
    chatTextRef.current =
      previousValue +
      "<img src='https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/" +
      emojiObject.unified +
      ".png' alt='emoji' style='height: 27px; width: 27px;'/>";
  };

  const onStickerClick = (stickerObject: any) => {
    const previousValue = chatTextRef.current;

    chatTextRef.current =
      previousValue +
      "<img src='https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/" +
      stickerObject.unified +
      ".png' alt='emoji' style='height: 27px; width: 27px;'/>";
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

  const pasteSticker = async (
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

    let sticker = `<img src=\"${imgUrl}\" height=\"${sHeight}\" width=\"${sWidth}\" alt="${
      title ? title : "sticker"
    }">`;
    const resp: any = await sendMessageInRoom(sticker, "chat", "sticker");
    if (resp) {
      var params = {
        pm_id: pm_id,
        chat_body: sticker,
        message_id: 0,
        type: "sticker",
      };
      // chatTextRef.current = ""; //reset content editable div
      pmWindowApi.callSendPmWindowChat(
        params,
        (message: string, resp: any) => {},
        (message: string) => {
          toast.error(message);
        }
      );
    }
  };

  const renderSlides = () =>
    stickerCategories.map((stgrp: any, index: any) =>
      stgrp.category_id ? (
        <a
          key={index}
          href="#"
          className={
            stgrp.category_id == selectedStickerCategory ? "active" : ""
          }
          onClick={(e) => getCategorywiseSticker(e, stgrp.category_id)}
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

    //     const newData:any =JSON.parse(localStorage.getItem('timeStamp') || '[]');
    //     // console.log(newData,"newdata");

    //    const value= newData?.find((x:any)=>{
    //  return  x.pm_id==pm_id
    //     })
    //     // console.log(value,"Value");

    //     setShowChatTimeStamp(value)
    // console.log(pmWindowDetailsSelector);

    // let SavedTimeStampArray: any = [];

    // // const pmid:any =parseInt(cryptr.decrypt(pmId))
    //   var timeStamp: any = {
    //     pm_id:pm_id,
    //     settings: {
    //       show_timestamp_pm: pmWindowDetailsSelector && pmWindowDetailsSelector?.pm_settings?.show_timestamp_pm == "1" ? true : false
    //     }
    //   }
    // // }
    // console.log(timeStamp,"log timestamp");
    // SavedTimeStampArray.push(timeStamp)
    // localStorage.setItem('timeStamp', JSON.stringify(SavedTimeStampArray))
    // setShowChatTimeStamp(JSON.parse(localStorage.getItem('timeStamp') || '[]'));
  }, [fromRoute, pm_id]);

  useEffect(() => {
    getTranslationChars();
    getUserCredits();
    // // const value: any = localStorage.getItem("language");
    const value: any = userSelector?.current_translation_language;
    setcheckedLanguage(value);
  }, []);

  useEffect(() => {
    clearCurrentRoomChatInfo();

    return () => {
      clearCurrentRoomChatInfo();
    };
  }, []);

  useEffect(() => {
    if (currentRoomURL) {
      (async () => {
        await populateCurrentRoomChat();
      })();
    }
  }, [currentRoomURL]);

  const getPmWindowDetails = () => {
    let params = {
      pm_id: pm_id,
    };
    pmWindowApi.callGetPmsDetails(
      params,
      async (message: string, resp: any) => {
        //Update Timestamp toogle Reducer data
        if (resp) {
          setPmUsers(resp.users);
          setPmWindowName(resp.users);
          const value = localStorage.getItem(LOGIN_STORAGE?.SIGNED_IN_AS);
          if (value) {
            const { id } = JSON.parse(value);
            const filteredUser = resp?.users?.find(
              (user: { user_id: any }) => user?.user_id === id
            );
            if (filteredUser?.is_admin) {
              setCheckAddUser(false);
            } else {
              setCheckAddUser(true);
            }
          }

          if (currentCallRoomId !== resp?.send_bird_video_call_room_id) {
            setCurrentCallRoomId(resp?.send_bird_video_call_room_id);
          }

          if (currentAudioCallRoomId !== resp?.send_bird_audio_call_room_id) {
            setCurrentAudioCallRoomId(resp?.send_bird_audio_call_room_id);
          }
          const adminPmUser = resp?.users?.find((user: any) => user.is_admin);
          if (adminPmUser) {
            setCurrentPmAdminUserId(adminPmUser?.user_id);
          } else {
            setCurrentPmAdminUserId("");
          }
          setCurrentRoomURL(resp?.send_bird_channel_url);
          setCurrentUsersInRoom(resp?.users);
        }

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
        if (resp && resp.sticker && resp.sticker.length > 0) {
          setCategorywiseSticker(resp.sticker);
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
        if (resp) {
          let categoriesAndPacks = [];
          if (resp.categories && resp.categories.length) {
            categoriesAndPacks.push(...resp.categories);
            if (resp.categories[0].id) {
              getCategorywiseSticker(null, resp.categories[0].id);
            }
          }
          if (resp.packDetails && resp.packDetails.length > 0) {
            let updatedPackResponse = resp.packDetails.map((ele: any) => {
              return ele.packs;
            });
            categoriesAndPacks.push(...updatedPackResponse);
          }
          setStickerCategories(categoriesAndPacks);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  //For set pm window name

  const getAllChatFromPmWindow = () => {
    const params = {
      pm_id: pm_id,
    };
    // pmWindowApi.callGetPmWindowChat(
    //   params,
    // (message: string, resp: any) => {
    //     if (resp && isAccepted) {
    //         debugger
    //         setTimeout(async () => {
    //           await callRoom?.enter({
    //             videoEnabled: true,
    //             audioEnabled: true,
    //             kickSiblings: true,
    //           });
    //           setOpenCall(true);
    //         }, 6000);
    //     }
    //     if (resp && resp.chatfile) {

    //     }
    //   },
    //   (message: string) => {
    //     // toast.error(message)
    //   }
    // );
  };

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
    }, 3000);
  }, [pmWindowDetailsSelector]);

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
            getChatTime(found[0].created_at) +
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
      } else {
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
      let chatTimestampFound = preferenceSelector.list.filter(
        (x: any) => x.key == "show_timestamp_pm"
      );
      if (chatTimestampFound && chatTimestampFound.length) {
        if (parseInt(chatTimestampFound[0].val) == 1) {
          // setShowChatTimeStamp(true);
        } else {
          // setShowChatTimeStamp(false);
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

      let translateCheckInPm = preferenceSelector.list.filter(
        (x: any) => x.key == "enable_real_time_translator_pm"
      );
      if (translateCheckInPm && translateCheckInPm.length) {
        if (parseInt(translateCheckInPm[0].val) == 1) {
          setIsTranslateCheckAvailable(true);
        } else {
          setIsTranslateCheckAvailable(false);
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

      let checkEnterKey = preferenceSelector.list.filter(
        (x: any) => x.key == "pressing_enter_key"
      );
      if (checkEnterKey && checkEnterKey.length) {
        if (parseInt(checkEnterKey[0].val) == 2) {
          setIsEnterKeySendMsg(false);
        } else {
          setIsEnterKeySendMsg(true);
        }
      }

      let checkAutoReply = preferenceSelector.list.filter(
        (x: any) => x.key == "enable_auto_reply"
      );
      if (checkAutoReply && checkAutoReply.length) {
        if (parseInt(checkAutoReply[0].val) == 1) {
          setautoReplyMessage(false);
        } else {
          setautoReplyMessage(true);
        }
      }
    }
  }, [preferenceSelector]);
  //Opentok related code

  const userImageShow = (membersId: any) => {
    let element = document.getElementById("img-" + membersId);
    if (element) {
      element.style.display = "block";
    }
  };

  useEffect(() => {
    if (!startVideoCall) {
      userImageShow(userSelector?.id);
    }
  }, [startVideoCall]);

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
          } else {
          }
        }
      }
    }
  }, [pmWindowDetailsSelector]);

  const startCallOnClick = async () => {
    setIsCalling(true);
    await handleJoinRoom();
    userAction.updateCallDetailsAction({
      call_inside: "PM",
      element_id: pm_id,
    });
  };

  const handleEndAudioStream = () => {
    if (startAudioCall) {
      stopBothVideoAndAudio();
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
        (message: string) => {}
      );

      userAction.updateCallDetailsAction(null);

      toast.success("You have ended call session");
    }
  };

  const handleEndCamStream = () => {
    if (startVideoCall) {
      stopBothVideoAndAudio();
      setStartVideoCall(false);
      setRoomJoined(null);
      const params = {
        pm_id: pm_id,
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
        (message: string) => {}
      );

      userAction.updateCallDetailsAction(null);

      toast.success("You have ended video session");
    }
  };

  const [showCallOngoingAlert, setShowCallOngoingAlert] = useState<any>(null);

  const handleCloseOthersRoomPmUsersWindow = () => {
    if (userCallDetails && userCallDetails.element_id == pm_id) {
      setShowCallOngoingAlert(
        <CustomSweetAlert
          type="warning"
          showCancel
          confirmBtnText="End Call"
          cancelBtnText="Cancel"
          cancelBtnBsStyle="danger"
          confirmBtnBsStyle="success"
          allowEscape={false}
          closeOnClickOutside={false}
          title={`In a ${callType == "video" ? "video" : ""} call session`}
          onConfirmFunc={() => {
            callType == "video" ? handleEndCamStream() : handleEndAudioStream();
            pmWindowAction.pmCallAccepted(null);
            setShowCallOngoingAlert(null);
          }}
          onCancelFunc={() => {
            setShowCallOngoingAlert(null);
            return;
          }}
          focusCancelBtn={true}
          innerText={`By closing this PM window, you will abort the ${
            callType == "video" ? "video" : "call"
          } session. Are you sure you want to proceed?`}
        />
      );
    } else {
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
    }
  };

  const handleSpellCheck = () => {
    setIsSpellCheck(!isSpellCheck);
  };

  const [mediaDevicesError, setMediaDevicesError] = useState<any>(null);

  useEffect(() => {
    if (startingCallOnClick && pmWindowDetailsSelector) {
      handleStartCallOnClick(null, startingCallOnClick.type);
    }
  }, [startingCallOnClick, pmWindowDetailsSelector]);

  const handleStartCallOnClick = async (e: any, type: string) => {
    if (e) {
      e.preventDefault();
    }

    if (!userCallDetails) {
      if (type == "video") {
        let isWebCamAttached = await detectWebcam();

        if (!isWebCamAttached) {
          setMediaDevicesError(
            <CustomSweetAlert
              type="warning"
              showCancel={false}
              confirmBtnText="Ok"
              cancelBtnBsStyle="danger"
              confirmBtnBsStyle="warning"
              allowEscape={false}
              closeOnClickOutside={false}
              title="No Video device detected! Please, do the following"
              onConfirmFunc={() => {
                setMediaDevicesError(null);
              }}
              focusCancelBtn={true}
              innerText={
                <>
                  <p>a. Check your webcam is connected to your device.</p>
                  <p>
                    b. Check if you have proper driver installed for your webcam
                  </p>
                  <p>c. Check if your webcam is powered.</p>
                  <p>
                    d. Check if your webcam is not used by other browser or
                    application.
                  </p>
                </>
              }
            />
          );
          return;
        }
      }

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
                  b. Check if you have proper driver installed for your
                  microphone
                </p>
                <p>c. Check if your microphone is powered.</p>
                <p>
                  d. Check if your microphone is not used by other browser or
                  application.
                </p>
              </>
            }
          />
        );
        return;
      }
      setCallType(type);
      startCallOnClick();
    } else {
      setShowCallOngoingAlert(
        <CustomSweetAlert
          type="warning"
          showCancel={false}
          confirmBtnText="Ok"
          cancelBtnText="Cancel"
          cancelBtnBsStyle="danger"
          confirmBtnBsStyle="success"
          allowEscape={false}
          closeOnClickOutside={false}
          title={`Already on a call`}
          onConfirmFunc={() => {
            setShowCallOngoingAlert(null);
            return;
          }}
          onCancelFunc={() => {
            return;
          }}
          focusCancelBtn={true}
          innerText={`You are already on call. Close the current call first and then try again to start a new one.`}
        />
      );
    }
    pmWindowAction.startCallOnClickAction(null);
  };

  useEffect(() => {
    if (
      pmWindowDetailsSelector &&
      pmWindowDetailsSelector.is_initiated_by == 0 &&
      userCallDetails
    ) {
      callType == "video" ? handleEndCamStream() : handleEndAudioStream();
    }
  }, [pmWindowDetailsSelector]);

  useEffect(() => {
    if (!currentRoomURL) return;
    let collection: any;
    (async () => {
      const room = (await joinARoom(currentRoomURL, "chat")) as GroupChannel;
      setChannel(room);
      const filter = new MessageFilter();
      const limit = 300;
      const startingPoint = Date.now();
      if (room) {
        collection = room?.createMessageCollection({
          filter,
          limit,
          startingPoint,
        });
        collection?.setMessageCollectionHandler({
          onChannelUpdated: async () => {
            await populateCurrentRoomChat();
          },
        });
      }
    })();

    return () => {
      if (collection) {
        collection.dispose();
      }
    };
  }, [currentRoomURL]);

  function formatDate(numberTime: number) {
    const date = new Date(numberTime);
    const options: any = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);

    const day = date.getDate();
    const suffix = getDaySuffix(day);

    const hours = date.getHours();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedTime = hours > 12 ? hours - 12 : hours;
    return `${day}${suffix} ${formattedDate.split(" ")[0]}, ${
      formattedDate.split(", ")[1].split(" at")[0]
    } ${formattedTime}:${("0" + date.getMinutes()).slice(-2)} ${ampm}`;
  }

  function getDaySuffix(day: any) {
    if (day >= 11 && day <= 13) {
      return "th";
    }
    const lastDigit = day % 10;
    switch (lastDigit) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  useEffect(() => {
    // try {
    //   endCall()
    // } catch (error) {}
    // try {
    //   endAudioCall()
    // } catch (error) {}
    return () => {
      try {
        endCall();
      } catch (error) {}
      try {
        endAudioCall();
      } catch (error) {}
    };
  }, []);

  // let removeButtonDisabledCondition: boolean =
  //   currentRoomMembers?.length <= 2 ||
  //   +currentPmAdminUserId !== +signedInUserId;
  // let addButtonDisabledCondition: boolean =
  //   currentRoomMembers?.length >= 3 ||
  //   +currentPmAdminUserId !== +signedInUserId;

  //For Open Youtube Video Url
  // const openYoutubeVideoPmModal = () => {
  //   setViewYoutubeVideoPmModal(true);
  // };
  // const closeViewYoutubeVideoPmModal = () => {
  //   if (viewYoutubeVideoPmModal) setViewYoutubeVideoPmModal(false);
  // };

  const handleOpenYoutubeVideoPmModal = (url: any) => {
    setVideoUrl(url);
    setShowShareYoutbeVideoModal(false);
  };
  const handleAcceptInvite = () => {
    socket.emit("Invite", {
      type: "accepted",
      payload: {
        pm_id: pm_id,
        accepted: true,
        byUser: { id: userSelector?.id, name: userSelector?.username },
        toUser: invitationSender,
      },
    });
    setShowYoutubeAlert(false);
    setVideoInviteAccept(true);
    localStorage.setItem("videoInvitationAccept", "true");
  };
  const deductUserCredit = async (data: any) => {
    var params = {
      redeem_credits: data,
    };
    commonApi.callDeductUserCredits(
      params,
      (message: string, resp: any) => {
        toast.success(message);
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const purchaseTranslation = async () => {
    var params = {};
    commonApi.CallPurchaseTranslationChars(
      params,
      (message: string, resp: any) => {
        if (resp) {
          toast.success(message);
          getTranslationChars();
          setShowTranslationModal(true);
        }
      },
      (message: string) => {
        localStorage.setItem("translationAlert", "true");
        setShowTranslationAlert(false);
      }
    );
  };

  const redeemTranslation = async (data: any) => {
    var params = {
      redeem_chars: data,
    };
    commonApi.callRedeemTranslationChars(
      params,
      (message: string, resp: any) => {
        // toast.success(message);
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };
  const getSelectedLanguage = (lang: any) => {
    setcheckedLanguage(lang);
  };
  const getTranslationChars = () => {
    let params = {};
    commonApi.CallGetTranslationChars(
      params,
      (message: string, resp: any) => {
        if (resp) {
          setTranslationCharCount(resp.user_translation_chars);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const getUserCredits = async () => {
    let params = {};
    commonApi.callGetUserCredits(
      params,
      async (message: string, resp: any) => {
        if (resp) {
          setUserCredits(resp.user_credits);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };
  const saveTranslations = (message_id: any, translations: any) => {
    const params = {
      pm_id: pm_id,
      message_id: message_id,
      translations: translations,
    };
    groupCategoryApi.callSaveTranslations(
      params,
      (message: any, resp: any) => {
        console.log(message);
      },
      (message: any) => {
        toast.error(message);
      }
    );
  };

  const translate = async (chat: any) => {
    const messageLength = chat.message.length;
    if (translationcharCount < messageLength) {
      setShowTranslationAlert(true);
    } else {
      let params = {};
      commonApi.callGetUserCredits(
        params,
        async (message: string, resp: any) => {
          if (resp) {
            const credits = resp.user_credits;
            const getLang = !checkedLanguage
              ? userSelector?.current_translation_language
              : checkedLanguage;
            if (getLang) {
              if (chat.translations.hasOwnProperty(getLang)) {
                setcheckedLanguage(getLang);
                setMessage(chat);
                const translations = [
                  {
                    lang_code: getLang,
                    message: chat?.translations[getLang],
                  },
                ];
                await saveTranslations(chat?.messageId, translations);
              } else {
                try {
                  if (translationcharCount < 1000) {
                    setshowReminderAlert(true);
                  }
                  const message: any = await checkTranslate(chat, getLang);
                  if (message) {
                    setcheckedLanguage(getLang);
                    setMessage(message);
                    await populateCurrentRoomChat();
                    await redeemTranslation(messageLength);
                    const translations = [
                      {
                        lang_code: getLang,
                        message: message?.translations[getLang],
                      },
                    ];
                    await saveTranslations(message?.messageId, translations);
                  }
                } catch (error) {
                  console.error("Error translating message:", error);
                }
              }
            } else {
              toast.error("Please Selcet Language ");
              setShowTranslationModal(true);
            }
          }
        },
        (message: string) => {
          toast.error(message);
        }
      );
    }
  };

  // Handle DND Mode
  const handleDndModeChange = useCallback(() => {
    const newDndModeStatus = !isDndModeActive;

    const params = {
      visible_status: newDndModeStatus ? 3 : 1,
    };

    userApi.callUpdateUserVisibilityStatus(
      params,
      (message: string, resp: any) => {
        if (resp) {
          if (newDndModeStatus) {
            toast.success("DND Mode enabled");
          } else {
            toast.success("DND Mode disabled");
          }
          setIsDndModeActive(newDndModeStatus);
        } else {
          toast.error(message);
        }
      },
      (message: string, resp: any) => {
        toast.error(message);
      }
    );
  }, [isDndModeActive, userApi]);

  useEffect(() => {
    if (invitationRec && showAlert && !(openCall || openAudioCall)) {
      if (userSelector) {
        const { alerts_and_sounds } = userSelector || {};
        const {
          receive_call_alert,
          disable_sounds,
          always_play_sound,
          customize_sound_incoming_call,
          customize_sound_incoming_call_file_id,
          customized_sounds,
          not_play_sound_on_call_pm,
          not_play_sound_on_mic_chat_room,
        } = alerts_and_sounds || {};
        if (disable_sounds == 1) {
          return;
        }
        if ((openCall || openAudioCall) && not_play_sound_on_call_pm == 1) {
          return;
        }
        if (microphoneState && not_play_sound_on_mic_chat_room == 1) {
          return;
        }

        if (always_play_sound == 1 && receive_call_alert == 1) {
          let sound = null;
          if (customize_sound_incoming_call == 0) {
            const audio = customized_sounds?.find(
              (x: any) => x?.user_id == 0 && x?.is_default == 1
            );
            sound = new Audio(audio?.sound?.original);
          } else if (customize_sound_incoming_call == 1) {
            const audio = customized_sounds?.find(
              (x: any) => customize_sound_incoming_call_file_id == x?.id
            );
            sound = new Audio(audio?.sound?.original);
          }

          if (sound) {
            sound.play().catch((error) => {
              console.error("Error playing sound:", error);
            });
          }
        }
      }
    }
  }, [
    invitationRec,
    showAlert,
    openCall,
    openAudioCall,
    userSelector,
    microphoneState,
  ]);
  // useEffect(() => {
  //   if (filteredRoomChat && filteredRoomChat.length) {
  //     filteredRoomChat.forEach((chat: any) => {
  //       if (chat?.customType === "auto_reply" && parseInt(chat?.sender?.userId) === userSelector?.id) {
  //         setautoReplyMessage(false);
  //         return null;
  //       }
  //     });
  //   }
  // }, [filteredRoomChat, userSelector, setautoReplyMessage]);
  // Function to convert a specific HTML element to a PDF

  // function convertToPDF() {
  //   // Select the element you want to convert to canvas
  //   var element = document.getElementById('canvas');

  //   html2canvas(element, {scrollY: -window.scrollY}).then(function(canvas) {
  //       var imgData = canvas.toDataURL('image/png');

  //       var doc = new jsPDF('p', 'mm');

  //       doc.addImage(imgData, 'PNG', 10, 10);

  //       doc.save('sample-file.pdf');
  //   });
  // }

  // test pdf

  // async function convertToPDF() {
  //   const element = document.getElementById('chat-window-scroll-btm');
  //   // Ensure the element is fully scrolled to the top
  //   element.scrollTop = 0;
  //   // const captureWidth = 1500;  // Set your desired width
  //   // const captureHeight = 2000;
  //   // Use html2canvas to capture the entire element
  //   const canvas = await html2canvas(element, {
  //     useCORS: true,
  //     logging: true,
  //     scrollX: 0,
  //     scrollY: 0,

  //     windowWidth: element.scrollWidth,
  //     windowHeight: element.scrollHeight,
  //     onclone: (clonedDoc) => {
  //       // Make sure the cloned document's scroll position is at the top
  //       clonedDoc.getElementById('chat-window-scroll-btm').scrollTop = 0;
  //     }
  //   });

  //   const imgData = canvas.toDataURL('image/png');
  //   console.log(imgData,"imgdata");

  //   // const { jsPDF } = window.jspdf;
  //   const doc = new jsPDF('p', 'mm', 'a4');

  //   const imgProps = doc.getImageProperties(imgData);
  //   console.log(imgProps,"imageprops");

  //   const pdfWidth = doc.internal.pageSize.getWidth();
  //   console.log(pdfWidth,"pdfwidth");

  //   const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  //   console.log(pdfHeight,"pdfHeight");

  //   let heightLeft = pdfHeight;
  //   let position = 0;

  //   var spacing = 10;
  //   var x = spacing; // Left spacing
  // var y = position + spacing; // Top spacing, assuming position is the top y-coordinate already
  // var width = pdfWidth - 2 * spacing; // Adjusted width considering left and right spacing
  // var height = pdfHeight - 2 * spacing;
  //   doc.addImage(imgData, 'PNG',x,y,width, height);
  //   heightLeft -= doc.internal.pageSize.getHeight();

  //   while (heightLeft >= 0) {
  //     position = heightLeft - pdfHeight;
  //     doc.addPage();
  //     doc.addImage(imgData, 'PNG', x,y, width, height);
  //     heightLeft -= doc.internal.pageSize.getHeight();
  //   }

  //   doc.save('sample-file.pdf');
  // }

  // async function convertToPDF() {
  //   const element = document.getElementById('chat-window-scroll-btm');
  //   const doc = new jsPDF('p', 'mm', 'a4');
  //   const pdfWidth = doc.internal.pageSize.getWidth() ; // Account for spacing
  //   const pdfHeight = doc.internal.pageSize.getHeight()  // Account for spacing

  //   const canvasHeight = element.clientHeight;
  //   const totalHeight = element.scrollHeight;
  //   let currentPosition = 0;

  //   while (currentPosition < totalHeight) {
  //     // Scroll to the current position
  //     element.scrollTop = currentPosition;

  //     // Wait a bit for the element to scroll
  //     await new Promise((resolve) => setTimeout(resolve, 500));

  //     // Capture the visible part of the element
  //     const canvas = await html2canvas(element, {
  //       useCORS: true,
  //       scrollX: 0,
  //       scrollY: currentPosition,
  //       windowWidth: element.scrollWidth,
  //       windowHeight: canvasHeight,
  //     });

  //     const imgData = canvas.toDataURL('image/png');

  //     // Add the captured image to the PDF
  //     const imgProps = doc.getImageProperties(imgData);
  //     const imgWidth = imgProps.width;
  //     const imgHeight = imgProps.height;
  //     const heightRatio = pdfHeight / imgHeight;
  //     const pdfImgHeight = imgHeight * heightRatio;
  //     const pdfImgWidth = imgWidth * heightRatio;

  //     if (currentPosition > 0) {
  //       doc.addPage();
  //     }
  //     var spacing = 10;
  //   let position = 0;

  //       var x = spacing; // Left spacing
  //     var y = position + spacing; // Top spacing, assuming position is the top y-coordinate already
  //     var width = pdfWidth - 2 * spacing; // Adjusted width considering left and right spacing
  //     var height = pdfHeight - 2 * spacing;
  //     doc.addImage(imgData, 'PNG', x, y, width, height);

  //     // Move to the next position
  //     currentPosition += canvasHeight;
  //   }

  //   // Save the PDF
  //   doc.save('sample-file.pdf');
  // }

  return (
    <React.Fragment>
      {/* {openCall && <GroupCall />} */}
      {rejectedAlert}
      {invitationRec && showAlert && !(openCall || openAudioCall) ? (
        <CustomSweetAlert
          type="warning"
          showCancel
          confirmBtnText="Accept"
          cancelBtnText="Reject"
          cancelBtnBsStyle="danger"
          confirmBtnBsStyle="success"
          allowEscape={false}
          closeOnClickOutside={false}
          title="Ringing"
          onConfirmFunc={async () => {
            try {
              if (invitationRec?.room?.roomType === "small_room_for_video") {
                await invitationRec.accept();
                await callRoom?.enter({
                  videoEnabled: true,
                  audioEnabled: true,
                });
                setOpenCall(true);
                setShowAlert(false);
              } else {
                await invitationRec.accept();
                await audioCallRoom?.enter({
                  videoEnabled: false,
                  audioEnabled: true,
                  kickSiblings: true,
                });
                setOpenAudioCall(true);
                setShowAlert(false);
              }
            } catch (e) {
              // handle error.
            }
          }}
          onCancelFunc={async () => {
            // Decline an invitation.
            try {
              await invitationRec?.decline();

              setShowAlert(false);
            } catch (e) {
              // handle error.
            }
          }}
          focusCancelBtn={true}
          innerText={`${
            invitationRec?.inviter?.nickname
          } is inviting you to start a private ${
            invitationRec?.room?.roomType === "small_room_for_video"
              ? "video"
              : "audio"
          } video session. Do you want to
              Accept the invitation?`}
        />
      ) : null}
      {showYoutubeAlert ? (
        <CustomSweetAlert
          type="warning"
          showCancel
          confirmBtnText="Accept"
          cancelBtnText="Reject"
          cancelBtnBsStyle="danger"
          confirmBtnBsStyle="success"
          allowEscape={false}
          closeOnClickOutside={false}
          title="Invitation"
          onConfirmFunc={handleAcceptInvite}
          onCancelFunc={async () => {
            socket.emit("Invite", {
              type: "rejected",
              payload: {
                pm_id: pm_id,
                accepted: false,
                byUser: { id: userSelector?.id, name: userSelector?.username },
                toUser: invitationSender,
              },
            });
            setShowYoutubeAlert(false);
            setVideoUrl("");
            setDisabledYouTtubeButton(false);
            localStorage.removeItem("videoInvitationAccept");
          }}
          focusCancelBtn={true}
          innerText={`${invitationSender?.name} is inviting you to join for YouTube Video`}
        />
      ) : (
        false
      )}
      {showTranslationAlert ? (
        <CustomSweetAlert
          type="warning"
          showCancel
          confirmBtnText="Accept"
          cancelBtnText="Reject"
          cancelBtnBsStyle="danger"
          confirmBtnBsStyle="success"
          allowEscape={false}
          closeOnClickOutside={false}
          title={`Translation Service Confirmation`}
          onConfirmFunc={() => {
            purchaseTranslation();
            setShowTranslationAlert(false);
            getTranslationChars();
          }}
          onCancelFunc={() => {
            setShowTranslationAlert(false);
            return;
          }}
          focusCancelBtn={true}
          innerText={
            <p>
              Please be informed that the utilization of the translation service
              will result in charges deducted from your available credits.
            </p>
          }
        />
      ) : (
        false
      )}
      {showCreditAlert ? (
        <CustomSweetAlert
          type="warning"
          showCancel
          confirmBtnText="Accept"
          cancelBtnText="Reject"
          cancelBtnBsStyle="danger"
          confirmBtnBsStyle="success"
          allowEscape={false}
          closeOnClickOutside={false}
          title={`Credit Purchase Confirmation`}
          onConfirmFunc={() => {
            setShowBuyVirtualGift(true);
            setShowcreditalert(false);
            // localStorage.setItem("translationAlert", "true")
            // setShowTranslationModal(true)
          }}
          onCancelFunc={() => {
            setShowcreditalert(false);
            return;
          }}
          focusCancelBtn={true}
          innerText={
            <p>
              To utilize the translation Service, please ensure you have
              sufficient credits. Kindly purchase additional credits to access
              this service.
            </p>
          }
        />
      ) : (
        false
      )}
      {showReminderAlert ? (
        <CustomSweetAlert
          type="warning"
          // showCancel
          confirmBtnText="ok"
          // cancelBtnText="Reject"
          // cancelBtnBsStyle="danger"
          confirmBtnBsStyle="success"
          allowEscape={false}
          closeOnClickOutside={false}
          title={`Reminder For Characters `}
          onConfirmFunc={() => {
            setshowReminderAlert(false);
            // localStorage.setItem("translationAlert", "true")
            setShowTranslationAlert(true);
          }}
          onCancelFunc={() => {
            setshowReminderAlert(false);
            return;
          }}
          focusCancelBtn={true}
          innerText={
            <p>
              Hello, you are approaching the limit of characters in your
              account. To avoid any service interruption, consider purchasing
              more characters. Thank you!.
            </p>
          }
        />
      ) : (
        false
      )}
      <div className="container-fluid">
        <div className="row justify-content-start">
          <div className="col-sm-12">
            <div className="page-heading-panel d-flex justify-content-between mb-2">
              <h1>
                {typeof pmWindowName === "object" && pmWindowName.length
                  ? pmWindowName.map((x: any, index: number) =>
                      x.user_info.customize_nickname &&
                      x.user_info.customize_nickname.nickname ? (
                        <span
                          key={index}
                          style={{
                            color: getSubscriptionColor(x.user_info),
                          }}
                        >
                          {x.user_info.customize_nickname.nickname}
                          {index < pmWindowName.length - 1 && ","}{" "}
                        </span>
                      ) : (
                        <span
                          key={index}
                          style={{
                            color: getSubscriptionColor(x.user_info),
                          }}
                        >
                          {x.user_info.username}
                          {index < pmWindowName.length - 1 && ","}{" "}
                        </span>
                      )
                    )
                  : null}
              </h1>
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
                currentRoomMembers={currentRoomMembers}
                roomName={roomName}
                getPmWindowDetails={getPmWindowDetails}
                currentUsersInRoom={currentUsersInRoom}
                pmUsers={pmUsers}
              />
            }

            {/* Other pm users End */}

            <div className="room-chat-window-wrap dark-box-inner">
              <div className="row">
                <div className="col-md-9">
                  {/* <video
                    ref={videoRef}
                    id="video"
                    autoPlay
                    playsInline
                    muted
                  ></video>
                  {inviteForUsers &&
                    inviteForUsers.length &&
                    inviteForUsers.find(
                      (ele: any) => ele?.id === userSelector?.id
                    ) && (
                      <video
                        ref={remoteVideo}
                        id="remote-Video"
                        autoPlay
                        playsInline
                        muted
                      ></video>
                    )} */}

                  {(videoUrl &&
                    invitationSender?.id == userSelector?.id &&
                    !videoInviteAccept) ||
                  (videoUrl &&
                    invitationSender?.id != userSelector?.id &&
                    videoInviteAccept) ? (
                    <div className="row">
                      <div className="col-md-6">
                        <div
                          className="room-chat-window separated-window"
                          id="chat-window-scroll-btm"
                          ref={messageListElementRef}
                          style={{ maxWidth: "100%" }}
                        >
                          {filteredRoomChat && filteredRoomChat.length
                            ? filteredRoomChat.map(
                                (chat: any, index: number) => {
                                  const timeStamp = formatDate(chat?.createdAt);
                                  const userColor = getSubscriptionColorInRoom(
                                    chat.sender?.userId,
                                    currentUsersInRoom
                                  );
                                  // Check if the message is an auto-reply and if the sender's userId matches the logged-in user
                                  // if (chat?.customType === "auto_reply" && parseInt(chat?.sender?.userId) === userSelector?.id) {
                                  //   setautoReplyMessage(false);
                                  //  return null; // Skip rendering this message
                                  // };
                                  return (
                                    <>
                                      {chat?.customType ===
                                      "SENDBIRD:AUTO_EVENT_MESSAGE" ? (
                                        <div
                                          className="online_offline_pm_notification"
                                          style={{ textAlign: "center" }}
                                        >
                                          <p>{chat?.message}</p>
                                        </div>
                                      ) : chat?.customType === "sticker" ? (
                                        <div
                                          key={index}
                                          className="chat-single-message"
                                        >
                                          <div className="image">
                                            {chat?.sender &&
                                            chat?.sender?.plainProfileUrl &&
                                            isProfileCheck ? (
                                              <img
                                                src={
                                                  chat.sender?.plainProfileUrl
                                                }
                                              />
                                            ) : (
                                              getNameInitials(
                                                chat.sender?.nickname
                                              )
                                            )}
                                          </div>
                                          <div className="text">
                                            <p
                                              className="name"
                                              style={{ color: userColor }}
                                            >
                                              {chat?.sender?.nickname}
                                              <span className="date">
                                                {showChatTimestamp &&
                                                showChatTimestamp[0]?.settings
                                                  ?.show_timestamp_pm == true
                                                  ? timeStamp
                                                  : ""}
                                              </span>
                                            </p>
                                            <p
                                              className="message sticker"
                                              dangerouslySetInnerHTML={{
                                                __html: chat.message.length
                                                  ? chat.message
                                                  : " ",
                                              }}
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <div
                                          key={index}
                                          className="chat-single-message"
                                        >
                                          <div className="image">
                                            {chat?.sender &&
                                            chat?.sender?.plainProfileUrl &&
                                            isProfileCheck ? (
                                              <img
                                                src={
                                                  chat.sender?.plainProfileUrl
                                                }
                                              />
                                            ) : (
                                              getNameInitials(
                                                chat.sender?.nickname
                                              )
                                            )}
                                          </div>
                                          <div className="text">
                                            <p
                                              className="name"
                                              style={{ color: userColor }}
                                            >
                                              {chat?.sender?.nickname}
                                              <span className="date">
                                                {showChatTimestamp &&
                                                showChatTimestamp[0]?.settings
                                                  ?.show_timestamp_pm == true
                                                  ? timeStamp
                                                  : ""}
                                              </span>
                                            </p>
                                            <p
                                              className="message"
                                              dangerouslySetInnerHTML={{
                                                __html: chat.message.length
                                                  ? chat.message
                                                  : " ",
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  );
                                }
                              )
                            : null}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <span
                          className="close"
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "15px",
                            cursor: "pointer",
                            zIndex: "9999",
                            color: "white",
                          }}
                          onClick={() => {
                            //   if (invitationSender?.id == userSelector?.id) {
                            //     socket.emit("Invite", {
                            //       type: "close",
                            //       payload: {
                            //         pm_id: pm_id,
                            //         closeModal: true,
                            //       },
                            //     });
                            //   }
                            //   setVideoUrl("");
                            //   setDisabledYouTtubeButton(false);
                            socket.emit("Invite", {
                              type: "close",
                              payload: {
                                pm_id: pm_id,
                                closeModal: true,
                                closeBy: {
                                  id: userSelector?.id,
                                  name: userSelector?.username,
                                },
                                closeSender:
                                  invitationSender?.id == userSelector?.id
                                    ? 1
                                    : 0,
                              },
                            });

                            setVideoUrl("");
                            setDisabledYouTtubeButton(false);
                          }}
                        >
                          <FaTimes />
                        </span>
                        <ReactPlayer
                          url={videoUrl}
                          width={"100%"}
                          height={"100%"}
                          playing={isPlayVideo}
                          pip={true}
                          controls={false}
                          loop={true}
                          stopOnUnmount={false}
                          onPlay={() => {
                            if (invitationSender?.id != userSelector?.id) {
                              return false;
                            }

                            socket.emit("Invite", {
                              type: "start",
                              payload: {
                                pm_id: pm_id,
                                play: true,
                                byUser: invitationSender,
                              },
                            });
                          }}
                          onPause={() => {
                            if (invitationSender?.id != userSelector?.id) {
                              return false;
                            }
                            socket.emit("Invite", {
                              type: "stop",
                              payload: {
                                pm_id: pm_id,
                                play: false,
                                byUser: invitationSender,
                              },
                            });
                          }}
                          style={{
                            pointerEvents: reactPlayeStyle,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="row" id="canvas">
                      <div className="col-md-12">
                        <div
                          className="room-chat-window separated-window"
                          id="chat-window-scroll-btm"
                          ref={messageListElementRef}
                          style={{ maxWidth: "100%" }}
                        >
                          {filteredRoomChat && filteredRoomChat.length
                            ? filteredRoomChat.map(
                                (chat: any, index: number) => {
                                  const timeStamp = formatDate(chat?.createdAt);
                                  const userColor = getSubscriptionColorInRoom(
                                    chat.sender?.userId,
                                    currentUsersInRoom
                                  );
                                  return (
                                    <>
                                      {chat?.customType ===
                                      "SENDBIRD:AUTO_EVENT_MESSAGE" ? (
                                        <div
                                          className="online_offline_pm_notification"
                                          style={{ textAlign: "center" }}
                                        >
                                          <p>{chat?.message}</p>
                                        </div>
                                      ) : chat?.customType === "sticker" ? (
                                        <div
                                          key={index}
                                          className="chat-single-message"
                                        >
                                          <div className="image">
                                            {chat?.sender &&
                                            chat?.sender?.plainProfileUrl &&
                                            isProfileCheck ? (
                                              <img
                                                src={
                                                  chat.sender?.plainProfileUrl
                                                }
                                              />
                                            ) : (
                                              getNameInitials(
                                                chat.sender?.nickname
                                              )
                                            )}
                                          </div>
                                          <div className="text">
                                            <p
                                              className="name"
                                              style={{ color: userColor }}
                                            >
                                              {chat?.sender?.nickname}
                                              <span className="date">
                                                {showChatTimestamp &&
                                                showChatTimestamp[0]?.settings
                                                  ?.show_timestamp_pm == true
                                                  ? timeStamp
                                                  : ""}{" "}
                                              </span>
                                            </p>
                                            <p
                                              className="message sticker"
                                              dangerouslySetInnerHTML={{
                                                __html: chat.message.length
                                                  ? chat.message
                                                  : " ",
                                              }}
                                            />
                                          </div>
                                        </div>
                                      ) : chat?.customType == "auto_reply" &&
                                        chat?.sender?.userId ==
                                          userSelector?.id ? (
                                        <></>
                                      ) : (
                                        <div
                                          key={index}
                                          className="chat-single-message"
                                        >
                                          <div className="image">
                                            {chat?.sender &&
                                            chat?.sender?.plainProfileUrl &&
                                            isProfileCheck ? (
                                              <img
                                                src={
                                                  chat.sender?.plainProfileUrl
                                                }
                                              />
                                            ) : (
                                              getNameInitials(
                                                chat.sender?.nickname
                                              )
                                            )}
                                          </div>
                                          <div className="text">
                                            <p
                                              className="name"
                                              style={{ color: userColor }}
                                            >
                                              {chat?.sender?.nickname}
                                              <span className="date">
                                                {showChatTimestamp &&
                                                showChatTimestamp[0]?.settings
                                                  ?.show_timestamp_pm == true
                                                  ? timeStamp
                                                  : ""}
                                              </span>
                                            </p>
                                            <p
                                              className="message"
                                              dangerouslySetInnerHTML={{
                                                __html:
                                                  (chat.message.length
                                                    ? chat.message
                                                    : "") +
                                                  (chat.message.length &&
                                                  chat.translations.hasOwnProperty(
                                                    checkedLanguage
                                                  )
                                                    ? "<hr>" +
                                                      chat.translations[
                                                        checkedLanguage
                                                      ]
                                                    : messageIn &&
                                                      messageIn.messageId ==
                                                        chat.messageId &&
                                                      messageIn.translations[
                                                        checkedLanguage
                                                      ]
                                                    ? "<hr>" +
                                                      messageIn.translations[
                                                        checkedLanguage
                                                      ]
                                                    : ""),
                                              }}
                                            />
                                            {/* <p
                                            className="message"
                                            dangerouslySetInnerHTML={{
                                              __html: chat.message.length
                                                ? chat.message
                                                : " ",
                                            }}
                                          /> */}
                                            {/* <hr></hr> */}
                                            {/* <p
                                            className="message"
                                            dangerouslySetInnerHTML={{
                                              __html: messageIn && messageIn[language]
                                                ? messageIn[language]
                                                : "test",
                                            }}
                                          /> */}

                                            {/* <button className="btn btn-dark  translation-btn" > */}
                                            <a
                                              onClick={() => translate(chat)}
                                              className="translation-btn"
                                            >
                                              {/* <img src="/img/translate-icon.png" alt="" width={10} /> */}
                                              <span>
                                                {isTranslateAvailable
                                                  ? chat.translations.hasOwnProperty(
                                                      checkedLanguage
                                                    )
                                                    ? ""
                                                    : "Translate"
                                                  : ""}
                                              </span>
                                            </a>
                                            {/* </button> */}
                                          </div>
                                        </div>
                                        // </div>
                                      )}
                                    </>
                                  );
                                }
                              )
                            : null}
                          {/* {showPmChatTyping?.id && showPmTyping ? (
                            <div className="typing-message">
                              <span>{typingStringGenerate(typing)}</span>
                              {showPmChatTyping
                                ? `${showPmChatTyping?.name} is typing...`
                                : null}
                            </div>
                          ) : null} */}

                          {/* {showPmTyping   ? (
                          <div className="typing-message">
                            <span>{typingStringGenerate(typing)}</span>
                            { typing?.length ? " is typing..." : null}
                          </div>
                         ) : null}  */}

                          {/* {members.length > 0 &&
                            DisplayTypingIndicator(members)} */}
                          <div>
                            {typingmembers?.length > 0 &&
                              DisplayTypingIndicator(typingmembers)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="row">
                    <div
                      className="compose-box separated-compose-box"
                      style={{ maxWidth: "100%" }}
                    >
                      <div className="top-btn-set-wrap">
                        <div className="top-left-btns">
                          <button
                            type="button"
                            onClick={openAddUserModal}
                            disabled={
                              (pmWindowDetailsSelector &&
                                pmWindowDetailsSelector.users &&
                                pmWindowDetailsSelector.users.length >= 3) ||
                              !isAdminOrNot
                            }
                          >
                            <img src="/img/add-user-icon.png" alt="" />
                            Add User
                          </button>
                          <button
                            type="button"
                            onClick={openShareYoutubeVideoModal}
                            disabled={disabledYouTtubeButton}
                          >
                            <img src="/img/youtube-share-icon.png" alt="" />
                            YouTube
                          </button>

                          <button
                            type="button"
                            onClick={openRemoveUserModal}
                            disabled={
                              (pmWindowDetailsSelector &&
                                pmWindowDetailsSelector.users &&
                                pmWindowDetailsSelector.users.length <= 2) ||
                              !isAdminOrNot
                            }
                          >
                            <img src="/img/remove-user-icon.png" alt="" />
                            Remove User
                          </button>
                          {/* <button
                            type="button"
                            onClick={handleDndModeChange}
                            disabled={false}
                          >
                            <img src="/img/dnd-icon.png" alt="" />
                            {isDndModeActive
                              ? "Disable DND Mode"
                              : "Enable DND Mode"}
                          </button> */}
                        </div>

                        <div className="top-right-btns">
                          {/* <button onClick={startScreenShare}>
                            Start ScreenShare
                          </button> */}
                          {/* {!startAudioCall && */}
                          {openCall ? (
                            <a
                              href="#"
                              className="end-call"
                              onClick={(e) => {
                                // pmWindowAction.pmCallAccepted(null);
                                // handleEndCamStream();
                                // e
                                endCall();
                              }}
                            >
                              <EndCallSvg height={22} width={22} />
                            </a>
                          ) : (
                            <a
                              href="#"
                              style={{
                                pointerEvents: openAudioCall ? "none" : "auto",
                              }}
                              onClick={(e) => {
                                startCall();
                              }}
                            >
                              <VideoCallSvg height={22} width={22} />
                            </a>
                          )}
                          {/* } */}
                          {/* <a
                            href="#"
                            // style={{
                            //   pointerEvents: openAudioCall ? "none" : "auto",
                            // }}
                            onClick={(e) => {
                              startScreen();
                            }}
                          >
                            start
                          </a> */}
                          {openAudioCall ? (
                            <a
                              href="#"
                              className="end-call"
                              onClick={(e) => {
                                // pmWindowAction.pmCallAccepted(null)
                                // handleEndAudioStream()
                                // e
                                endAudioCall();
                              }}
                            >
                              <EndCallSvg height={22} width={22} />
                            </a>
                          ) : (
                            <a
                              href="#"
                              style={{
                                pointerEvents: openCall ? "none" : "auto",
                              }}
                              onClick={(e) => {
                                // handleStartCallOnClick(e, "voice")
                                startCallAudio();
                              }}
                            >
                              <CallSvg height={22} width={22} />
                            </a>
                          )}

                          {
                            // callType == 'video' &&
                            !isCallMuted ? (
                              <a
                                href="#"
                                className="end-call"
                                onClick={(e) => {
                                  setIsCallMuted(!isCallMuted);
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
                                onClick={(e) => {
                                  setIsCallMuted(!isCallMuted);
                                }}
                              >
                                <img
                                  src="/img/voice.png"
                                  height={22}
                                  width={22}
                                  alt=""
                                />
                              </a>
                            )
                          }

                          {isPageMuted ? (
                            <a
                              onClick={(e) => {
                                document
                                  .querySelectorAll<HTMLMediaElement>(
                                    "video, audio"
                                  )
                                  .forEach((elem: HTMLMediaElement) => {
                                    // if (elem.id != "localVideo") {
                                    elem.muted = false;
                                    // unmuteMe(elem)
                                    // }
                                  });
                                setIsPageMuted(false);
                              }}
                            >
                              <SpeakerOnSvg height={22} width={22} />
                            </a>
                          ) : (
                            <a
                              href="#"
                              className="end-call"
                              onClick={(e) => {
                                document
                                  .querySelectorAll<HTMLMediaElement>(
                                    "video, audio"
                                  )
                                  .forEach((elem: HTMLMediaElement) => {
                                    // if (+elem.id.split('-')[1] !== +signedInUserId) {
                                    elem.muted = true;
                                    // muteMe(elem)
                                    // }
                                  });
                                setIsPageMuted(true);
                              }}
                            >
                              <SpeakerOffSvg height={22} width={22} />
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
                                  handleTextDecoration(
                                    e,
                                    "Underline",
                                    undefined
                                  )
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
                        <ContentEditable
                          innerRef={contentEditableFocus}
                          html={chatTextRef.current}
                          onBlur={chatHandleBlur}
                          disabled={false}
                          onChange={chatHandleChange}
                          onKeyPress={chatKeyPress}
                          onKeyDown={chatOnKeyDown}
                          className="pm-chat-content-editable"
                          placeholder="Type here..."
                          spellCheck={isSpellCheck}
                        />
                        <input
                          type="hidden"
                          ref={enterMsgSend}
                          id="enter-msg-key-244"
                          value={isEnterKeySendMsg ? "sendMsg" : "newLine"}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            sendMsg();
                            chatTextRef.current = "";
                          }}
                          disabled={disableSendBtn}
                        >
                          <img src="/img/sent-msg-icon.png" alt="" />
                        </button>
                      </div>

                      {stickerEmojiOpen ? (
                        <div
                          className="emoji-sticker-box"
                          ref={emojiStickerRef}
                        >
                          {isStickerOrEmoji == "emoji" ? (
                            <div className="emoji-section">
                              <Picker onEmojiClick={onEmojiClick} />
                            </div>
                          ) : (
                            <div className="sticker-section">
                              <div className="sticker-head">
                                <div className="left-head">
                                  <Slider {...sliderSettings}>
                                    {renderSlides()}
                                  </Slider>
                                </div>
                                <div className="right-head">
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
                                  handleTextDecoration(
                                    e,
                                    "Underline",
                                    undefined
                                  )
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
                        <button
                          className={"btn-spell-check"}
                          disabled={!isTranslateAvailable}
                          onClick={openTranslationModal}
                        >
                          {/* <a> */}

                          <img src="/img/translate-icon.png" alt="" />
                          <span>Translate Language</span>
                          {/* </a> */}
                        </button>

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

              {/* {showPmTyping ? (
                <div className="typing-message">
                  <span>{typingStringGenerate(typing)}</span>
                  {typing && typing.length ? " is typing..." : null}
                </div>
              ) : null} */}
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
      {showShareYoutubeVideoModal ? (
        <ShareYoutubeVideoPmModal
          shouldShow={showShareYoutubeVideoModal}
          onClose={closeShareYoutubeVideoModal}
          getParams={handleOpenYoutubeVideoPmModal}
          inviteForUsers={inviteForUsers}
          sender={userSelector}
          // setVideoInviteAccept={setVideoInviteAccept}
        />
      ) : null}
      {/* {viewYoutubeVideoPmModal ? (
        <ViewYoutubeVideoPmModal
          shouldShow={viewYoutubeVideoPmModal}
          onClose={closeViewYoutubeVideoPmModal}
          videoUrl={videoUrl}
          sender={userSelector}
          isSharing={
            localStorage.getItem("isSharing") &&
            localStorage.getItem("isSharing") == userSelector?.id.toString()
              ? true
              : false
          }
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
      {showtranslationModal ? (
        <TranslationModal
          shouldShow={showtranslationModal}
          onClose={closeTranslationModal}
          getParams={getSelectedLanguage}
          pmId={pm_id}
        />
      ) : null}

      {showSendFileModal ? (
        <SendFilePmModal
          shouldShow={showSendFileModal}
          onClose={() => {
            setShowSendFileModal(false);
          }}
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

      {showBuyVirtualGift ? (
        <BuyVirtualGiftModal
          onClose={handleCloseBuyVirtualGiftModal}
          shouldShow={showBuyVirtualGift}
          openVirtualCreditsModal={openVirtualCreditsModal}
        />
      ) : null}

      {isWaitingForOthersToJoin}

      {showCallOngoingAlert}
      {showTranslationAlert}
      {showCreditAlert}

      {mediaDevicesError}
    </React.Fragment>
  );
}

export default PmRoomPage;
