import MetisMenu from "@metismenu/react";
import React, { useEffect, useState } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import SendBirdCall from "sendbird-calls";

import clsx from "clsx";
import { contextMenu } from "react-contexify";
import { Link, NavLink, useHistory, useParams } from "react-router-dom";
import { useToaster } from "src/_common/hooks/actions/common/appToasterHook";
import { useAppGroupCategoryAction } from "src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import { useAppPmWindowAction } from "src/_common/hooks/actions/pmWindow/appPmWindowActionHook";
import { usePmWindowApi } from "src/_common/hooks/actions/pmWindow/appPmWindowApiHook";
import { useAppUserAction } from "src/_common/hooks/actions/user/appUserActionHook";
import { useUserApi } from "src/_common/hooks/actions/user/appUserApiHook";
import {
  useAppAmountSelector,
  useAppInstanceInvitedUsers,
  useAppLeftMenuItemListSelector,
  useAppRoomDetailsSelector,
} from "src/_common/hooks/selectors/groupCategorySelector";
import { useAppNotebookList } from "src/_common/hooks/selectors/notebookSelector";
import { usePmDigSoundSelector } from "src/_common/hooks/selectors/pmWindowSelector";
import {
  useAppLoggedinFromOtherLocation,
  useAppUserDetailsSelector,
} from "src/_common/hooks/selectors/userSelector";
import {
  RemoveSingleNotification,
  UpdateShowHideProfilePicture,
} from "src/_common/interfaces/ApiReqRes";
import {
  API_BASE_URL,
  APP_VERSION,
  CRYPTO_SECRET_KEY,
  CUSTOM_MESSAGE,
  LOGIN_STORAGE,
  MENU_OPERATIONS,
  PM_TYPE,
  SENDBIRD_APP_ID,
  STORAGE,
  URLS,
  getAvailabiltyStatusText,
  getBooleanStatus,
  getNameInitials,
  getStatusColor,
  getSubscriptionColor,
  getValueFromArrayOfObject,
  trimTo,
} from "src/_config";
import StickerBuyModal from "src/components/commonModals/stickerBuyModal/stickerBuyModal";
import ViewProfileModal from "src/components/commonModals/viewProfileModal/viewProfileModal";
import SocketLoader from "src/socket/socketLoader";
import LeftBarPersonContextMenu from "../clickContextMenu/leftbarPersonContextMenu";
import StatusToggleMenu from "../clickContextMenu/profileStatusContextMenu";
import CustomizedNicknameModal from "../groupsCategory/roomsDetail/modal/customizedNicknameModal";
// import { AntmediaContext } from 'src';
import { useDispatch } from "react-redux";
import { updateAmount } from "src/_common/hooks/actions/common/appAmountHook";

import axios from "axios";
import { FaGift } from "react-icons/fa";
import { useAppNotificationAction } from "src/_common/hooks/actions/notification/appNotificationActionHook";
import { useNotificationApi } from "src/_common/hooks/actions/notification/appNotificationApiHook";
import {
  useCallContext,
  useNotificationsContext
} from "src/hooks";
import CustomSweetAlert from "../pm-room/customSweetAlert";
import SideBarBanner from "./sidebarBanner";
const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

function Sidebar() {
  const history = useHistory();
  const [alert, setAlert] = useState<any>(null);
  const userSelector = useAppUserDetailsSelector();
  const loggedInFromOtherLocation = useAppLoggedinFromOtherLocation();
  const userAction = useAppUserAction();
  const groupCategoryAction = useAppGroupCategoryAction();
  const notebookListSelector: any = useAppNotebookList();
  const leftMenuItemDetails = useAppLeftMenuItemListSelector();
  const instanceInvitedUsersSelector = useAppInstanceInvitedUsers();
  const groupCategoryApi = useGroupCategoryApi();
  const notificationAPi = useNotificationApi();
  const notificationAction = useAppNotificationAction();
  const pmWindowApi = usePmWindowApi();
  const pmWindowAction = useAppPmWindowAction();
  const userApi = useUserApi();
  const toast = useToaster();
  const [membersData, setMembersData] = useState<any>();
  // const [currentUser, setCurrentUser] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [loginUsersData, setLoginUsersData] = useState<any>();
  // const [isContactSelected, setIsContactSelected] = useState<any>();
  const [isSelected, setIsSelected] = useState<any>();
  const [isLoginUser, setIsLoginUser] = useState<boolean>(false);
  const [noteBookNewCount, setNotebookNewCount] = useState<number>(0);
  const [selectedUserId, setSelectedUserId] = useState<number>();
  // const [showRoomInvitationModal, setShowRoomInvitationModal] =
  // useState<boolean>(false);
  const [showStickerBuyModal, setShowStickerBuyModal] =
    useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<any[]>([]);
  const [onlineUserCount, setOnlineUserCount] = useState<number>(1);

  const [showNow, setShowNow] = useState(false);

  const [invitationRec, setInvitationRec] = useState<any>(null);

  const [showCustomizedNicknameModal, setCustomizedNicknameModal] =
    useState<boolean>(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [isGiftAccepted, setIsGiftAccepted] = useState(false);
  const [acceptedNotification, setacceptedNotification] = useState<any>(null);
  const [userDetail, setUserDetail] = useState();
  const [activerooms, SetActiveRooms] = useState<any>();

  const value = localStorage.getItem(LOGIN_STORAGE?.SIGNED_IN_AS);
  // const {
  //   id: signedInUserId,
  //   send_bird_user: { sb_access_token },
  // } = value ? JSON.parse(value) : "";
  const data= value ? JSON.parse(value) : '';
    const { sb_access_token, sb_user_id } = data?.send_bird_user;
 
  const authOption: any = {
    userId: sb_user_id,
    accessToken: sb_access_token,
  };
  

  const {
    openCall,
    openAudioCall,
    audioAccess,
    videoAccess,
    setAudioAccess,
    setVideoAccess,
    setOpenCall,
    callRoom,
    microphoneState,
    setShowAlert,
    showAlert: showAlerts,
    setOpenAudioCall,
    audioCallRoom,
    acceptedFromInvite,
    setAcceptedFromInvite,
    setCallAcceptType,
  } = useCallContext();

  const { groupId, roomId } = useParams<any>();

  const pmWindowDigSoundSelector = usePmDigSoundSelector();
  const roomDetailsSelector = useAppRoomDetailsSelector();
  const amountSelector = useAppAmountSelector();
  // const antmedia = useContext<any>(AntmediaContext);

  const [ActiveRoomData, setActiveRoomData] = useState<any>();

  const {
    isAlert,
    setIsAccepted,
    giftRec,
    setIsAlert,
    pmInviteData,
    isPmAlert,
    setIsPmAlert,
    RoomInviteData,
    isRoomAlert,
    setIsRoomAlert,
    offlineUserStatus,
    setOfflineUserStatus,
    onlineUserStatus,
    setOnlineUserStatus,
    giftAcceptedNotification,
    setGiftAcceptedNotification,
  } = useNotificationsContext();

  const [usersGift, setUsersGift] = useState<any[]>([]);

  const dispatch = useDispatch();
  const usertoken = localStorage.getItem(STORAGE);
  useEffect(() => {
    if (giftAcceptedNotification && usertoken) {
      setacceptedNotification(giftAcceptedNotification);
      // setIsGiftAccepted(true)
    }
  }, [giftAcceptedNotification]);

  useEffect(() => {
    if (acceptedNotification && usertoken) {
      setIsGiftAccepted(true);
    } else {
      setacceptedNotification(null);
    }
  }, [acceptedNotification]);

  const handleCloseModal = () => {
    setIsGiftAccepted(false);
    acceptedGiftNotification(null, giftAcceptedNotification.id);
  };

  const acceptedGiftNotification = (e: any, id: number) => {
    if (e) {
      e.preventDefault();
    }
    const params: RemoveSingleNotification = {
      record_id: id,
    };
    notificationAPi.callRemoveSingleNotification(
      params,
      (message: string, resp: any) => {
        if (resp) {
          notificationAction.removeSingleNotification(id);
          setacceptedNotification(null);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const customizedNicknameModalClose = () => {
    if (showCustomizedNicknameModal) {
      setMembersData(null);
      setCustomizedNicknameModal(false);
    }
  };

  const handleViewProfile = (id: number) => {
    setSelectedUserId(id);
    setShowProfileModal(true);
  };

  const onViewProfileModalClose = () => {
    setShowProfileModal(false);
  };

  const addUserAsFavouriteFromContact = (id: number) => {
    const params = {
      contact_user_id: id,
    };
    groupCategoryApi.callAddUserAsFavouriteFromContact(
      params,
      (message: string, resp: any) => {
        if (resp) {
        }
      },
      (message: string) => {
        console.error("Error at add as favourite contact");
      }
    );
  };

  const handleEnterRoom = (data: any) => {
    if (data.contact_user.visible_status == 3) {
      return;
    } else {
      groupCategoryAction.emptyRoomDetails();
      groupCategoryAction.fromRouteHandler(data.first_room.room_details.id);
      const groupId = cryptr.encrypt(data.first_room.room_details.group_id);
      const roomId = cryptr.encrypt(data.first_room.room_details.id);
      // history.replace("");
      history.push(`${groupId}/${roomId}/room-details`);
    }
  };
  const handleAddToBlockList = (id: number) => {
    if (id === userSelector?.id) {
      toast.error(CUSTOM_MESSAGE.OTHERS.BLOCK_HIMSELF);
    } else {
      const params = {
        block_user_id: id,
      };
      groupCategoryApi.callAddToBlockList(
        params,
        (message: string, resp: any) => {
          if (resp) {
          }
        },
        (message: string) => {
          console.error("Error at add to block list");
        }
      );
    }
  };
  useEffect(() => {
    const findonlineContactUser = leftMenuItemDetails?.online_users?.find(
      (x: any) => {
        return x?.contact_user_id == onlineUserStatus;
      }
    );
    if (findonlineContactUser) {
      const { alerts_and_sounds } = userSelector || {};
      const {
        contact_comes_online_alert,
        disable_sounds,
        always_play_sound,
        customize_sound_contact_online,
        customize_sound_contact_online_file_id,
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
      if (always_play_sound == 1 && contact_comes_online_alert == 1) {
        let sound = null;
        if (customize_sound_contact_online == 0) {
          const audio = customized_sounds?.find(
            (x: any) => x?.user_id == 0 && x?.is_default == 1
          );
          sound = new Audio(audio?.sound?.original);
        } else if (customize_sound_contact_online == 1) {
          const audio = customized_sounds?.find(
            (x: any) => customize_sound_contact_online_file_id == x?.id
          );
          sound = new Audio(audio?.sound?.original);
        }

        if (sound) {
          sound.play().catch((error) => {
            console.error("Error playing sound:", error);
          });
        }
        setOnlineUserStatus(0);
      }
    }
  }, [
    leftMenuItemDetails,
    userSelector,
    onlineUserStatus,
    openCall,
    openAudioCall,
    microphoneState,
  ]);

  useEffect(() => {
    const findOffileContactUser = leftMenuItemDetails?.offline_users?.find(
      (x: any) => {
        return x?.contact_user_id == offlineUserStatus;
      }
    );
    if (findOffileContactUser) {
      const { alerts_and_sounds } = userSelector || {};
      const {
        contact_goes_offline_alert,
        disable_sounds,
        always_play_sound,
        customize_sound_contact_offline,
        customize_sound_contact_offline_file_id,
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
      if (always_play_sound == 1 && contact_goes_offline_alert == 1) {
        let sound = null;
        if (customize_sound_contact_offline == 0) {
          const audio = customized_sounds?.find(
            (x: any) => x?.user_id == 0 && x?.is_default == 1
          );
          sound = new Audio(audio?.sound?.original);
        } else if (customize_sound_contact_offline == 1) {
          const audio = customized_sounds?.find(
            (x: any) => customize_sound_contact_offline_file_id == x?.id
          );
          sound = new Audio(audio?.sound?.original);
        }

        if (sound) {
          sound.play().catch((error) => {
            console.error("Error playing sound:", error);
          });
        }
        setOfflineUserStatus(0);
      }
    }
  }, [
    leftMenuItemDetails,
    userSelector,
    offlineUserStatus,
    openCall,
    openAudioCall,
    microphoneState,
  ]);

  useEffect(() => {
    if (
      leftMenuItemDetails &&
      leftMenuItemDetails.online_users &&
      leftMenuItemDetails.online_users.length &&
      leftMenuItemDetails.show_room_i_am_in_options &&
      leftMenuItemDetails.show_room_i_am_in_options.show_room_i_am_in_options
    ) {
      dispatch(
        updateAmount(
          leftMenuItemDetails.show_room_i_am_in_options
            .show_room_i_am_in_options
        )
      );
      leftMenuItemDetails.online_users.forEach((element: any) => {
        setOnlineUserCount(1);
        setTimeout(() => {
          if (element.is_bloked_by_them == null) {
            setOnlineUserCount((prev) => prev + 1);
          }
        }, 500);
      });
    } else {
      setOnlineUserCount(1);
    }
  }, [leftMenuItemDetails, dispatch]);

  //Function for click on send pm
  const handleSendPm = async (id: string) => {
    const params = {
      user_id: +id,
    };

    if (id) {
      // const encryptedRoomUrl = cryptr.encrypt(id);
      // if(encryptedRoomUrl) {
      //   history.push(`/pm/${encryptedRoomUrl}`)
      // }
    } else {
      toast.error("No current room available");
    }

    await pmWindowApi.callSendPms(
      params,
      async (message: string, resp: any) => {
        if (resp) {
          setUserDetail(resp);
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
  };

  const handleRedirectToPm = (id: number) => {
    // if (antmedia.publishStreamId) antmedia.handleLeaveFromRoom();

    const params = {
      pm_id: id,
    };
    pmWindowApi.callReadPm(
      params,
      (message: string, resp: any) => {
        if (resp) {
          const pmId = cryptr.encrypt(id);
          pmWindowAction.fromRouteHandler(id);
          // history.replace("");
          history.push(`/pm/${pmId}`);
        } else {
          toast.error(message);
        }
      },
      (message: string, resp: any) => {
        toast.error(message);
      }
    );
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const showAlert = (e: React.MouseEvent, userId: any) => {
    e && e.preventDefault();
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
        onConfirm={() => removeFavourite({ contact_user_id: userId })}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        Are you sure to remove from favourite contact list?
      </SweetAlert>
    );
  };

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

  // right click context menu

  const onContextMenuClick = (e: any, profile: any) => {
    e.preventDefault();
    setMembersData(profile);
    setLoginUsersData(userSelector);
    setIsLoginUser(false);

    // if (!profile.is_block) {
    //   if (!(profile.contact_user.id === userSelector?.id)) {
    contextMenu.show({
      id: "menu_id",
      event: e,
      props: {
        profile: profile,
      },
    });
    //   }
    // }
  };

  const onSelfContextMenuClick = (e: any, profile: any) => {
    e.preventDefault();
    setMembersData(profile);
    setLoginUsersData(profile);
    setIsLoginUser(true);
    contextMenu.show({
      id: "menu_id",
      event: e,
      props: {
        profile: profile,
      },
    });
  };

  const contextMenuOperationParams = (data: {
    id: number;
    userName: string;
    customize_nickname: any;
    operation: string;
  }) => {
    switch (data.operation) {
      case MENU_OPERATIONS.SEND_PM:
        handleSendPm(data.id.toString());
        break;
      case MENU_OPERATIONS.VIEW_PROFILE:
        handleViewProfile(data.id);
        break;
      case MENU_OPERATIONS.ADD_TO_FAVOURITE_CONTACT:
        addUserAsFavouriteFromContact(data.id);
        break;
      case MENU_OPERATIONS.SEND_VIRTUAL_GIFT:
        openStickerBuyModal(data.id);
        break;

      case MENU_OPERATIONS.SEND_GIFT_SUBSCRIPTION:
        openStickerBuyModal(data.id);
        break;
      case MENU_OPERATIONS.SEND_VIRTUAL_CREDIT:
        openStickerBuyModal(data.id);
        break;

      case MENU_OPERATIONS.CUSTOMIZED_NICKNAME:
        setCustomizedNicknameModal(true);
        setMembersData({
          id: data.id,
          userName: data.userName,
          customize_nickname: data.customize_nickname,
        });
        break;
      case MENU_OPERATIONS.ADD_TO_BLOCK_LIST:
        handleAddToBlockList(data.id);
        break;
      case MENU_OPERATIONS.REMOVE_FROM_CONTACT_LIST:
        handleRemoveFromContact(data.id);
        break;
      default:
        break;
    }
  };

  const handleRemoveFromContact = (id: any) => {
    let selectedUsers: any;
    let user: any;
    user = leftMenuItemDetails.favourite_contact.filter(
      (user: any) => user.contact_user_id === id
    );

    if (!user.length) {
      user = leftMenuItemDetails.offline_users.filter(
        (user: any) => user.contact_user_id === id
      );
    }

    if (!user.length) {
      user = leftMenuItemDetails.online_users.filter(
        (user: any) => user.contact_user_id === id
      );
    }

    user = user[0];

    if (user) {
      selectedUsers =
        user.customize_nickname && user.customize_nickname.nickname
          ? user.customize_nickname.nickname
          : user && user.contact_user
          ? user.contact_user.username
          : "--";
    }

    if (user && selectedUsers) {
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
          title="Remove User"
          onConfirm={() =>
            removeFromContactList(user, selectedUsers.toString())
          }
          onCancel={hideAlert}
          focusCancelBtn={true}
        >
          {`Are you sure you want to remove (${selectedUsers.toString()}) from your Contact List?`}
        </SweetAlert>
      );
    }
  };

  const removeFromContactList = (user: any, username: string | null) => {
    hideAlert();

    const params = {
      contact_user_id: user.contact_user_id,
      user_id: user.user_id,
    };

    groupCategoryApi.callRemoveFromContactList(
      params,
      (message: string, resp: any) => {
        if (resp) {
          toast.success(
            `${username} has been successfully removed from your Contact List`
          );
          // handleChangeAccount({
          //   label: selctedAccount,
          //   value: selctedAccount
          // })
        }
      },
      (message: string) => {
        console.error("Error at remove from contact list");
      }
    );
  };

  const statusToggle = (e: any, status: any) => {
    contextMenu.show({
      id: "status_toggle_id",
      event: e,
      props: {
        status: status,
      },
    });
  };

  const toggleShowHideProfilePicture = (e: any) => {
    const params: UpdateShowHideProfilePicture = {
      avatar_visible: e == true ? 1 : 0,
    };

    userApi.callUpdateProfilePictureShowHide(
      params,
      (message: string, resp: any) => {
        if (resp) {
          toast.success(message);
        } else {
          toast.error(message);
        }
      },
      (message: string, resp: any) => {
        toast.error(message);
      }
    );
  };

  const getLeftMenuItemsList = () => {
    groupCategoryApi.callLeftMenuItemsList(
      (message: string, resp: any) => {
        if (resp && resp.data) {
          const newAmount =
            resp.data.show_room_i_am_in_options.show_room_i_am_in_options;
          dispatch(updateAmount(newAmount));
        }
      },
      (message: string) => {
        // toast.error(message)
      }
    );
  };

  const removeFavourite = (params: any) => {
    // e.preventDefault();
    // const params = {
    //   contact_user_id: id
    // }
    groupCategoryApi.callRemoveFavouriteContact(
      params,
      (message: string, resp: any) => {
        if (resp) {
          hideAlert();
          getLeftMenuItemsList();
        }
      },
      (message: string) => {
        hideAlert();
      }
    );
  };

  useEffect(() => {
    getLeftMenuItemsList();
  }, []);

  //Used for notebook Un read message count
  useEffect(() => {
    if (notebookListSelector && notebookListSelector.length) {
      let count = notebookListSelector.filter(
        (note: any) => note.is_viewed === 0
      );
      if (count && count.length) {
        setNotebookNewCount(count.length);
      }
    }
  }, [notebookListSelector]);

  //Instance Invited Users Selector Update effect
  // useEffect(() => {
  //   if (instanceInvitedUsersSelector && instanceInvitedUsersSelector.length) {
  //     instanceInvitedUsersSelector.map((x: any) => {
  //       if (x.id == (userSelector && userSelector.id)) {
  //         toast.error(x.msg)
  //       }
  //     })
  //   }
  // }, [instanceInvitedUsersSelector])

  const LogOut = () => {
    localStorage.removeItem(STORAGE);
    localStorage.setItem("isAdult", "0");
    groupCategoryAction.emptyRoomListCategoryWise();
    userAction.loggedInFromOtherLocation(null);
    userAction.logout();
    history.push(URLS.LOGIN);
  };

  useEffect(() => {
    if (loggedInFromOtherLocation) {
      if (userSelector?.id === loggedInFromOtherLocation?.user_id) {
        setAlert(
          <SweetAlert
            warning
            // showCancel
            confirmBtnText="Ok"
            // cancelBtnText="No"
            // cancelBtnBsStyle="danger"
            confirmBtnBsStyle="success"
            allowEscape={false}
            closeOnClickOutside={false}
            title="Alert"
            onConfirm={() => LogOut()}
            // onCancel={hideAlert}
            // focusCancelBtn={false}
          >
            {loggedInFromOtherLocation.message}
          </SweetAlert>
        );
      }
    }
  }, [loggedInFromOtherLocation, userSelector]);

  const getPrivacySettingsRoomIamInOptions = (settings: any[]) => {
    for (let i = 0; i < settings.length; i++) {
      let val = settings[i].val ? settings[i].val : "";
      return val;
    }
  };

  //Dig Sound notification

  const playSound = () => {
    const audio = new Audio(pmWindowDigSoundSelector.sound.sound.thumb);
    audio.play();
  };

  const getActiveRoom = () => {
    groupCategoryApi.callGetMyActiveRooms(
      (message: string, resp: any) => {
        SetActiveRooms(resp.active_rooms);
        const arr = resp.active_rooms;
        const last = arr[arr.length - 1];
        setActiveRoomData(last);
      },
      (message: string) => {}
    );
  };

  useEffect(() => {
    if (
      pmWindowDigSoundSelector &&
      pmWindowDigSoundSelector.sound &&
      pmWindowDigSoundSelector.sound.sound &&
      pmWindowDigSoundSelector.sound.sound.original
    ) {
      if (
        pmWindowDigSoundSelector &&
        pmWindowDigSoundSelector.users &&
        pmWindowDigSoundSelector.users.length
      ) {
        toast.success(pmWindowDigSoundSelector.users[0].message);
      }
      setTimeout(() => {
        var soundButton = document.getElementById("playSoundBtn");
        if (soundButton) {
          soundButton.click();
        }
      }, 150);

      setTimeout(() => {
        pmWindowAction.digSoundSocketData(null);
      }, 300);
    }

    getActiveRoom();
  }, [pmWindowDigSoundSelector]);
  useEffect(() => {
    getActiveRoom();
  }, []);

  const userId = userSelector && userSelector.id ? userSelector.id : 0;
  // const amount = useSelector((state: RootStateOrAny) => state.amount);
  const amount: any = amountSelector.amount;

  let appId: string = SENDBIRD_APP_ID;

  useEffect(() => {
    (async () => {
      SendBirdCall.init(appId);
      SendBirdCall.authenticate(authOption, async (result, error) => {
        if (error) {
          toast.error("Authentication failed for SendBirdCall");
        } else {
          try {
            await SendBirdCall.connectWebSocket();
          } catch (error) {}
        }
      });

      SendBirdCall.addListener("", {
        onInvitationReceived: async (invitation) => {
          debugger; // 2
          setInvitationRec(invitation);

          setShowNow(true);
        },
      });
    })();

    return () => {
      try {
        callRoom?.removeAllEventListeners();
        audioCallRoom?.removeAllEventListeners();
      } catch (error) {}
    };
  }, []);

  const handleRemoveSingleNotification = (e: any, id: number) => {
    if (e) {
      e.preventDefault();
    }
    const params: RemoveSingleNotification = {
      record_id: id,
    };
    notificationAPi.callRemoveSingleNotification(
      params,
      (message: string, resp: any) => {
        if (resp) {
          notificationAction.removeSingleNotification(id);
          setIsRoomAlert(false);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  // Accept-Reject Gift Invitation Handling
  const handleAcceptGift = async (
    notificationId: number,
    accepted: boolean
  ) => {
    setIsAlert(false);
    // handleRemoveSingleNotification(null, notificationId)
    let URL: any;
    switch (giftRec?.for) {
      case "subscription":
        URL = API_BASE_URL + "subscription/accept/gift";
        break;
      case "sticker":
        URL = API_BASE_URL + "stickers/accept/gift";
        break;
      case "virtual_credit_gift":
        URL = API_BASE_URL + "virtual/gift/credit/accept";
        break;

      default:
        break;
    }

    if (URL) {
      const token = JSON.parse(
        localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_TOKEN) as string
      );
  
      try {
        const response = await axios.post(URL, {
          invitation_id: giftRec?.gift_invite_id,
          accepted: accepted,
        }, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (response.status === 200) {
          const data = response.data;
          toast.success(data.message);
          setTimeout(() => {
            // setIsAlert(false);
            handleRemoveSingleNotification(null, +notificationId);
            if (!roomId && !groupId) {
              window.location.reload();
            }
          }, 1000); 
        } else {
          toast.error("Failed to accept gift.");
        }
      } catch (error) {
        toast.error("An error occurred while processing the request.");
      }
    }
  };
    // const formData: FormData = new FormData();

    // formData.append("invitation_id", giftRec?.gift_invite_id);
    // formData.append("accepted", accepted.toString());
    // const token = JSON.parse(
    //   localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_TOKEN) as string
    // );

    // const resp = await fetch(URL, {
    //   method: "POST",
    //   body: formData,
    //   headers: {
    //     Accept: "application/json",
    //     authorization: `Bearer ${token}`,
    //   },
    // });
    // const data = await resp.json();
    
  //   if (data?.status == 200) {
  //     toast.success(data?.message);
  //     setIsAlert(false);
  //     handleRemoveSingleNotification(null, +notificationId);
  //     if (!roomId && !groupId) {
  //       window.location.reload();
  //     }
  //   } else {
  //     toast.error(data?.message);
  //   }
  // };

  // const handleRejectGift = async (notificationId: number) => {
  //   setIsAlert(false);
  //   handleRemoveSingleNotification(null, +notificationId);
  // };

  useEffect(() => {
    if (isAlert) {
      setIsCheckboxChecked(false); // Reset checkbox state when popup opens
    }
  }, [isAlert]);

  const handleAcceptJoinPmInvitation = async (
    notificationId: number,
    pm_id: number,
    accepted: boolean
  ) => {
    handleRemoveSingleNotification(null, +notificationId);
    const params = {
      pm_id: pm_id,
      accepted: accepted,
    };

    pmWindowApi.callAddMemberIntoPmWindow(
      params,
      (message: string, resp: any) => {
        if (resp) {
          const pmId = cryptr.encrypt(pm_id);
          pmWindowAction.fromRouteHandler(pmId);
          history.push(`/pm/${pmId}`);
          setIsPmAlert(false);
        } else {
          toast.error(message);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handleShowAlert = (
    exit_room: number,
    roomId: number,
    groupId: number,
    activeRoomId: number
  ) => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Ok"
        cancelBtnText="Cancel"
        cancelBtnBsStyle="danger"
        confirmBtnBsStyle="success"
        allowEscape={false}
        closeOnClickOutside={false}
        title="Alert"
        onConfirm={() => joinRoom(exit_room, roomId, groupId, activeRoomId)}
        focusCancelBtn={true}
      >
        You have a basic nickname, you cannot be in more than one voice room
        simultaneously, you will exit the current room automatically. Do you
        want to proceed?
      </SweetAlert>
    );
  };

  const handleShowAlerts = (exit_room: number) => {
    setAlert(
      <SweetAlert
        warning
        confirmBtnText="Ok"
        cancelBtnText="Cancel"
        cancelBtnBsStyle="danger"
        confirmBtnBsStyle="success"
        allowEscape={false}
        closeOnClickOutside={false}
        title="Alert"
        onConfirm={() => redirecttoactiveRooms()}
        focusCancelBtn={true}
      >
        <p>
          You have reached your room joining limit. You need to exit the room to
          join a new one.
        </p>
      </SweetAlert>
    );
  };

  const redirecttoactiveRooms = () => {
    // onClose(true);
    groupCategoryAction.activeRoomsPopDownHandler(true);
    setAlert(null);
  };
  const joinRoom = (
    exit_room: number,
    roomId: number,
    groupId: number,
    activeRoomId: number
  ) => {
    history.replace("");

    history.push(`${groupId}/${roomId}/room-details`);

    setTimeout(() => {
      handleExitRoom(activeRoomId);
    }, 1000);
  };

  const handleExitRoom = (data: any) => {
    var params = {
      room_id: data,
    };
    groupCategoryApi.callExitFromRoom(
      params,
      (message: string, resp: any) => {
        getActiveRoom();
        toast.success(message);
        // if (r_id == data) {
        //     history.replace('');
        //     history.push(`groups`);
        // }

        window.location.reload();
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handleAcceptJoinInvitation = async (
    notificationId: number,
    g_id: number,
    r_id: number
  ) => {
    setIsRoomAlert(false);
    const groupId = cryptr.encrypt(g_id);
    const roomId = cryptr.encrypt(r_id);

    const invitedCode: any = JSON.parse(RoomInviteData?.user[0]?.data);

    if (invitedCode) {
      CheckInvitation(invitedCode, notificationId, roomId, groupId);
    } else {
      let SimultaneousRoom = userSelector?.is_subscribed?.feature.filter(
        (x: any) => x.type == "simultaneous_room"
      );

      if (SimultaneousRoom) {
        if (activerooms?.length > SimultaneousRoom[0]?.value) {
          handleShowAlerts(1);
        } else {
          history.replace("");
          history.push(`${groupId}/${roomId}/room-details`);
          setIsRoomAlert(false);
          localStorage.setItem("isAdminlock", "true");
          handleRemoveSingleNotification(null, +notificationId);
        }
      } else {
        if (activerooms?.length > 0) {
          handleShowAlert(1, roomId, groupId, activerooms[0]?.id);
        } else {
          history.push(`${groupId}/${roomId}/room-details`);
        }
      }

  
    }
  };

  const CheckInvitation = (
    values: any,
    notificationId: any,
    roomId: any,
    groupId: any
  ) => {
    var params = {
      room_id: roomId,
      invitation_code: values.invitation_code,
    };
    groupCategoryApi.callVerifyInviteCode(
      params,
      (message: string, resp: any) => {
        let SimultaneousRoom = userSelector?.is_subscribed?.feature.filter(
          (x: any) => x.type == "simultaneous_room"
        );
        if (SimultaneousRoom) {
          if (activerooms?.length > SimultaneousRoom[0]?.value) {
            handleShowAlerts(1);
          } else {
            // const groupId = cryptr.encrypt(group)
            // const roomId = cryptr.encrypt(room);

            history.replace("");
            history.push(`${groupId}/${roomId}/room-details`);
            setIsRoomAlert(false);
            localStorage.setItem("isAdminlock", "true");
            handleRemoveSingleNotification(null, +notificationId);
          }
        } else {
          if (activerooms?.length > 0) {
            handleShowAlert(1, roomId, groupId, activerooms[0]?.id);
          } else {
            history.push(`${groupId}/${roomId}/room-details`);
          }
        }

        // history.replace("");
        // history.push(`${groupId}/${roomId}/room-details`);
        // localStorage.setItem("isAdminlock", "true");
        handleRemoveSingleNotification(null, +notificationId);
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  useEffect(() => {
    if (showNow) {
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
  }, [openCall, showNow, openAudioCall, userSelector, microphoneState]);

  useEffect(() => {
    if (giftAcceptedNotification && userSelector) {
      const userWithGift =
        userSelector?.id == giftAcceptedNotification?.from_user_id;
      if (userWithGift) {
        setUsersGift([userSelector]); // Set the user with gift
        const timeoutId = setTimeout(() => {
          setUsersGift([]); // Clear usersGift after timeout
        }, 25000); // Timeout for 25 seconds (adjust as needed)
      }
      setGiftAcceptedNotification(null);
    }
    // getActiveRoom();
  }, [giftAcceptedNotification, userSelector]);

  
  return (
    <React.Fragment>
      <div>
        {alert}
        {/* call alert */}
        {showNow ? (
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

                  const params = {
                    user_id: invitationRec?.inviter?.userId,
                  };

                  await pmWindowApi.callSendPms(
                    params,
                    async (message: string, resp: any) => {
                      if (resp) {
                        const userId = cryptr.encrypt(resp.id);
                        setIsAccepted(true);

                        setAcceptedFromInvite(true);
                        setCallAcceptType("video");
                        history.push(`/pm/${userId}`);
                      } else {
                        toast.error(message);
                      }
                    },
                    (message: string, resp: any) => {
                      toast.error(message);
                    }
                  );

                  setShowNow(false);
                } else {
                  await invitationRec.accept();

                  const params = {
                    user_id: invitationRec?.inviter?.userId,
                  };

                  await pmWindowApi.callSendPms(
                    params,
                    async (message: string, resp: any) => {
                      if (resp) {
                        const userId = cryptr.encrypt(resp.id);
                        setIsAccepted(true);
                        setAcceptedFromInvite(true);
                        setCallAcceptType("audio");
                        history.push(`/pm/${userId}`);
                      } else {
                        toast.error(message);
                      }
                    },
                    (message: string, resp: any) => {
                      toast.error(message);
                    }
                  );
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
            } session. Do you want to
              Accept the invitation?`}
          />
        ) : (
          ""
        )}
        {/* gift recv alert */}
        {isAlert && giftRec?.user[0]?.to_user_id === userId ? (
          <CustomSweetAlert
            type="warning"
            showCancel
            confirmBtnText="Accept"
            cancelBtnText="Reject"
            cancelBtnBsStyle="danger"
            confirmBtnBsStyle={isCheckboxChecked ? "success" : "secondary"}
            allowEscape={false}
            closeOnClickOutside={false}
            title="Gift"
            onConfirmFunc={() => {
              if (isCheckboxChecked) {
                handleAcceptGift(
                  giftRec?.user[0]?.id,
                  true
                );
              }
            }}
            onCancelFunc={() => {
              handleAcceptGift(
                giftRec?.user[0]?.id,
                false
              );
              // handleRejectGift(giftRec?.user[0]?.id);
            }}
            focusCancelBtn={true}
            innerText={
              <div>
                {giftRec?.user[0]?.message}
                <br />
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success m-3">
                  <input
                    type="checkbox"
                    id="customCheck-outlinecolor17"
                    className="custom-control-input"
                    value=""
                    checked={isCheckboxChecked}
                    onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="customCheck-outlinecolor17"
                  />
                  <div className="message-table-name d-inline-flex align-items-center">
                    <div className="message-mail-content">
                      <h6>*Are you sure want to receive this Gift</h6>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        ) : null}

        {isGiftAccepted && giftAcceptedNotification?.to_user_id == userId ? (
          <CustomSweetAlert
            type="success"
            confirmBtnText="Ok"
            confirmBtnBsStyle="success"
            allowEscape={false}
            closeOnClickOutside={false}
            title="Gift"
            onConfirmFunc={() => {
              handleCloseModal();
            }}
            innerText={
              <div>
                {giftAcceptedNotification.message}
                <br />
              </div>
            }
          />
        ) : null}

        {/* PM invite notification accept */}
        {isPmAlert && pmInviteData?.user[0]?.to_user_id === userId ? (
          <CustomSweetAlert
            type="warning"
            showCancel
            confirmBtnText="Accept"
            cancelBtnText="Reject"
            cancelBtnBsStyle="danger"
            confirmBtnBsStyle={isCheckboxChecked ? "success" : "secondary"}
            allowEscape={false}
            closeOnClickOutside={false}
            title="Invite In PM"
            onConfirmFunc={() => {
              if (isCheckboxChecked) {
                handleAcceptJoinPmInvitation(
                  pmInviteData?.user[0].id,
                  pmInviteData?.user[0].entity_id,
                  true
                );
              }
            }}
            onCancelFunc={() => {
              handleAcceptJoinPmInvitation(
                pmInviteData?.user[0].id,
                pmInviteData?.user[0].entity_id,
                false
              );
            }}
            focusCancelBtn={true}
            innerText={
              <div>
                {pmInviteData?.user[0]?.message}
                <br />
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success m-3">
                  <input
                    type="checkbox"
                    id="customCheck-outlinecolor17"
                    className="custom-control-input"
                    value=""
                    checked={isCheckboxChecked}
                    onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="customCheck-outlinecolor17"
                  />
                  <div className="message-table-name d-inline-flex align-items-center">
                    <div className="message-mail-content">
                      <h6>*Are you sure want to Join PM</h6>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        ) : null}

        {/* room invitation notification accept  */}
        {isRoomAlert && RoomInviteData?.user[0]?.to_user_id === userId ? (
          <CustomSweetAlert
            type="warning"
            showCancel
            confirmBtnText="Accept"
            cancelBtnText="Reject"
            cancelBtnBsStyle="danger"
            confirmBtnBsStyle={isCheckboxChecked ? "success" : "secondary"}
            allowEscape={false}
            closeOnClickOutside={false}
            title="Invite In Room"
            onConfirmFunc={() => {
              if (isCheckboxChecked) {
                handleAcceptJoinInvitation(
                  RoomInviteData?.user[0].id,
                  RoomInviteData?.user[0].group_id,
                  RoomInviteData?.user[0].entity_id
                );
              }
            }}
            onCancelFunc={() => {
              handleRemoveSingleNotification(null, RoomInviteData?.user[0].id);
            }}
            focusCancelBtn={true}
            innerText={
              <div>
                {RoomInviteData?.user[0]?.message}
                <br />
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success m-3">
                  <input
                    type="checkbox"
                    id="customCheck-outlinecolor17"
                    className="custom-control-input"
                    value=""
                    checked={isCheckboxChecked}
                    onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="customCheck-outlinecolor17"
                  />
                  <div className="message-table-name d-inline-flex align-items-center">
                    <div className="message-mail-content">
                      <h6>*Are you sure want to Join Room</h6>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        ) : null}

        {/* Pm remove user notification */}

        <div id="sidebar-menu" className="left-sidebar">
          {/* <div className="sidebar_height"></div> */}
          {alert}
          <button
            type="button"
            style={{ display: "none" }}
            id="playSoundBtn"
            onClick={playSound}
          ></button>
          <div className="sidebar-profile-panel d-flex align-items-center mb-4">
            <div className="sidebar-profile-pic">
              <div className="sidebar-profile-pic-inner">
                {userSelector &&
                userSelector.avatar &&
                userSelector.avatar.thumb ? (
                  <img
                    src={userSelector.avatar.thumb}
                    height={"62px"}
                    width={"62px"}
                  />
                ) : (
                  <span>{getNameInitials(userSelector?.username)}</span>
                )}
              </div>
              <span
                className={
                  userSelector && userSelector.visible_status
                    ? "user-status st-" + userSelector.visible_status
                    : "user-status st-1"
                }
                onClick={(e) => statusToggle(e, "status")}
              />
            </div>
            <div className="sidebar-profile-info">
              {/* Change Username Color when user enterd into the room & color will be based on room subscription if user is owner tof that room */}

              <h4
                // style={{
                //   color: getSubscriptionColor(
                //     roomDetailsSelector && roomDetailsSelector.room
                //       ? roomDetailsSelector.members &&
                //         roomDetailsSelector.members.length &&
                //         roomDetailsSelector.members.filter(
                //           (x: any) => x.user_id === userSelector?.id
                //         )[0] &&
                //         roomDetailsSelector.members.filter(
                //           (x: any) => x.user_id === userSelector?.id
                //         )[0].is_admin === 3
                //         ? roomDetailsSelector.room
                //         : null
                //       : userSelector && userSelector.is_subscribed
                //       ? {
                //           ...userSelector,
                //           subscription_info: userSelector.is_subscribed,
                //         }
                //       : null
                //   ),
                // }}
                style={{
                  color: getSubscriptionColor(userSelector),
                }}
              >
                {usersGift.length > 0 && (
                  <FaGift style={{ marginRight: "5px" }} />
                )}
                {userSelector && userSelector.username
                  ? userSelector.username
                  : ".."}
                {userSelector &&
                userSelector.badge_data &&
                userSelector.badge_data.current_badge &&
                new Date(
                  userSelector.badge_data.expiry_date.replaceAll("-", "/")
                ).getTime() > new Date().getTime() ? (
                  <img
                    src={
                      userSelector?.badge_data?.current_badge?.icon?.original
                    }
                    height={25}
                    width={25}
                    className="m-2"
                    alt=""
                  />
                ) : (
                  ""
                )}
              </h4>
              <h5>
                {getAvailabiltyStatusText(
                  userSelector && userSelector.visible_status
                )}
              </h5>
              <span
                className="about-text"
                title={
                  userSelector && userSelector.about ? userSelector.about : ""
                }
              >
                {userSelector && userSelector.about
                  ? trimTo(userSelector.about, 30, true)
                  : null}
              </span>
            </div>
          </div>

          <div className="sidebar-profile-tools-panel">
            {/* <a href="#" className="nearby-btn waves-effect">
            <i className="find-nearby-icon mr-2" />
            Find nearby users
          </a> */}
            <NavLink
              to={URLS.USER.NEAR_BY_USER}
              className="nearby-btn waves-effect"
            >
              <i className="find-nearby-icon mr-2" />
              Find nearby users
            </NavLink>

            <div className="d-flex justify-content-between align-items-baseline mt-4 mb-2 user-btns-panel">
              <NavLink
                to={URLS.USER.GROUPS_AND_CATEGORY}
                activeClassName="active"
              >
                <i className="group-icon mb-1" />
                Groups <br />
                &amp; Category
              </NavLink>

              <NavLink
                to={URLS.USER.MANAGE_VOICE_MAIL}
                activeClassName="active"
              >
                <i className="voicemails-icon mb-1">
                  <span className="noticount">
                    {leftMenuItemDetails &&
                    leftMenuItemDetails.voice_unread_message_cnt
                      ? leftMenuItemDetails.voice_unread_message_cnt
                      : 0}
                  </span>
                </i>
                Voicemails
              </NavLink>

              <NavLink
                to={URLS.USER.MANAGE_VIDEO_MESSAGE}
                activeClassName="active"
              >
                <i className="video-msg-icon mb-1">
                  <span className="noticount">
                    {leftMenuItemDetails &&
                    leftMenuItemDetails.video_unread_message_cnt
                      ? leftMenuItemDetails.video_unread_message_cnt
                      : 0}
                  </span>
                </i>
                Video Messages
              </NavLink>

              <NavLink to={URLS.USER.NOTEBOOK} activeClassName="active">
                <i className="notebook-icon mb-1">
                  {/* {
                  noteBookNewCount && noteBookNewCount > 0 ?
                    <span className="noticount">
                      {
                        noteBookNewCount
                      }
                    </span> : null
                } */}

                  <span className="noticount">
                    {leftMenuItemDetails &&
                    leftMenuItemDetails.notebook_unread_count
                      ? leftMenuItemDetails.notebook_unread_count
                      : 0}
                  </span>
                </i>
                Notebook
              </NavLink>
            </div>
          </div>

          {/* Left Menu Start */}

          <MetisMenu>
            <li>
              <Link to="#" className="has-arrow waves-effect">
                <i className="sidebar-icon-1" />
                <span key="t-layouts">
                  Recent PMs{" "}
                  {leftMenuItemDetails &&
                  leftMenuItemDetails.recent_pms &&
                  leftMenuItemDetails.recent_pms.length
                    ? "(" + leftMenuItemDetails.recent_pms.length + ")"
                    : ""}
                </span>
                {/* {leftMenuItemDetails && leftMenuItemDetails.recent_pms && leftMenuItemDetails.recent_pms.length ? '(' + leftMenuItemDetails.recent_pms.length + ')' : ''} */}
              </Link>
              <ul className="sub-menu" aria-expanded="true">
                {leftMenuItemDetails &&
                leftMenuItemDetails.recent_pms &&
                leftMenuItemDetails.recent_pms.length ? (
                  leftMenuItemDetails.recent_pms.map(
                    (items: any, index: number) => {
                      return (
                        <li key={index}>
                          <Link
                            to="#"
                            onDoubleClick={async () => {
                              // if (items.contact_user?.visible_status == 3) {
                              //   return;
                              // } else {
                                handleRedirectToPm(items?.pm_id);
                              // }
                            }}
                          >
                            <span className="sub-menu-avatar">
                              {items &&
                              items.pm_info &&
                              items.pm_info.pm_type === PM_TYPE.SINGLE ? (
                                <img
                                  className="recent-pms-avatar"
                                  src="/img/sidebar-icon-3.png"
                                  alt="single"
                                />
                              ) : (
                                <img
                                  className="recent-pms-avatar"
                                  src="/img/group-icon.png"
                                  alt="group"
                                />
                              )}
                            </span>
                            <div className="sub-menu-info">
                            {/* {(() => {
                              const user1Name = items.user_id == userId
                                ? items.for_user_info.customize_nickname && items.for_user_info.customize_nickname.nickname
                                  ? items.for_user_info.customize_nickname.nickname
                                  : items.for_user_info.username
                                : items.user_info.customize_nickname && items.user_info.customize_nickname.nickname
                                ? items.user_info.customize_nickname.nickname
                                : items.user_info.username;
                                                    
                              const user2Name = items.user_id == userId
                                ? items.for_user_info.customize_nickname && items.for_user_info.customize_nickname.nickname
                                  ? items.for_user_info.customize_nickname.nickname
                                  : items.for_user_info.username
                                : items.user_info.customize_nickname && items.user_info.customize_nickname.nickname
                                ? items.user_info.customize_nickname.nickname
                                : items.user_info.username;
                                                    
                              const recentPmUserNames = `${user1Name}, ${user2Name}`;
                              return <span>{recentPmUserNames}</span>;
                            })()} */}

                            {(() => {
                              const getRecentPmUserName = (x: any) => {
                                return x?.user_info?.customize_nickname && x?.user_info?.customize_nickname?.nickname
                                  ? x.user_info.customize_nickname.nickname
                                  : x.user_info.username;
                              };
                            
                              const recentPmUserNames = items?.pm_info?.users
                              ?.filter((user: any) => user.user_info.id != userSelector?.id)
                              .map(getRecentPmUserName).join(', ');
                            
                              return <span>{recentPmUserNames}</span>;
                            })()}

                              {/* <span>
                              <i className="oline-tag"
                                style={{ backgroundColor: getStatusColor(items.contact_user.visible_status) }} />{getAvailabiltyStatusText(items.contact_user.visible_status)}
                            </span> */}
                            </div>
                          </Link>
                        </li>
                      );
                    }
                  )
                ) : (
                  <li>
                    <p>No pms found</p>
                  </li>
                )}
              </ul>
            </li>

            <li>
              <a href="#" className="has-arrow waves-effect">
                <i className="sidebar-icon-2" />
                <span key="t-layouts">
                  Favorites Contacts{" "}
                  {leftMenuItemDetails &&
                  leftMenuItemDetails.favourite_contact &&
                  leftMenuItemDetails.favourite_contact.length
                    ? "(" + leftMenuItemDetails.favourite_contact.length + ")"
                    : ""}
                </span>
              </a>
              <ul className="sub-menu" aria-expanded="true">
                {leftMenuItemDetails &&
                leftMenuItemDetails.favourite_contact &&
                leftMenuItemDetails.favourite_contact.length ? (
                  leftMenuItemDetails.favourite_contact.map(
                    (items: any, index: number) => (
                      <li key={index}>
                        <Link
                          to="#"
                          className={clsx({
                            "disable-link": items.is_block,
                          })}
                          onContextMenu={(e) => onContextMenuClick(e, items)}
                          onDoubleClick={async () => {
                            if (items.contact_user.visible_status == 3) {
                              return;
                            } else {
                              handleSendPm(items.contact_user.id);
                            }
                          }}
                        >
                          <div className="test">
                            <span className="sub-menu-avatar">
                              {items &&
                              items.contact_user &&
                              items.contact_user.avatar &&
                              getBooleanStatus(
                                items.contact_user.avatar &&
                                  items.contact_user.avatar.visible_avatar
                                  ? items.contact_user.avatar.visible_avatar
                                  : 0
                              ) &&
                              items.contact_user.avatar.thumb ? (
                                <img
                                  src={items.contact_user.avatar.thumb}
                                  alt={items.contact_user.username}
                                />
                              ) : (
                                <span className="text-avatar">
                                  {getNameInitials(items.contact_user.username)}
                                </span>
                              )}
                            </span>
                            <div
                              className="sub-menu-info"
                              style={{
                                color: getSubscriptionColor(
                                  items &&
                                    items.contact_user &&
                                    items.contact_user.is_subscribed
                                    ? {
                                        ...items,
                                        subscription_info:
                                          items.contact_user.is_subscribed,
                                      }
                                    : null
                                ),
                              }}
                            >
                              {items.customize_nickname &&
                              items.customize_nickname.nickname
                                ? items.customize_nickname.nickname
                                : items.contact_user.username}
                              <span>
                                <i
                                  className="oline-tag"
                                  style={{
                                    backgroundColor: getStatusColor(
                                      items.contact_user.visible_status
                                    ),
                                  }}
                                />
                                {getAvailabiltyStatusText(
                                  items.contact_user.visible_status,
                                  true
                                )}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span>
                              {items.privacy_setting &&
                              items.privacy_setting.length ? (
                                getPrivacySettingsRoomIamInOptions(
                                  items.privacy_setting.filter(
                                    (x: any) =>
                                      x.key === "show_room_i_am_in" &&
                                      x.field_type_details === "checkbox"
                                  )
                                ) == "0" ? (
                                  <p
                                    className="left-menu-tooltip"
                                    title={items.contact_user.about}
                                  >
                                    {trimTo(items.contact_user.about, 20, true)}
                                  </p>
                                ) : (getPrivacySettingsRoomIamInOptions(
                                    items.privacy_setting.filter(
                                      (x: any) =>
                                        x.key === "show_room_i_am_in_options" &&
                                        x.field_type_details === "radio"
                                    )
                                  ) == "1" &&
                                    items.is_in_contact) ||
                                  getPrivacySettingsRoomIamInOptions(
                                    items.privacy_setting.filter(
                                      (x: any) =>
                                        x.key === "show_room_i_am_in_options" &&
                                        x.field_type_details === "radio"
                                    )
                                  ) == "2" ? (
                                  <p
                                    className="left-menu-tooltip"
                                    title={
                                      items.first_room &&
                                      items.first_room.room_details
                                        ? items.first_room.room_details
                                            .room_name
                                        : ""
                                    }
                                  >
                                    {trimTo(
                                      items.first_room &&
                                        items.first_room.room_details
                                        ? items.first_room.room_details
                                            .room_name
                                        : "",
                                      20,
                                      true
                                    )}
                                  </p>
                                ) : null
                              ) : null}
                            </span>
                          </div>
                        </Link>

                        <a
                          href="#"
                          onClick={(e) => showAlert(e, items.contact_user_id)}
                          className="submenu-close-btn"
                        />
                      </li>
                    )
                  )
                ) : (
                  <li>No Contact found</li>
                )}
              </ul>
            </li>
            <li>
              <a href="#" className="has-arrow waves-effect">
                <i className="sidebar-icon-3" />
                <span key="t-layouts">
                  Online{" "}
                  {leftMenuItemDetails &&
                  leftMenuItemDetails.online_users &&
                  leftMenuItemDetails.online_users.length
                    ? // "(" + onlineUserCount + ")"
                      "(" +
                      `${
                        leftMenuItemDetails.online_users.length &&
                        leftMenuItemDetails.online_users.filter(
                          (u: any) => u.is_bloked_by_them == null
                        ).length + 1
                      }` +
                      ")"
                    : "(1)"}
                </span>
              </a>
              <ul className="sub-menu" aria-expanded="true">
                {/* Current user Static Data Added */}
                <li>
                  {/* onContextMenu={(e) => onContextMenuClick(e, userSelector)} */}
                  <Link
                    to="#"
                    onContextMenu={(e) =>
                      onSelfContextMenuClick(e, userSelector)
                    }
                    onDoubleClick={() => {
                      handleSendPm(`${userSelector ? userSelector.id : 0}`);
                    }}
                  >
                    <span className="sub-menu-avatar">
                      {userSelector &&
                      userSelector.avatar &&
                      userSelector.avatar.thumb ? (
                        <img
                          src={userSelector.avatar.thumb}
                          alt={userSelector.username}
                        />
                      ) : (
                        <span className="text-avatar">
                          {getNameInitials(userSelector?.username)}
                        </span>
                      )}
                    </span>
                    <div
                      className="sub-menu-info"
                      style={{
                        color: getSubscriptionColor(
                          userSelector && userSelector.is_subscribed
                            ? {
                                ...userSelector,
                                subscription_info: userSelector.is_subscribed,
                              }
                            : null
                        ),
                      }}
                    >
                      {userSelector?.username}
                      {userSelector &&
                      userSelector.badge_data &&
                      userSelector.badge_data.current_badge &&
                      new Date(
                        userSelector.badge_data.expiry_date.replaceAll("-", "/")
                      ).getTime() > new Date().getTime() ? (
                        <img
                          src={
                            userSelector?.badge_data?.current_badge?.icon
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
                      <span>
                        <i
                          className="oline-tag"
                          style={{
                            backgroundColor: getStatusColor(
                              userSelector?.visible_status
                            ),
                          }}
                        />{" "}
                        {getAvailabiltyStatusText(userSelector?.visible_status)}
                      </span>
                      <span>
                        <p className="left-menu-tooltip" title="">
                          {amount == 3
                            ? ""
                            : ActiveRoomData && ActiveRoomData.room_name}
                        </p>
                      </span>
                    </div>
                  </Link>
                </li>

                {
                  leftMenuItemDetails &&
                  leftMenuItemDetails.online_users &&
                  leftMenuItemDetails.online_users.length
                    ? leftMenuItemDetails.online_users.map(
                        (items: any, index: number) => {
                          if (items.is_bloked_by_them == null) {
                            return (
                              <li key={index}>
                                <Link
                                  to="#"
                                  className={clsx({
                                    "disable-link":
                                      items.is_block || items.is_bloked_by_them,
                                  })}
                                  onContextMenu={(e) =>
                                    onContextMenuClick(e, items)
                                  }
                                  onDoubleClick={() => {
                                    if (
                                      items.contact_user.visible_status == 3
                                    ) {
                                      return;
                                    } else {
                                      handleSendPm(items.contact_user.id);
                                    }
                                  }}
                                >
                                  <span className="sub-menu-avatar">
                                    {items &&
                                    items.contact_user &&
                                    items.contact_user.avatar &&
                                    getBooleanStatus(
                                      items.contact_user.avatar &&
                                        items.contact_user.avatar.visible_avatar
                                        ? items.contact_user.avatar
                                            .visible_avatar
                                        : 0
                                    ) &&
                                    items.contact_user.avatar.thumb ? (
                                      <img
                                        src={items.contact_user.avatar.thumb}
                                        alt={items.contact_user.username}
                                      />
                                    ) : (
                                      <span className="text-avatar">
                                        {getNameInitials(
                                          items.contact_user.username
                                        )}
                                      </span>
                                    )}
                                  </span>
                                  <div
                                    className="sub-menu-info"
                                    style={{
                                      color: getSubscriptionColor(
                                        items &&
                                          items.contact_user &&
                                          items.contact_user.is_subscribed
                                          ? {
                                              ...items,
                                              subscription_info:
                                                items.contact_user
                                                  .is_subscribed,
                                            }
                                          : null
                                      ),
                                    }}
                                  >
                                    {items.customize_nickname &&
                                    items.customize_nickname.nickname
                                      ? items.customize_nickname.nickname
                                      : items.contact_user.username}
                                    {items &&
                                    items.badge_data &&
                                    items.badge_data.current_badge &&
                                    new Date(
                                      items.badge_data.expiry_date.replaceAll(
                                        "-",
                                        "/"
                                      )
                                    ).getTime() > new Date().getTime() ? (
                                      <img
                                        src={
                                          items?.badge_data?.current_badge?.icon
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
                                    <span>
                                      <i
                                        className="oline-tag"
                                        style={{
                                          backgroundColor: getStatusColor(
                                            items.contact_user.visible_status
                                          ),
                                        }}
                                      />{" "}
                                      {getAvailabiltyStatusText(
                                        items.contact_user.visible_status
                                      )}
                                    </span>
                                    <span>
                                      {items.privacy_setting &&
                                      items.privacy_setting.length ? (
                                        getPrivacySettingsRoomIamInOptions(
                                          items.privacy_setting.filter(
                                            (x: any) =>
                                              x.key === "show_room_i_am_in" &&
                                              x.field_type_details ===
                                                "checkbox"
                                          )
                                        ) == "0" ? (
                                          <p
                                            className="left-menu-tooltip"
                                            title={items.contact_user.about}
                                          >
                                            {trimTo(
                                              items.contact_user.about,
                                              20,
                                              true
                                            )}
                                          </p>
                                        ) : (getPrivacySettingsRoomIamInOptions(
                                            items.privacy_setting.filter(
                                              (x: any) =>
                                                x.key ===
                                                  "show_room_i_am_in_options" &&
                                                x.field_type_details === "radio"
                                            )
                                          ) == "1" &&
                                            items.is_in_contact) ||
                                          getPrivacySettingsRoomIamInOptions(
                                            items.privacy_setting.filter(
                                              (x: any) =>
                                                x.key ===
                                                  "show_room_i_am_in_options" &&
                                                x.field_type_details === "radio"
                                            )
                                          ) == "2" ? (
                                          <p
                                            className="left-menu-tooltip"
                                            title={
                                              items.first_room &&
                                              items.first_room.room_details
                                                ? items.first_room.room_details
                                                    .room_name
                                                : ""
                                            }
                                            onDoubleClick={() =>
                                              handleEnterRoom(items)
                                            }
                                            style={{ color: "#556EE6" }}
                                          >
                                            {amount == 3 ? (
                                              ""
                                            ) : amount == 2 ? (
                                              <>
                                                {trimTo(
                                                  items.first_room &&
                                                    items.first_room
                                                      .room_details
                                                    ? items.first_room
                                                        .room_details.room_name
                                                    : "",
                                                  20,
                                                  true
                                                )}
                                              </>
                                            ) : amount == 1 &&
                                              items.privacy_setting &&
                                              items.privacy_setting[0].val ==
                                                "1" ? (
                                              <>
                                                {trimTo(
                                                  items.first_room &&
                                                    items.first_room
                                                      .room_details
                                                    ? items.first_room
                                                        .room_details.room_name
                                                    : "",
                                                  20,
                                                  true
                                                )}
                                              </>
                                            ) : (
                                              ""
                                            )}
                                          </p>
                                        ) : null
                                      ) : null}
                                    </span>
                                  </div>
                                </Link>
                                {/* <a href="#" key="t-vertical" className={clsx({
                                  'disable-link': items.is_block
                                })}>
                                  <span className="sub-menu-avatar">
                                    {
                                      items && items.contact_user && items.contact_user.avatar && getBooleanStatus(items.contact_user.avatar && items.contact_user.avatar.visible_avatar ? items.contact_user.avatar.visible_avatar : 0) && items.contact_user.avatar.thumb ?
                                        <img src={items.contact_user.avatar.thumb} alt={items.contact_user.username} /> : (<span className="text-avatar">{getNameInitials(items.contact_user.username)}</span>)
                                    }
                                  </span>
                                  <div className="sub-menu-info">{items.customize_nickname && items.customize_nickname.nickname ? items.customize_nickname.nickname : items.contact_user.username} <span>
                                    <i className="oline-tag" style={{ backgroundColor: getStatusColor(items.contact_user.visible_status) }} /> {getAvailabiltyStatusText(items.contact_user.visible_status)}</span></div>
                                </a> */}
                              </li>
                            );
                          } else {
                            return null;
                          }
                        }
                      )
                    : null
                  // <li>
                  //   No user found
                  // </li>
                }
              </ul>
            </li>
            <li>
              <a href="#" className="has-arrow waves-effect">
                <i className="offline-icon-white" />
                <span key="t-layouts">
                  Offline{" "}
                  {leftMenuItemDetails &&
                  leftMenuItemDetails.offline_users &&
                  leftMenuItemDetails.offline_users.length
                    ? "(" + leftMenuItemDetails.offline_users.length + ")"
                    : ""}
                </span>
              </a>
              <ul className="sub-menu" aria-expanded="true">
                {leftMenuItemDetails &&
                leftMenuItemDetails.offline_users &&
                leftMenuItemDetails.offline_users.length ? (
                  leftMenuItemDetails.offline_users.map(
                    (items: any, index: number) => {
                      return (
                        <li key={index}>
                          <Link
                            to="#"
                            className={clsx({
                              "disable-link":
                                items.is_block || items.is_bloked_by_them,
                            })}
                            onContextMenu={(e) => onContextMenuClick(e, items)}
                            onDoubleClick={() => {
                              if (items.contact_user.visible_status == 3) {
                                return;
                              } else {
                                handleSendPm(items.contact_user.id);
                              }
                            }}
                          >
                            <span className="sub-menu-avatar">
                              {items &&
                              items.contact_user &&
                              items.contact_user.avatar &&
                              getBooleanStatus(
                                items.contact_user.avatar &&
                                  items.contact_user.avatar.visible_avatar
                                  ? items.contact_user.avatar.visible_avatar
                                  : 0
                              ) &&
                              items.contact_user.avatar.thumb ? (
                                <img
                                  src={items.contact_user.avatar.thumb}
                                  alt={items.contact_user.username}
                                />
                              ) : (
                                <span className="text-avatar">
                                  {getNameInitials(items.contact_user.username)}
                                </span>
                              )}
                            </span>
                            <div
                              className="sub-menu-info"
                              style={{
                                color: getSubscriptionColor(
                                  items &&
                                    items.contact_user &&
                                    items.contact_user.is_subscribed
                                    ? {
                                        ...items,
                                        subscription_info:
                                          items.contact_user.is_subscribed,
                                      }
                                    : null
                                ),
                              }}
                            >
                              {items.customize_nickname &&
                              items.customize_nickname.nickname
                                ? items.customize_nickname.nickname
                                : items.contact_user.username}
                              {items &&
                              items.badge_data &&
                              items.badge_data.current_badge &&
                              new Date(
                                items.badge_data.expiry_date.replaceAll(
                                  "-",
                                  "/"
                                )
                              ).getTime() > new Date().getTime() ? (
                                <img
                                  src={
                                    items?.badge_data?.current_badge?.icon
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
                              <span>
                                <i className="offline-tag" />
                                {/* {getAvailabiltyStatusText(items.contact_user.visible_status)} */}
                                Offline
                              </span>
                              <span>
                                {items.privacy_setting &&
                                items.privacy_setting.length ? (
                                  getPrivacySettingsRoomIamInOptions(
                                    items.privacy_setting.filter(
                                      (x: any) =>
                                        x.key === "show_room_i_am_in" &&
                                        x.field_type_details === "checkbox"
                                    )
                                  ) == "0" ? (
                                    <p
                                      className="left-menu-tooltip"
                                      title={items.contact_user.about}
                                    >
                                      {trimTo(
                                        items.contact_user.about,
                                        20,
                                        true
                                      )}
                                    </p>
                                  ) : (getPrivacySettingsRoomIamInOptions(
                                      items.privacy_setting.filter(
                                        (x: any) =>
                                          x.key ===
                                            "show_room_i_am_in_options" &&
                                          x.field_type_details === "radio"
                                      )
                                    ) == "1" &&
                                      items.is_in_contact) ||
                                    getPrivacySettingsRoomIamInOptions(
                                      items.privacy_setting.filter(
                                        (x: any) =>
                                          x.key ===
                                            "show_room_i_am_in_options" &&
                                          x.field_type_details === "radio"
                                      )
                                    ) == "2" ? (
                                    <p
                                      className="left-menu-tooltip"
                                      title={
                                        items.first_room &&
                                        items.first_room.room_details
                                          ? items.first_room.room_details
                                              .room_name
                                          : ""
                                      }
                                    >
                                      {trimTo(
                                        items.first_room &&
                                          items.first_room.room_details
                                          ? items.first_room.room_details
                                              .room_name
                                          : "",
                                        20,
                                        true
                                      )}
                                    </p>
                                  ) : null
                                ) : null}
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    }
                  )
                ) : (
                  <li>No user found</li>
                )}
              </ul>
            </li>
            <li className="online-user-border">
              <p className="online-user">
                {/* {leftMenuItemDetails && (leftMenuItemDetails.total_online_user + 1)} */}
                {onlineUserCount} users online
              </p>
            </li>
          </MetisMenu>
        </div>
        <div className="profile-pic-check">
          <div>
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                onChange={(e) => {
                  toggleShowHideProfilePicture(e.target.checked);
                }}
                className="custom-control-input"
                id="customControlInline2"
                checked={
                  userSelector &&
                  userSelector.visible_option &&
                  userSelector.visible_option.length
                    ? getBooleanStatus(
                        getValueFromArrayOfObject(
                          userSelector.visible_option,
                          "avatar_visible"
                        )
                      )
                    : false
                }
              />
              <label
                className="custom-control-label"
                htmlFor="customControlInline2"
              >
                Show user's profile pictures
              </label>
            </div>
            <div className="build-version-label">
              <label>
                Build Version:{" "}
                <code className="build-version">{APP_VERSION}</code>
              </label>
            </div>
          </div>
        </div>
        <div className="sidebar-banner-div">
          <SideBarBanner />
        </div>
      </div>

      <LeftBarPersonContextMenu
        getParams={contextMenuOperationParams}
        profile={membersData}
        isLoginUsers={isLoginUser}
      />

      <StatusToggleMenu />

      {showProfileModal && (
        <ViewProfileModal
          onClose={onViewProfileModalClose}
          shouldShow={showProfileModal}
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
          type={""} // Make it blank
        />
      ) : null}

      {showCustomizedNicknameModal ? (
        <CustomizedNicknameModal
          onClose={customizedNicknameModalClose}
          onSuccess={() => {}}
          shouldShow={showCustomizedNicknameModal}
          fetchData={membersData}
        />
      ) : null}

      {/*Global Socket loader */}
      <SocketLoader />
    </React.Fragment>
  );
}

export default Sidebar;
