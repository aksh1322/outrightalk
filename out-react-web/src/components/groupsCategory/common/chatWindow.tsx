import React, { useRef, useEffect, useState } from "react";
import Slider from "react-slick";
import { useForm, Controller } from "react-hook-form";
import { useHistory, useParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormTextInput from "src/_common/components/form-elements/textinput/formTextInput";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import { toast } from "react-toastify";
import {
  useAppRoomChatDetailsSelector,
  useAppRoomDetailsSelector,
  useAppKickedUserFromRoom,
  useAppChatDataSelectDeselect,
  useRoomChatTimestampToogleSelector,
  useTextEditorSelector,
} from "src/_common/hooks/selectors/groupCategorySelector";
import { useAppGroupCategoryAction } from "src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook";
import {
  useAppSocketInstanceContainer,
  useAppUserDetailsSelector,
} from "src/_common/hooks/selectors/userSelector";
import clsx from "clsx";
import moment from "moment";
import {
  CHAT_DATE_TIME_FORMAT,
  CHAT_TYPE,
  getBooleanStatus,
  getNameInitials,
  HEADER_MENU_SELECTION_TYPE,
  MENU_OPERATIONS,
  stripHtml,
  URLS,
  getChatTime,
  createMarkup,
  DEFAULT_STICKER_SIZE,
  BOUNDARY_STICKER_SIZE,
  ACTIONS,
  getSubscriptionColor,
  LOGIN_STORAGE,
  getSubscriptionColorInRoom,
} from "src/_config";
import ContentEditable from "react-contenteditable";
import { DropdownButton, Dropdown, ButtonGroup } from "react-bootstrap";
// import EmojiPicker from "emoji-picker-react";
import EmojiPicker, {
  EmojiStyle,
  SkinTones,
  Theme,
  Categories,
  EmojiClickData,
  Emoji,
  SuggestionMode,
  SkinTonePickerLocation,
} from "emoji-picker-react";
import "rc-color-picker/assets/index.css";
import ColorPicker from "rc-color-picker";
import InviteToRoomModal from "src/components/commonModals/inviteToRoomModal/inviteToRoomModal";
import { useUserApi } from "src/_common/hooks/actions/user/appUserApiHook";
import { useAppUserPreferencesSelector } from "src/_common/hooks/selectors/userPreferenceSelector";
import { useAppUserAction } from "src/_common/hooks/actions/user/appUserActionHook";
import ShareWithContactListModal from "src/components/commonModals/shareWithContactListModal/shareWithContactListModal";
import { useAppShareWithContactListModalOpen } from "src/_common/hooks/selectors/userSelector";
import SendWhisperMessageModal from "../roomsDetail/modal/sendWhisperMessageModal";
import StickerBuyModal from "src/components/commonModals/stickerBuyModal/stickerBuyModal";
import { useCommonApi } from "src/_common/hooks/actions/commonApiCall/appCommonApiCallHook";
import ContactListForGiftModal from "src/components/commonModals/contactListForGiftSend/ContactListModal";
import { useAppPmWindowAction } from "src/_common/hooks/actions/pmWindow/appPmWindowActionHook";
import { useDispatch } from "react-redux";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { compose } from "redux";
import SettingContextMenu from "src/components/clickContextMenu/settingContextMenu";
import { useCallContext, useChatContext, useSendBird } from "src/hooks";
import useOutsideClick from "src/_common/hooks/useClickOutside";
import { usePmTimeStampSelector } from "src/_common/hooks/selectors/pmWindowSelector";
import { useAppLoader } from "src/_common/hooks/actions/common/appLoaderHook";

interface ChatWindowProps {
  fetchRoomDetailsData: any;
  roomId: number;
}
interface topicFormValues {
  topic: string;
}
const topicSchema = yup.object().shape({
  topic: yup.string(),
});

const settings = {
  dots: false,
  infinite: false,
  slidesToShow: 4,
  slidesToScroll: 4,
  swipeToSlide: true,
  autoplay: false,
};

// var settingSaveOrNot = 0;

function ChatWindowComponent({
  fetchRoomDetailsData,
  roomId,
}: ChatWindowProps) {
  const {
    watch,
    register,
    control,
    setValue,
    getValues,
    reset,
    handleSubmit,
    errors,
  } = useForm<topicFormValues>({
    resolver: yupResolver(topicSchema),
    defaultValues: {
      topic: "",
    },
  });

  // const { groupId, roomId } = useParams<any>();
  // const [dummy,setDummy]=useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const history = useHistory();
  const groupCategoryApi = useGroupCategoryApi();
  const groupCategoryAction = useAppGroupCategoryAction();
  const commonApi = useCommonApi();
  const shareWithOtherContactListSelector =
    useAppShareWithContactListModalOpen();
  const roomChatDetails = useAppRoomChatDetailsSelector();
  const roomDetailsSelector = useAppRoomDetailsSelector();
  const chatDataSelectDeselectSelector = useAppChatDataSelectDeselect();
  const timeStampToogleSelector = useRoomChatTimestampToogleSelector();
  const kickedUserSelector = useAppKickedUserFromRoom();
  const preferenceSelector = useAppUserPreferencesSelector();
  const textEditorSelector = useTextEditorSelector();
  //socket container for socket emit from page
  const socketContainer: any = useAppSocketInstanceContainer();
  const userDetails = useAppUserDetailsSelector();
  const userAction = useAppUserAction();
  const [chatText, setChatText] = useState("");
  const [stickerEmojiOpen, setStickerEmojiOpen] = useState(false);
  const [isStickerOrEmoji, setIsStickerOrEmoji] = useState("emoji");
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const {
    sendMessageInRoom,
    populateCurrentRoomChat,
    clearCurrentRoomChatInfo,
  } = useSendBird(scrollToBottom);
  const CheckTimeStamp = usePmTimeStampSelector();
  const {
    currentSuperRoomChat,
    setCurrentSuperRoomChat,
    setCurrentSuperRoomURL,
    currentSuperRoomURL,
    superRoomSettings,
    setSuperRoomSettings,
    roomDetailsFromSocket,
    sortAutoScrollTextChat,
    setSortAutoScrollTextChat,
  } = useChatContext();

  const { setCurrentCallRoomId, currentCallRoomId, setAllowedMicCount } =
    useCallContext();
  // const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  // const [colorPicker, setColorPicker] = useState("#000000");
  const chatTextRef = useRef("");
  const [showInviteToRoomModal, setShowInviteToRoomModal] =
    useState<boolean>(false);
  const userApi = useUserApi();
  const contentEditableFocus = useRef<any>();
  const roomValue = useRef<any>();
  const [isEnterKeySendMsg, setIsEnterKeySendMsg] = useState(true);
  const enterMsgSend = useRef<any>();
  const [showWhisperMessageModal, setWhisperMessageModal] =
    useState<boolean>(false);
  const [showStickerBuyModal, setShowStickerBuyModal] =
    useState<boolean>(false);
  const [membersData, setMembersData] = useState<any>();
  const [checkedValues, setCheckedValues] = useState<number[]>([]);

  const [stickerCategories, setStickerCategories] = useState<any>([]);
  const [categorywiseSticker, setCategorywiseSticker] = useState<any>([]);
  const [selectedStickerCategory, setSelectedStickerCategory] =
    useState<number>();
  const [showChatTimestamp, setShowChatTimeStamp] = useState<boolean>(false);
  const [firstTimeChatScroll, setFirstTimechatScroll] = useState<boolean>(true);

  const [showContactListModal, setContactListModalModal] =
    useState<boolean>(false);
  const [byStickerModalType, setByStickerModalType] = useState<any>();
  const [selectedContactList, setSelectedContactList] = useState<any>([]);
  const [settingSaveOrNot, setSettingSaveOrNot] = useState<number>(0);
  const [checkCovid, setCheckCovid] = useState<number>(0);
  const [currentUsersInRoom, setCurrentUsersInRoom] = useState<any>();
  const [welcomeMessage, setWelcomeMessage] = useState<string>("");
  const emojiStickerRef = useRef<any>(null);
  const emojiStickerBtnRef = useRef<any>(null);
  const [rommsetting, setRoomSetting] = useState<any>();
  const pmWindowAction = useAppPmWindowAction();
  const { showLoader, hideLoader } = useAppLoader();

  const value = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS);
  // const {
  //   id: signedInUserId,
  //   send_bird_user: { sb_access_token: signedInUserToken },
  // } = value ? JSON.parse(value) : "";

  const data = value ? JSON.parse(value) : "";
  const { sb_access_token, sb_user_id } = data.send_bird_user;
  // const [editorFont, setEditorFont] = useState<string>('');
  // const [editorFamily, setEditorFamily] = useState<string>('Comic Sans MS');
  // const [openVirtualCreditsModal, setOpenVirtualCreditsModal] =
  useEffect(() => {
    setRoomSetting(CheckTimeStamp);
  }, [CheckTimeStamp]);

  const getRoomDetails = () => {
    const params = {
      room_id: roomId,
    };
    groupCategoryApi.callGetRoomDetails(
      params,
      (message: string, resp: any) => {
        if (resp) {
          setSuperRoomSettings(resp.user.room_user_settings);
          setWelcomeMessage(resp.room.welcome_message);
          if (currentSuperRoomURL !== resp.room.send_bird_channel_url) {
            setAllowedMicCount(resp.allow_mic);
            setCurrentSuperRoomURL(resp.room.send_bird_channel_url);
            // setCurrentSuperRoomURL("testing-channel");
          }

          if (currentCallRoomId !== resp?.room?.send_bird_video_call_room_id) {
            setCurrentCallRoomId(resp.room.send_bird_video_call_room_id);
          }

          var data = resp.user.room_user_settings.save_default_room_settings;
        }
      },
      (message: string) => {}
    );
    //
  };

  function scrollToBottom() {
    if (containerRef.current && containerRef.current !== null) {
      containerRef.current.scrollTo(0, containerRef.current.scrollHeight);
    }
  }

  const handleRoomSettings = (operation: string, value: any) => {
    const params = {
      room_id: roomId,
      key_name: operation,
      key_value: value,
    };

    groupCategoryApi.callChangeUserRoomSettings(
      params,
      (message: string, resp: any) => {
        if (resp) {
          getRoomDetails();
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  // let el: any = document.querySelector("#chat-window-scroll-btm");
  //old pdf code
  // const makePdf = () => {
  //   let doc = new jsPDF("p", "pt", "a4");
  //   doc.setFontSize(Number(testObject.fontSize));
  //   doc.setTextColor(testObject.color);
  //   doc.setFont(testObject.fontFamily);
  //   doc.html(el, {
  //     callback: (pdf) => {
  //       pdf.save("download.pdf");
  //     },
  //     // x: 0,
  //     // y: 0,
  //     windowWidth: doc.internal.pageSize.getWidth(),
  //     // autoPaging: true,
  //   });
  // };

  //new pdf code

  const makePdf = () => {
    const element = document.querySelector("#chat-body") as HTMLElement;

    if (!element) {
      console.error("Element not found.");
      return;
    }

    // html2canvas(targetElement, { scrollY: -window.scrollY })
    //   .then((canvas) => {
    html2canvas(element, {
      scrollY: -window.scrollY,
      scale: 2, // Adjust scale as needed
      useCORS: true, // Enable CORS if necessary
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = imgProps.width;
      const imgHeight = imgProps.height;

      const aspectRatio = imgWidth / imgHeight;
      let targetWidth = pdfWidth;
      let targetHeight = pdfWidth / aspectRatio;

      if (targetHeight > pdfHeight) {
        targetHeight = pdfHeight;
        targetWidth = pdfHeight * aspectRatio;
      }
      pdf.addImage(imgData, "PNG", 0, 0, targetWidth, targetHeight);
      pdf.save("download.pdf");
    });

    // const targetClassName = "room-chat-window";

    // const targetElement = document.getElementsByClassName(targetClassName)[0];
    // var opt = {
    //   margin:       1,
    //   filename:     'myfile.pdf',
    //   image:        { type: 'png', quality: 0.98 },
    //   html2canvas:  { scale: 2 },
    //   jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    // };
    // if (targetElement) {
    //   html2pdf().set({ pagebreak: { mode: 'avoid-all' } }).from(targetElement).save("download.pdf");
    //   // html2pdf().set(opt);
    //   // html2pdf().addImage()
    //   // html2pdf().save("download.pdf");
    // }
  };

  useEffect(() => {
    getRoomDetails();
    getStickerCategory();
    setAllowedMicCount(0);
    setCurrentSuperRoomURL("");
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.CHAT.TEXT_EDITOR_STATUS,
      payload: false,
    });
  }, []);

  function handleSelect(checkedName: number) {
    const newNames = checkedValues?.includes(checkedName)
      ? checkedValues?.filter((name) => name !== checkedName)
      : [...(checkedValues ?? []), checkedName];
    setCheckedValues(newNames);
    return newNames;
  }
  const whisperMessageModalClose = () => {
    if (showWhisperMessageModal) setWhisperMessageModal(false);
  };

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

  const handleWhisperMessageModalOpen = (e: any, users: any) => {
    e.preventDefault();
    setMembersData({
      id: users.details.id,
      userName: users.details.username,
      type: CHAT_TYPE.WHISPER,
      customize_nickname: users.customize_nickname,
      whisper_channel: users.whisper_channel,
    });
    setWhisperMessageModal(true);
  };

  const gotoGroupAndCategoryPage = (e: React.MouseEvent) => {
    e.preventDefault();
    history.push(URLS.USER.GROUPS_AND_CATEGORY);
  };

  // useEffect(() => {
  //   getRoomDetails();
  // }, []);

  useEffect(() => {
    if (
      preferenceSelector &&
      preferenceSelector.list &&
      preferenceSelector.list.length
    ) {
      let enterKeyFound = preferenceSelector.list.filter(
        (x: any) => x.key == "pressing_enter_key"
      );
      if (enterKeyFound && enterKeyFound.length) {
        if (parseInt(enterKeyFound[0].val) == 1) {
          setIsEnterKeySendMsg(true);
        } else {
          setIsEnterKeySendMsg(false);
        }
      }

      let chatTimestampFound = preferenceSelector.list.filter(
        (x: any) => x.key == "show_timestamp_chat_room"
      );
      if (chatTimestampFound && chatTimestampFound.length) {
        if (parseInt(chatTimestampFound[0].val) == 1) {
          setShowChatTimeStamp(true);
        } else {
          setShowChatTimeStamp(false);
        }
      }
    }
  }, [preferenceSelector]);

  const handleOnblur = () => {
    const topic = getValues("topic");
    if (topic.trim()) {
      var params = {
        room_id:
          roomDetailsSelector && roomDetailsSelector.room
            ? roomDetailsSelector.room.id
            : 0,
        topic: topic.trim(),
      };
      groupCategoryApi.callManageRoomTopic(
        params,
        (message: string, resp: any) => {},
        (message: string) => {
          toast.error(message);
        }
      );
    }
  };

  useEffect(() => {
    if (
      fetchRoomDetailsData &&
      fetchRoomDetailsData.room &&
      fetchRoomDetailsData.room.topic
    ) {
      setValue("topic", fetchRoomDetailsData.room.topic);
    }
  }, [fetchRoomDetailsData]);

  //If autoscroll on then scroll chat window otherwise not scroll
  useEffect(() => {
    setTimeout(() => {
      if (
        sortAutoScrollTextChat
        // roomChatDetails &&
        // roomChatDetails.length &&
        // roomDetailsSelector &&
        // roomDetailsSelector.user &&
        // roomDetailsSelector.user.room_user_settings &&
        // roomDetailsSelector.user.room_user_settings[
        //   MENU_OPERATIONS.AUTOSCROLL_TEXT
        // ]
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
  }, [roomChatDetails, sortAutoScrollTextChat]);

  // For Kicked user socket fire
  useEffect(() => {
    if (kickedUserSelector && kickedUserSelector.user_id) {
      if (kickedUserSelector.user_id === (userDetails && userDetails.id)) {
        toast.error(
          kickedUserSelector && kickedUserSelector.msg
            ? kickedUserSelector.msg
            : "You are kicked by admin"
        );
        history.replace("");
        history.push(`groups`);
      }
    }
  }, [kickedUserSelector]);

  //chat area handle code here

  const chatHandleChange = (evt: any) => {
    chatTextRef.current = evt.target.value;
    setChatText(evt.target.value);
  };

  const chatHandleBlur = () => {};

  const chatOnKeyDown = (e: any) => {
    if (enterMsgSend.current.value == "sendMsg") {
      if (e.keyCode == 13 && e.shiftKey == false) {
        e.preventDefault();
        sendMsg("normal");
      }
    }
  };

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

  const initialApiObject = {
    fontFamily: "Open Sans",
    textDecoration: "normal",
    fontSize: "20px",
    fontStyle: "normal",
    color: "black",
    fontWeight: "normal",
  };

  const [apiObject, setApiObject] = useState(initialApiObject);

  const handleTextDecoration = (e: any, type: string, size: any) => {
    // e.preventDefault();

    if (type === "Underline") {
      // if (settingSaveOrNot == 1 || checkCovid == 1) {
      handleRoomSettings("text_decoration", type);
      setApiObject((apiResponse) => {
        return { ...apiResponse, textDecoration: type };
      });
      // } else {
      //   setTestObject((testObject) => {
      //     return { ...testObject, textDecoration: type };
      //   });
      // }
    } else if (type === "bold") {
      // if (settingSaveOrNot == 1 || checkCovid == 1) {
      handleRoomSettings("font_weight", type);
      setApiObject((apiResponse) => {
        return { ...apiResponse, fontWeight: type };
      });
      // } else {
      //   setTestObject((testObject) => {
      //     return { ...testObject, fontWeight: type };
      //   });
      // }
    } else {
      // if (settingSaveOrNot == 1 || checkCovid == 1) {
      handleRoomSettings("font_style", type);
      setApiObject((apiResponse) => {
        return { ...apiResponse, fontStyle: type };
      });
      // } else {
      //   setTestObject((testObject) => {
      //     return { ...testObject, fontStyle: type };
      //   });
      // }
    }
    // document.execCommand(type, true, size);
  };

  // const handleTextDecoration = (e: any, type: string, size: any) => {
  //   e.preventDefault();
  //   handleRoomSettings('text_decoration', type)
  //   document.execCommand(type, false, size);
  // };

  const handleChangeFont = (val: any, valid: boolean) => {
    var value = "";
    if (valid === true) {
      value = val;
    } else {
      value = val.target.value;
    }
    // if (settingSaveOrNot == 1 || checkCovid == 1) {
    handleRoomSettings("font_family", value);
    setApiObject((apiResponse) => {
      return { ...apiResponse, fontFamily: value };
    });
    // } else {
    //   setTestObject((testObject) => {
    //     return { ...testObject, fontFamily: value };
    //   });
    // }
  };

  const handleFontSize = (val: any, valid: boolean) => {
    var value = "";
    if (valid === true) {
      value = val;
    } else {
      value = val.target.value;
    }
    // if (settingSaveOrNot == 1 || checkCovid == 1) {
    // handleRoomSettings("font_size", value);
    setApiObject((apiResponse) => {
      return { ...apiResponse, fontSize: value };
    });
    // } else {
    // setTestObject((testObject) => {
    //   return { ...testObject, fontSize: value };
    // });
    // }
  };

  const handleEditorChange = () => {
    // document.execCommand("fontSize", true, String(editorFont));
  };

  const changeHandler = (colors: any, valid: boolean) => {
    var value = "";
    if (valid === true) {
      value = colors;
    } else {
      value = colors.color;
    }
    // if (settingSaveOrNot == 1 || checkCovid == 1) {
    handleRoomSettings("font_color", value);
    setApiObject((apiResponse) => {
      return { ...apiResponse, color: value };
    });
    // } else {
    //   setTestObject((testObject) => {
    //     return { ...testObject, color: value };
    //   });
    // }
  };

  useEffect(() => {
    if (currentSuperRoomURL?.length > 0) {
      (async () => {
        await populateCurrentRoomChat("group");
      })();
    }
  }, [currentSuperRoomURL]);

  useEffect(() => {
    const params = {
      room_id: roomId,
    };
    groupCategoryApi.callGetRoomDetails(
      params,
      (message: string, resp: any) => {
        if (resp) {
          setCurrentUsersInRoom(resp?.members);
        }
      },
      (message: string) => {}
    );
  }, [currentSuperRoomChat]);

  useEffect(() => {
    const timmer = setTimeout(() => {
      const params = {
        room_id: roomId,
      };
      groupCategoryApi.callGetRoomDetails(
        params,
        (message: string, resp: any) => {
          if (resp) {
            setSuperRoomSettings(resp.user.room_user_settings);
            setWelcomeMessage(resp.room.welcome_message);
            if (currentSuperRoomURL !== resp.room.send_bird_channel_url) {
              setAllowedMicCount(resp.allow_mic);
              setCurrentSuperRoomURL(resp.room.send_bird_channel_url);
              // setCurrentSuperRoomURL("testing-channel");
            }

            if (
              currentCallRoomId !== resp?.room?.send_bird_video_call_room_id
            ) {
              setCurrentCallRoomId(resp.room.send_bird_video_call_room_id);
            }

            if (resp.user) {
              const data: number = resp.user.save_default_room_settings;
              setSettingSaveOrNot(data);
            }

            if (settingSaveOrNot == 1) {
              // changeHandler(resp.user.font_color, true);
              // handleTextDecoration(undefined, resp.user.font_style, undefined);
              // handleTextDecoration(
              //   undefined,
              //   resp.user.text_decoration,
              //   undefined
              // );
              // handleTextDecoration(undefined, resp.user.font_weight, undefined);
              // handleChangeFont(resp.user.font_family, true);
              // handleFontSize(resp.user.font_size, true);
            } else {
            }
          }
        },
        (message: string) => {}
      );
    }, 1500);
    return () => {
      clearTimeout(timmer);
    };
  }, [settingSaveOrNot, roomId]);

  const getData = async () => {
    return await new Promise((resolve, reject) => {
      const params4 = {
        room_id: roomId,
      };
      groupCategoryApi.callGetRoomDetails(
        params4,
        (message: string, resp: any) => {
          if (resp) {
            setSuperRoomSettings(resp.user.room_user_settings);
            setWelcomeMessage(resp.room.welcome_message);
            if (currentSuperRoomURL !== resp.room.send_bird_channel_url) {
              setAllowedMicCount(resp.allow_mic);
              setCurrentSuperRoomURL(resp.room.send_bird_channel_url);
              // setCurrentSuperRoomURL("testing-channel");
            }

            if (
              currentCallRoomId !== resp?.room?.send_bird_video_call_room_id
            ) {
              setCurrentCallRoomId(resp.room.send_bird_video_call_room_id);
            }

            var demo = resp.user.save_default_room_settings;
            resolve(demo);
          }
        },
        (message: string) => {
          reject(message);
        }
      );
    });
  };

  const sendMsg = async (msgType: string) => {
    // var value = document.getElementById("roomid");

    getData().then(async (covidData: any) => {
      setCheckCovid(covidData);
      // setSettingSaveOrNot(covidData);
      if (chatTextRef.current != "") {
        var newChatText = "";
        var fontFamily = "";
        // if (covidData == 1) {
        newChatText =
          '<font face="' +
          apiObject.fontFamily +
          '"><span style="font-weight:' +
          apiObject.fontWeight +
          "; text-decoration:" +
          apiObject.textDecoration +
          "; font-style:" +
          apiObject.fontStyle +
          "; color:" +
          apiObject.color +
          "; font-size:" +
          apiObject.fontSize +
          '">' +
          chatTextRef.current +
          "</span></font>";
        fontFamily = apiObject.fontFamily;
        // } else {
        //   newChatText =
        //     '<font face="' +
        //     testObject.fontFamily +
        //     '"><span style="font-weight:' +
        //     testObject.fontWeight +
        //     "; text-decoration:" +
        //     testObject.textDecoration +
        //     "; font-style:" +
        //     testObject.fontStyle +
        //     "; color:" +
        //     testObject.color +
        //     "; font-size:" +
        //     testObject.fontSize +
        //     '">' +
        //     chatTextRef.current +
        //     "</span></font>";
        //   fontFamily = testObject.fontFamily;
        // }

        chatTextRef.current = "";
        var newparams = {
          entity_id: roomId,
          room_type_id: roomDetailsSelector?.room?.room_type_id,
          channel_url: currentSuperRoomURL,
        };
        const resp: any = await sendMessageInRoom(
          newChatText,
          "group",
          newparams
        );

        setApiObject(initialApiObject);
        if (resp) {
          hideLoader();
          var params = {
            // room_id: roomDetailsSelector && roomDetailsSelector.room ? roomDetailsSelector.room.id : 0,
            room_id: parseInt(roomValue.current.value),
            chat_body: newChatText,
            to_user_id: 0,
            type: msgType,
            font_family: fontFamily,
          };
          // const message = `<span style="font-size: 13px;color: #162334;">${chatTextRef.current}</span>`
          groupCategoryApi.callPostChatInRoom(
            params,
            (message: string, resp: any) => {
              hideLoader();
              // setChatText("");
              chatTextRef.current = ""; //reset content editable div
              contentEditableFocus.current.focus();
            },
            (message: string) => {
              setChatText("");
              chatTextRef.current = "";
              toast.error(message);
            }
          );
        }
      } else {
        // toast.error("Enter some text...");
      }
    });
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

  const handleEmojiSticker = (e: any, type: string) => {
    e.preventDefault();
    setIsStickerOrEmoji(type);
  };

  const onEmojiClick = (emojiObject: any) => {
    chatTextRef.current =
      chatTextRef.current +
      "<img src='https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/" +
      emojiObject.unified +
      ".png' alt='emoji' style='height: 27px; width: 27px;'/>";
    setChatText(chatTextRef.current);
    // setStickerEmojiOpen(false);
  };

  const handleOpenToolBar = (e: any) => {
    e.preventDefault();

    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.CHAT.TEXT_EDITOR_STATUS,
      payload: !textEditorSelector,
    });

    // setIsToolbarOpen(!isToolbarOpen);
  };

  const handleInviteToRoom = (e: any) => {
    e.preventDefault();
    // setShowInviteToRoomModal(true)
    userAction.showShareWithOtherContactListModal(
      true,
      window.location.href,
      roomId
    );
  };

  const inviteToRoom = (params: any) => {
    params.room_link = window.location.href;
    params.room_id = roomId;
    params.isVIP =
      roomDetailsSelector?.room?.room_category_id == 5 ? true : false;
    userApi.callInviteToRoom(
      params,
      (message: string, resp: any) => {
        setShowInviteToRoomModal(false);
        toast.success(message);
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const searchGoogle = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open("https://www.google.com/", "_blank");
  };

  //Select, Select All & de select all functionality added here
  useEffect(() => {
    if (chatDataSelectDeselectSelector) {
      if (
        chatDataSelectDeselectSelector === HEADER_MENU_SELECTION_TYPE.SELECT_ALL
      ) {
        const found =
          roomChatDetails && roomChatDetails.length
            ? roomChatDetails.filter((data: any) =>
                [CHAT_TYPE.NORMAL].includes(data.type)
              )
            : [];
        if (found && found.length) {
          setCheckedValues(
            found && found.length && found.map((x: any) => x.id)
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
  }, [chatDataSelectDeselectSelector, roomChatDetails]);

  //Paste menu use effect
  useEffect(() => {
    if (chatDataSelectDeselectSelector === HEADER_MENU_SELECTION_TYPE.PASTE) {
      handlePaste();
    }
  }, [chatDataSelectDeselectSelector]);

  //Reset Check Uncheck selector after room unmount
  useEffect(() => {
    if (!roomDetailsSelector) {
      return () => {
        groupCategoryAction.chatDataSelectDeselect(null);
      };
    }
    if (roomDetailsSelector?.room) {
      let savedRoomSettingArray = JSON.parse(
        localStorage.getItem("roomSettings") || "[]"
      );
      if (savedRoomSettingArray.length) {
        const checktimeStampAvailable = savedRoomSettingArray?.filter(
          (x: any) => x.roomId == roomId
        );
        if (checktimeStampAvailable.length) {
          setRoomSetting(checktimeStampAvailable);
          pmWindowAction.SetTimeStamp(checktimeStampAvailable);
        } else {
          var roomSettings: any = {
            roomId: roomId,
            settings: {
              notify_users_join_exit_room:
                roomDetailsSelector?.room?.room_settings
                  ?.notify_users_join_exit_room == "1"
                  ? true
                  : false,
              show_timestamp_chat_room:
                roomDetailsSelector?.room?.room_settings
                  ?.show_timestamp_chat_room == "1"
                  ? true
                  : false,
            },
          };
          savedRoomSettingArray.push(roomSettings);
          localStorage.setItem(
            "roomSettings",
            JSON.stringify(savedRoomSettingArray)
          );
          const getData = JSON.parse(
            localStorage.getItem("roomSettings") || "[]"
          );
          const checktimeStampAvailable = getData?.filter(
            (x: any) => x.roomId == roomId
          );

          setRoomSetting(checktimeStampAvailable);
          pmWindowAction.SetTimeStamp(checktimeStampAvailable);
        }
      } else {
        var roomSettings: any = {
          roomId: roomId,
          settings: {
            notify_users_join_exit_room:
              roomDetailsSelector?.room?.room_settings
                ?.notify_users_join_exit_room == "1"
                ? true
                : false,
            show_timestamp_chat_room:
              roomDetailsSelector?.room?.room_settings
                ?.show_timestamp_chat_room == "1"
                ? true
                : false,
          },
        };
        savedRoomSettingArray.push(roomSettings);
        localStorage.setItem(
          "roomSettings",
          JSON.stringify(savedRoomSettingArray)
        );
        const newDataCheck = JSON.parse(
          localStorage.getItem("roomSettings") || "[]"
        );
        setRoomSetting(newDataCheck);
        pmWindowAction.SetTimeStamp(newDataCheck);
      }
    }
  }, [roomDetailsSelector]);

  // console.log(roomDetailsSelector, "roomDetailsSelector");

  const handleCopy = () => {
    var copyPaste = "";
    if (checkedValues && checkedValues.length) {
      for (let i = 0; i < checkedValues.length; i++) {
        let found = roomChatDetails.filter(
          (x: any) => x.id == checkedValues[i]
        );
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
        groupCategoryAction.chatDataSelectDeselect(null);
      })
      .catch((err) => {
        console.error("Failed to read clipboard contents: ", err);
      });
  };

  const isWhisperDivShoworNot = () => {
    let found =
      fetchRoomDetailsData &&
      fetchRoomDetailsData.members &&
      fetchRoomDetailsData.members.length &&
      fetchRoomDetailsData.members.filter(
        (x: any) => x.whisper_channel != null
      );
    if (found && found.length) {
      return true;
    } else {
      return false;
    }
  };

  //sticker group api call and groupwise sticker call

  // useEffect(() => {
  //   setAllowedMicCount(0);
  //   setCurrentSuperRoomURL("");
  //   dispatch({
  //     type: ACTIONS.USER.GROUPS_CATEGORY.CHAT.TEXT_EDITOR_STATUS,
  //     payload: false,
  //   });

  //   getStickerCategory();
  // }, []);

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
            // setStickerCategories([...stickerCategories, resp.categories]);
            resp.categories[0].id &&
              getCategorywiseSticker(null, resp.categories[0].id);
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
        if (resp && resp.sticker && resp.sticker.length) {
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

  const pasteSticker = async (
    imgUrl: string,
    height: number,
    width: number,
    title: string
  ) => {
    setStickerEmojiOpen(false);

    let sHeight: number =
      height && height > BOUNDARY_STICKER_SIZE ? height : DEFAULT_STICKER_SIZE; //If height >boundary then otherwise default value set
    let sWidth: number =
      width && width > BOUNDARY_STICKER_SIZE ? width : DEFAULT_STICKER_SIZE; //If width >boundary then otherwise default value set

    let sticker = `<img src=\"${imgUrl}\" height=\"${sHeight}\" width=\"${sWidth}\" alt="${
      title ? title : "sticker"
    }">`;

    const resp: any = await sendMessageInRoom(sticker, "group", "sticker");
    if (resp) {
      var params = {
        room_id: parseInt(roomValue.current.value),
        chat_body: sticker,
        to_user_id: 0,
        type: "sticker",
      };
      // chatTextRef.current = ""; //reset content editable div
      groupCategoryApi.callPostChatInRoom(
        params,
        (message: string, resp: any) => {},
        (message: string) => {
          toast.error(message);
        }
      );
    }
  };

  useEffect(() => {
    clearCurrentRoomChatInfo();

    return () => {
      clearCurrentRoomChatInfo();
    };
  }, []);

  const scrollsToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (
        roomDetailsFromSocket?.length &&
        currentSuperRoomChat?.length &&
        rommsetting[0]?.settings.notify_users_join_exit_room
      ) {
        scrollsToBottom();
      } else if (firstTimeChatScroll) {
        scrollToBottom();
        setFirstTimechatScroll(false);
      }
    }, 3000);
  }, [roomDetailsFromSocket, currentSuperRoomChat]);

  return (
    <React.Fragment>
      {/* <SettingContextMenu/> */}
      <div className="room-chat-window-wrap dark-box-inner">
        <div className="topic-box">
          {fetchRoomDetailsData &&
          fetchRoomDetailsData.room &&
          fetchRoomDetailsData.room.join_status &&
          [0].includes(fetchRoomDetailsData.room.join_status.is_admin) ? (
            <p style={{ color: "white" }}>
              {fetchRoomDetailsData && fetchRoomDetailsData.room
                ? fetchRoomDetailsData && fetchRoomDetailsData.room.topic
                : ""}
            </p>
          ) : (
            <Controller
              control={control}
              name="topic"
              render={({ onChange, onBlur, value, name, ref }) => (
                <FormTextInput
                  // name={name}
                  onChange={onChange}
                  disabled={
                    fetchRoomDetailsData &&
                    fetchRoomDetailsData.room &&
                    fetchRoomDetailsData.room.join_status
                      ? [0].includes(
                          fetchRoomDetailsData.room.join_status.is_admin
                        )
                      : false
                  }
                  onBlur={() => {
                    onBlur();
                    handleOnblur();
                  }}
                  value={value}
                  inputRef={ref}
                  type="text"
                  error={errors.topic}
                  placeholder="Topic"
                />
              )}
            />
          )}
          {/* <Controller
                        control={control}
                        name="topic"
                        render={({ onChange, onBlur, value, name, ref }) => (
                            <FormTextInput
                                // name={name}
                                onChange={onChange}
                                disabled={fetchRoomDetailsData && fetchRoomDetailsData.room && fetchRoomDetailsData.room.join_status ? [0].includes(fetchRoomDetailsData.room.join_status.is_admin) : false}
                                onBlur={() => {
                                    onBlur()
                                    handleOnblur()
                                }}
                                value={value}
                                inputRef={ref}
                                type="text"
                                error={errors.topic}
                                placeholder="Topic"
                            />
                        )}
                    /> */}
        </div>
        {/* WHISPER MEMBER START HERE */}
        {isWhisperDivShoworNot() ? (
          <div className="whisper-head-wrap">
            {fetchRoomDetailsData &&
            fetchRoomDetailsData.members &&
            fetchRoomDetailsData.members.length
              ? fetchRoomDetailsData.members.map(
                  (users: any, index: number) => (
                    <div key={index}>
                      {users && users.whisper_channel ? (
                        <div className="form-group">
                          <div className="share-with-wrap">
                            <div className="share-list">
                              <a
                                href="#"
                                className={clsx({
                                  "disable-link": users.is_block,
                                })}
                                onClick={(e) =>
                                  handleWhisperMessageModalOpen(e, users)
                                }
                              >
                                <div className="share-user">
                                  {/* <span className="remove-user">
                                                                    <a href="#">
                                                                        <img src="/img/close-btn.png" alt="remove" />
                                                                    </a>
                                                                </span> */}
                                  <div className="share-user-img">
                                    {users &&
                                    users.details &&
                                    users.details.avatar.thumb &&
                                    getBooleanStatus(
                                      users.details.avatar &&
                                        users.details.avatar.visible_avatar
                                        ? users.details.avatar.visible_avatar
                                        : 0
                                    ) &&
                                    users.details.avatar.thumb ? (
                                      <img
                                        src={users.details.avatar.thumb}
                                        alt={users.details.username}
                                      />
                                    ) : (
                                      <span className="text-avatar">
                                        {getNameInitials(
                                          users.details.username
                                        )}
                                      </span>
                                    )}
                                  </div>
                                  <p
                                    className={clsx({
                                      "ignore-user-list":
                                        users.is_ignore && !users.is_block,
                                    })}
                                  >
                                    {users.customize_nickname &&
                                    users.customize_nickname.nickname
                                      ? users.customize_nickname.nickname
                                      : users.details.username}
                                  </p>
                                </div>
                              </a>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                )
              : null}
          </div>
        ) : null}
        {/* WHISPER MEMBER END HERE */}
        {/* <button onClick={() => handleCopy()}>copy</button> */}
        <div id="chat-body">
          <div
            ref={containerRef}
            className="room-chat-window"
            id="chat-window-scroll-btm"
          >
            {welcomeMessage && (
              <div
                className="online_offline_pm_notification"
                style={{ textAlign: "center" }}
                dangerouslySetInnerHTML={{ __html: welcomeMessage }}
              />
            )}
            {roomDetailsFromSocket && roomDetailsFromSocket.length
              ? roomDetailsFromSocket.map((data: any, index: number) => {
                  // Check if the type is not "normal" before rendering
                  if (
                    data?.type !== "normal" &&
                    sb_user_id == data?.view_user_id &&
                    (data?.type === "join" || data?.type === "exit") &&
                    data?.room_id == roomId &&
                    rommsetting[0].settings.notify_users_join_exit_room == true
                  ) {
                    return (
                      <div
                        key={index} // Ensure each element in the list has a unique key
                        className="online_offline_pm_notification"
                        style={{ textAlign: "center" }}
                        dangerouslySetInnerHTML={{ __html: data?.chat_body }}
                      />
                    );
                  } else {
                    return null; // Return null if the type is "normal"
                  }
                })
              : null}

            {currentSuperRoomChat && currentSuperRoomChat.length
              ? currentSuperRoomChat.map(
                  (chat: any, index: number, fullChat: any) => {
                    // if(chat?.messageType === 'admin') return null
                    const customType = chat?.customType;
                    const userColor = getSubscriptionColorInRoom(
                      chat.sender?.userId,
                      currentUsersInRoom
                    );
                    let messageType: string = "";
                    if (customType === "SENDBIRD:AUTO_EVENT_MESSAGE") {
                      const { type } = JSON.parse(chat?.data);
                      if (type) messageType = type;
                    }
                    if (messageType === "CHANNEL_CREATE") {
                      return null;
                    } else if (messageType === "USER_JOIN") {
                      if (!superRoomSettings.notify_join_room) {
                        return null;
                      }
                    } else if (messageType === "USER_LEAVE") {
                      if (!superRoomSettings.notify_exit_room) {
                        return null;
                      }
                    }
                    const timeStamp = formatDate(chat?.createdAt);

                    return (
                      <div key={index} className="msg-other-wrap">
                        {/* <div className="other-img-wrap">
                          <span className="chat-avatar">
                            {getNameInitials(chat?.sender?.nickname)}
                          </span>
                      </div> */}
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
                            <div key={index} className="chat-single-message">
                              <div
                                className={clsx({
                                  image: true,
                                  "my-message":
                                    chat?.sender?.userId === sb_user_id,
                                  "other-message":
                                    chat?.sender?.userId !== sb_user_id,
                                })}
                              >
                                {chat?.sender &&
                                chat?.sender?.plainProfileUrl ? (
                                  <img src={chat.sender?.plainProfileUrl} />
                                ) : (
                                  getNameInitials(chat.sender?.nickname)
                                )}
                              </div>
                              <div className="text">
                                <p
                                  className="name"
                                  style={{ color: userColor }}
                                >
                                  {chat?.sender?.nickname}
                                  <span className="date">
                                    {rommsetting[0].settings
                                      ?.show_timestamp_chat_room == true
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
                                {/* {chat.message.length ? chat.message : " "}   */}
                              </div>
                            </div>
                          ) : (
                            <div key={index} className="chat-single-message">
                              <div
                                className={clsx({
                                  image: true,
                                  "my-message":
                                    chat?.sender?.userId === sb_user_id,
                                  "other-message":
                                    chat?.sender?.userId !== sb_user_id,
                                })}
                              >
                                {chat?.sender &&
                                chat?.sender?.plainProfileUrl ? (
                                  <img src={chat.sender?.plainProfileUrl} />
                                ) : (
                                  getNameInitials(chat.sender?.nickname)
                                )}
                              </div>
                              <div className="text">
                                <p
                                  className="name"
                                  style={{ color: userColor }}
                                >
                                  {chat?.sender?.nickname}
                                  <span className="date">
                                    {rommsetting[0]?.settings
                                      ?.show_timestamp_chat_room == true
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
                                {/* {chat.message.length ? chat.message : " "}   */}
                              </div>
                            </div>
                          )}
                        </>
                      </div>
                    );
                    // return (
                    //   <div
                    //     key={index}
                    //     className="msg-other-wrap"
                    //     // className={clsx({
                    //     //   "msg-other-wrap":
                    //     //     chat.type === CHAT_TYPE.NORMAL ||
                    //     //     chat.type === CHAT_TYPE.STICKER,
                    //     //   "msg-other-wrap whisper-msg":
                    //     //     chat.type === CHAT_TYPE.WHISPER,
                    //     //   "msg-center":
                    //     //     chat.type === CHAT_TYPE.WELCOME ||
                    //     //     chat.type === CHAT_TYPE.EXIT ||
                    //     //     chat.type === CHAT_TYPE.GIFT,
                    //     // })}
                    //   >
                    //     {/* {chatDataSelectDeselectSelector &&
                    //       chat.type !== CHAT_TYPE.WELCOME &&
                    //       chat.type !== CHAT_TYPE.EXIT &&
                    //       chat.type !== CHAT_TYPE.GIFT &&
                    //       (chatDataSelectDeselectSelector ===
                    //         HEADER_MENU_SELECTION_TYPE.SELECT ||
                    //         chatDataSelectDeselectSelector ===
                    //         HEADER_MENU_SELECTION_TYPE.SELECT_ALL) ? (
                    //       <div
                    //         className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success"
                    //         style={{ marginTop: "8px" }}
                    //       >
                    //         <input
                    //           type="checkbox"
                    //           className="custom-control-input"
                    //           id={"chat-msg" + chat.id}
                    //           checked={checkedValues.includes(chat.id)}
                    //           onChange={() => handleSelect(chat.id)}
                    //         />
                    //         <label
                    //           className="custom-control-label"
                    //           htmlFor={"chat-msg" + chat.id}
                    //         />

                    //       </div>
                    //     ) : null} */}

                    //     {/* {[
                    //       CHAT_TYPE.NORMAL,
                    //       CHAT_TYPE.WHISPER,
                    //       CHAT_TYPE.STICKER,
                    //     ].includes(chat.type) ? ( */}
                    //       <div className="other-img-wrap">

                    //         {/* {chat &&
                    //           chat.user_details &&
                    //           chat.user_details.avatar.thumb ? (
                    //           // && getBooleanStatus(chat.user_details.avatar && chat.user_details.avatar.visible_avatar ? chat.user_details.avatar.visible_avatar : 0) && chat.user_details.avatar.thumb
                    //           <img
                    //             src={chat.user_details.avatar.thumb}
                    //             alt={chat.user_details.username}
                    //           />
                    //           ) : (*/}
                    //           <span className="chat-avatar">
                    //             {getNameInitials(chat?.sender?.nickname)}
                    //           </span>
                    //         {/*)} */}
                    //       </div>
                    //     {/* ) : null} */}

                    //     {/* {[CHAT_TYPE.NORMAL, CHAT_TYPE.WHISPER].includes(
                    //       chat.type
                    //     ) ? (*/}
                    //       {/* <div className="other-msg">
                    //         {chat.type !== CHAT_TYPE.WHISPER ? (
                    //           <div className="time-stamp">
                    //             <span
                    //               // style={{
                    //               //   color: chat.user_id == userDetails.id ? '#7f7f7f' : getSubscriptionColor(chat.user_id != userDetails.id ? chat.user_details
                    //               //     : null)
                    //               // }}
                    //               style={{
                    //                 color: getSubscriptionColor(
                    //                   chat.user_details
                    //                 ),
                    //               }}
                    //               className={clsx({
                    //                 "my-message": chat.user_id == userDetails.id,
                    //                 "other-message":
                    //                   chat.user_id != userDetails.id,
                    //               })}
                    //             >
                    //               {chat.customize_nickname &&
                    //                 chat.customize_nickname.nickname
                    //                 ? chat.customize_nickname.nickname
                    //                 : chat.user_details.username}
                    //             </span>

                    //             {timeStampToogleSelector && showChatTimestamp ? (
                    //               <span>
                    //                 {" " +
                    //                   getChatTime(chat.created_at)}
                    //               </span>
                    //             ) : null}
                    //           </div>
                    //         ) : null}

                    //         <div className="msg-list wh_message wh_msg_fix">
                    //           {chat.type === CHAT_TYPE.WHISPER ? (
                    //             chat.user_id != userDetails.id ? (
                    //               <h2>
                    //                 <img
                    //                   src="/img/whisper-reply-icon.png"
                    //                   alt="whisper-chat"
                    //                 />
                    //                 From{" "}
                    //                 {chat && chat.user_details
                    //                   ? chat.user_details.username
                    //                   : "--"}
                    //                 {timeStampToogleSelector &&
                    //                   showChatTimestamp ? (
                    //                   <span>
                    //                     {"-" +
                    //                       " " +
                    //                       getChatTime(
                    //                         chat.created_at
                    //                       )}
                    //                   </span>
                    //                 ) : null}
                    //               </h2>
                    //             ) : (
                    //               <h2>
                    //                 <img
                    //                   src="/img/whisper-reply-icon.png"
                    //                   alt="whisper-chat"
                    //                 />
                    //                 To{" "}
                    //                 {chat && chat.to_user_details
                    //                   ? chat.to_user_details.username
                    //                   : "--"}
                    //                 {timeStampToogleSelector &&
                    //                   showChatTimestamp ? (
                    //                   <span>
                    //                     {"-" +
                    //                       " " +
                    //                       getChatTime(
                    //                         chat.created_at
                    //                       )}
                    //                   </span>
                    //                 ) : null}
                    //               </h2>
                    //             )
                    //           ) : null}

                    //           {roomDetailsSelector &&
                    //             roomDetailsSelector.user &&
                    //             roomDetailsSelector.user.room_user_settings &&
                    //             roomDetailsSelector.user.room_user_settings[
                    //             MENU_OPERATIONS.SHOW_INCOMING_TEXT_WITH_FORMAT
                    //             ] ? (
                    //             <p
                    //               dangerouslySetInnerHTML={createMarkup(
                    //                 chat.chat_body
                    //               )}
                    //             />
                    //           ) : chat.chat_body.match(/<img/) ? (
                    //             <p
                    //               dangerouslySetInnerHTML={createMarkup(
                    //                 chat.chat_body
                    //               )}
                    //             />
                    //           ) : chat.user_id != userDetails.id ? (
                    //             <p>{stripHtml(chat.chat_body)}</p>
                    //           ) : (
                    //             <p
                    //               dangerouslySetInnerHTML={createMarkup(
                    //                 chat.chat_body
                    //               )}
                    //             />
                    //           )}
                    //         </div>
                    //       </div> */}
                    //     {/*) : null} */}

                    //     {/* <div className="other-msg">
                    //       {chat.type === CHAT_TYPE.STICKER ? (
                    //         <>
                    //           <div className="time-stamp">
                    //             <span
                    //               style={{
                    //                 color: getSubscriptionColor(
                    //                   chat.user_details
                    //                 ),
                    //               }}
                    //               className={clsx({
                    //                 "my-message": chat.user_id == userDetails.id,
                    //                 "other-message":
                    //                   chat.user_id != userDetails.id,
                    //               })}
                    //             >
                    //               {chat.customize_nickname &&
                    //                 chat.customize_nickname.nickname
                    //                 ? chat.customize_nickname.nickname
                    //                 : chat.user_details.username}
                    //             </span>

                    //             {timeStampToogleSelector && showChatTimestamp ? (
                    //               <span>
                    //                 {" " +
                    //                   getChatTime(chat.created_at)}
                    //               </span>
                    //             ) : null}
                    //           </div>

                    //           <p
                    //             className="message_sticker"
                    //             onContextMenu={(e) => e.preventDefault()}
                    //             dangerouslySetInnerHTML={createMarkup(
                    //               chat.chat_body
                    //             )}
                    //           />
                    //         </>
                    //       ) : null}
                    //     </div> */}

                    //     {/* {[
                    //       CHAT_TYPE.WELCOME,
                    //       CHAT_TYPE.EXIT,
                    //       CHAT_TYPE.GIFT,
                    //     ].includes(chat.type) ? (
                    //       // <strong>
                    //       <p
                    //         dangerouslySetInnerHTML={createMarkup(chat.chat_body)}
                    //       />
                    //     ) : // </strong>
                    //       null} */}
                    //   </div>
                    // );
                  }
                )
              : null}
          </div>
        </div>

        {/* <input className="chat-body-emoji"/> */}
        {stickerEmojiOpen ? (
          <div className="emoji-sticker-box" ref={emojiStickerRef}>
            {isStickerOrEmoji === "emoji" ? (
              <div className="emoji-section">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  emojiStyle={EmojiStyle.APPLE}
                />
              </div>
            ) : (
              <div className="sticker-section">
                <div className="sticker-head">
                  <div className="left-head">
                    <Slider {...settings}>{renderSlides()}</Slider>
                  </div>
                  <div className="right-head">
                    {/* <a href="#" data-toggle="modal" data-target="#newSticker"><i className="bx bx-plus"></i></a> */}
                    <a href="#" onClick={(e) => openStickerBuyModal(e)}>
                      <i className="bx bx-plus"></i>
                    </a>
                  </div>
                </div>
                <div className="sticker-body">
                  {categorywiseSticker && categorywiseSticker.length ? (
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
                className={isStickerOrEmoji == "emoji" ? "active" : ""}
                onClick={(e) => handleEmojiSticker(e, "emoji")}
              >
                <i className="fas fa-smile"></i>
              </a>
              <a
                href="#"
                className={isStickerOrEmoji == "sticker" ? "active" : ""}
                onClick={(e) => handleEmojiSticker(e, "sticker")}
              >
                <i className="fas fa-sticky-note"></i>
              </a>
            </div>
          </div>
        ) : null}
        {textEditorSelector ? (
          <div className="toolbar-container">
            <ul className="chat-toolbar">
              <li>
                <select
                  onChange={(event) => handleChangeFont(event, false)}
                  value={
                    // settingSaveOrNot === 1 || checkCovid === 1
                    //   ?
                    apiObject.fontFamily
                    // : testObject.fontFamily
                  }
                >
                  <option value="">Select</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Lato">Lato</option>
                  <option value="MonteCarlo">MonteCarlo</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                  <option value="Open Sans">Open Sans</option>
                </select>
              </li>
              <li>
                {/* <span onClick={() => handleTextDecoration('bold', undefined)}>Bold</span> */}
                <a
                  href="#"
                  onClick={(e) => handleTextDecoration(e, "bold", undefined)}
                >
                  B
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => handleTextDecoration(e, "italic", undefined)}
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
                <select
                  onChange={(event) => {
                    handleFontSize(event, false);
                  }}
                  value={
                    // settingSaveOrNot == 1 || checkCovid == 1
                    //   ?
                    apiObject.fontSize
                    // : testObject.fontSize
                  }
                >
                  <option value="">Select</option>
                  <option value="10px">Small</option>
                  <option value="20px">Normal</option>
                  <option value="30px">Large</option>
                  <option value="40px">Huge</option>
                </select>
              </li>

              <li>
                <ColorPicker
                  // color={testObject.color}
                  color={
                    // settingSaveOrNot == 1 || checkCovid == 1
                    //   ?
                    apiObject.color
                    // : testObject.color
                  }
                  alpha={30}
                  onChange={(color: any) => changeHandler(color, false)}
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
        <div
          className={
            roomDetailsSelector &&
            roomDetailsSelector.user &&
            roomDetailsSelector.user.room_user_status &&
            roomDetailsSelector.user.room_user_status.red_dot_text
              ? "disable-link compose-box"
              : "compose-box"
          }
        >
          <div className="com-action-left">
            <a href="#" onClick={(e) => handleOpenToolBar(e)}>
              <img src="/img/text-icon.png" alt="text-icon" />
            </a>
            <a href="#" onClick={(e) => openStickerBuyModal(e)}>
              <img src="/img/gift-icon.png" alt="" />
            </a>
            <a
              href="#"
              ref={emojiStickerBtnRef}
              onClick={(e) => openStickerBox(e)}
            >
              <img src="/img/sticker-icon.png" alt="" />
            </a>

            {/* <a href="#" onClick={(e) => e.preventDefault()}><img src="/img/translate-icon.png" alt="" /></a>
                        <a href="#" onClick={(e) => e.preventDefault()}><img src="/img/auto-correct-icon.png" alt="" /></a> */}
          </div>
          {/* <div>{settingSaveOrNot}</div> */}

          <div className="com-text-box">
            {/* <div
              contentEditable="true"
              className="room-chat-content-editable"
              suppressContentEditableWarning={true}
              // onChange={chatHandleChange}
            >
              {chatTextRef.current}
            </div> */}

            <ContentEditable
              // tagName="pre"
              innerRef={contentEditableFocus}
              html={chatTextRef.current}
              onBlur={chatHandleBlur}
              disabled={
                roomDetailsSelector &&
                roomDetailsSelector.user &&
                roomDetailsSelector.user.room_user_status &&
                roomDetailsSelector.user.room_user_status.red_dot_text
                  ? true
                  : false
              }
              onChange={chatHandleChange}
              onKeyDown={chatOnKeyDown}
              className="room-chat-content-editable"
              spellCheck
              onFocus={handleEditorChange}
              style={
                // settingSaveOrNot == 1 || checkCovid == 1
                //   ?
                apiObject
                // : testObject
              }
              // style={testObject}
            />
            <input
              type="hidden"
              ref={roomValue}
              id="roomid"
              className="chat-emoji-body"
              value={
                roomDetailsSelector && roomDetailsSelector.room
                  ? roomDetailsSelector.room.id
                  : 0
              }
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
              // disabled={chatTextRef.current == "" ? false : true}
            >
              <img src="/img/sent-msg-icon.png" alt="" />
            </button>
          </div>
        </div>

        <div className="bottom-btns-wrap">
          <a href="#" onClick={(e) => gotoGroupAndCategoryPage(e)}>
            <img src="/img/group-icon.png" alt="" /> Groups &amp; Category
          </a>
          {
            // roomDetailsSelector && roomDetailsSelector.room && roomDetailsSelector.room.join_status && [0].includes(roomDetailsSelector.room.join_status.is_admin) && roomDetailsSelector.room_setting &&
            //     roomDetailsSelector.room_setting.disable_invitation ? null :
            <a
              href="#"
              onClick={handleInviteToRoom}
              // className={clsx({
              //   "disable-link":
              //     roomDetailsSelector &&
              //     roomDetailsSelector.room &&
              //     roomDetailsSelector.room.join_status &&
              //     // [0].includes(roomDetailsSelector.room.join_status.is_admin) &&
              //     roomDetailsSelector.room_setting &&
              //     roomDetailsSelector.room_setting.disable_invitation,
              // })}

              className={
                roomDetailsSelector?.room_owner?.user_id == sb_user_id ||
                roomDetailsSelector?.room?.room_category_id != 5
                  ? ""
                  : "disable-link"
              }
            >
              <img src="/img/add-member-icon.png" alt="" />
              Invite
            </a>
          }
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{ pointerEvents: "none" }}
          >
            <img src="/img/lets-do-icon.png" alt="" /> Let's Do
          </a>
          <a href="#" onClick={searchGoogle}>
            <img src="/img/google-search-icon.png" alt="" /> Search in Google
          </a>
          {/* <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // handlePdfDownload()
              makePdf();
            }}
          >
            <img src="/img/google-search-icon.png" alt="" /> DownPdf
          </a> */}
          {/* <a href="#" onClick={(event) => handleItemClick(event, HEADER_MENU_SELECTION_TYPE.COPY)}>
           Copy
          </a>
          <a href="#"onClick={(event) => handleItemClick(event, HEADER_MENU_SELECTION_TYPE.PASTE)}>
           Paste
          </a> */}
        </div>
      </div>

      {showInviteToRoomModal && (
        <InviteToRoomModal
          shouldShow={showInviteToRoomModal}
          onClose={() => setShowInviteToRoomModal(false)}
          getParams={inviteToRoom}
        />
      )}

      {shareWithOtherContactListSelector.isOpen && (
        <ShareWithContactListModal
          shouldShow={shareWithOtherContactListSelector.isOpen}
        />
      )}

      {showWhisperMessageModal ? (
        <SendWhisperMessageModal
          onClose={whisperMessageModalClose}
          shouldShow={showWhisperMessageModal}
          fetchData={membersData}
        />
      ) : null}

      {showStickerBuyModal ? (
        <StickerBuyModal
          onClose={handleOnCloseSticker}
          shouldShow={showStickerBuyModal}
          byModalType={byStickerModalType} //ownStickerBuy or giftSendStickerBuy
          selectedContactList={selectedContactList}
          entityId={roomId}
          type={"room"}
        />
      ) : null}

      {showContactListModal ? (
        <ContactListForGiftModal
          onClose={contactListCloseModal}
          onSuccess={openGiftSticker}
          shouldShow={showContactListModal}
          type={"stickerGiftSend"}
        />
      ) : null}
    </React.Fragment>
  );
}

export default ChatWindowComponent;
