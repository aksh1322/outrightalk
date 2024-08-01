import React, { useEffect, useState } from "react";
import { Menu, Item, Separator, Submenu } from "react-contexify";
import SweetAlert from "react-bootstrap-sweetalert";
import { useAppGroupCategoryAction } from "src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook";
import {
  useAppChangePasswordModalOpen,
  useAppFindAndAddUserModalOpen,
  useAppUserDetailsSelector,
  useAppMultiRecipientMessageModalOpen,
} from "src/_common/hooks/selectors/userSelector";
import { useAppUserAction } from "src/_common/hooks/actions/user/appUserActionHook";
import {
  CRYPTO_SECRET_KEY,
  FIND_AND_ADD_USER_TYPE,
  getBooleanStatus,
  getRoomSubscriptionTitle,
  getSubscriptionColor,
  MENU_OPERATIONS,
  URLS,
} from "src/_config";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router";
import RoleBasedContextMenuHOC from "src/_common/hoc/roleBasedRoomSideContextMenuGauard";
import ChangePasswordModal from "src/components/myProfile/changePasswordModal";
import FindAndAddUserModal from "../commonModals/findAndAddUserModal/findAndAddUserModal";
import UploadRoomVideoModal from "../../components/groupsCategory/roomsDetail/modal/uploadRoomVideoModal";
import CreateRoomTwoModal from "src/components/groupsCategory/roomsList/createRoomModal/createRoomModalTwo";
import PmUsersListModal from "../pm-room/modal/pmUsersListModal/pmUsersListModal";
// import ClearChatPmModal from "../pm-room/modal/clearChatModal/clearChatPmModal";
import WhoIsViewingMeModal from "../groupsCategory/roomsDetail/modal/whoIsViewingMeModal";
import { useAppRoomDetailsSelector } from "src/_common/hooks/selectors/groupCategorySelector";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import { toast } from "react-toastify";
import clsx from "clsx";
import { useAppPmWindowDetails } from "src/_common/hooks/selectors/pmWindowSelector";
import { usePmWindowApi } from "src/_common/hooks/actions/pmWindow/appPmWindowApiHook";
import MultiRecipientMessageModal from "../commonModals/multiRecipientMessageModal/multiRecipientMessageModal";
import JoinChatRoomAsAdmin from "../commonModals/joinChatRoomAsAdmin/joinChatRoomAsAdmin";
import ChangeAccount from "../commonModals/changeAccount/changeAccount";
import DigSoundListModal from "../pm-room/modal/digSoundListModal/digSoundListModal";
import UpgradeRoomSubscriptionModal from "../groupsCategory/roomsDetail/modal/upgradeRoomSubscriptionModal";
import SwitchRoomSubscriptionModal from "../groupsCategory/roomsDetail/modal/switchRoomSubscriptionModal";
import UpgradeNicknameSubscriptionModal from "../commonModals/upgradeNicknameModal/upgradeNicknameModal";
import SwitchNicknameSubscriptionModal from "../commonModals/upgradeNicknameModal/switchNicknamePlanModal";
import { useUserApi } from "src/_common/hooks/actions/user/appUserApiHook";
import { useFileContext } from "src/hooks";
import { useAppLoader } from "src/_common/hooks/actions/common/appLoaderHook";
import { useToaster } from "src/_common/hooks/actions/common/appToasterHook";
import { GetContactListUser } from "src/_common/interfaces/ApiReqRes";
import { useAppUserPreferencesSelector } from "src/_common/hooks/selectors/userPreferenceSelector";
import { useUserPreferenceApi } from "src/_common/hooks/actions/userPreference/appUserPreferenceApiHook";
import AddContactPmModal from "../pm-room/modal/addContactModal/addcontactModal";
import CreateVipRoomModal from "../groupsCategory/roomsList/createRoomModal/createVipRoomModal";

const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

const ActionContextMenu = (props: any) => {
  const {
    openUserSubscriptionModal,
    setOpenUserSubscriptionModal,
    openRoomSubscriptionModal,
    setOpenRoomSubscriptionModal,
  } = props;
  const { groupId, roomId } = useParams<any>();
  const changePasswordModalOpenSelector = useAppChangePasswordModalOpen();
  const findAndAddUserModalOpenSelector = useAppFindAndAddUserModalOpen();
  const groupCategoryAction = useAppGroupCategoryAction();
  const groupCategoryApi = useGroupCategoryApi();
  const pmWindowDetailsSelector = useAppPmWindowDetails();
  const userAction = useAppUserAction();
  const userSelector = useAppUserDetailsSelector();
  const roomDetailsSelector = useAppRoomDetailsSelector();
  const preference = useUserPreferenceApi();
  const history = useHistory();
  const [showCreateRoomModal, setCreateRoomModal] = useState<boolean>(false);
  const [showCreateVipRoomModal, setCreateVipRoomModal] = useState<boolean>(false);
  const [showRoomVideoUploadModal, setShowRoomVideoUploadModal] =
    useState<boolean>(false);
  const [showWhoIsViewingMyWebcamModal, setShowWhoIsViewingMyWebcamModal] =
    useState<boolean>(false);
  const [joinChatRoomAsAdmin, setJoinChatRoomAsAdmin] =
    useState<boolean>(false);
  const isOpenMultiRecipientMessageModal =
    useAppMultiRecipientMessageModalOpen();

  const [changeMyAccount, setChangeMyAccount] = useState<boolean>(false);

  const pmWindowApi = usePmWindowApi();
  const { pmId } = useParams<any>();

  const [createRoomFormStep, setCreateRoomFormStep] = useState<number>(1);
  const [showPmUsersListModal, setPmUsersListModal] = useState<boolean>(false);
  const [contactList, setContactList] = useState<any[]>([]);
  const [PmDetail, setPmDetail] = useState<any[]>([])
  // const [showClearChatPmModal, setClearChatPmModal] = useState<boolean>(false);
  const [showDigSoundListModal, setDigSoundListModal] =
    useState<boolean>(false);
  const [showUpgradeRoomSubscriptionModal, setUpgradeRoomSubscriptionModal] =
    useState<boolean>(false);
  const [showSwitchRoomSubscriptionModal, setSwitchRoomSubscriptionModal] =
    useState<boolean>(false);
  const [
    showUpgradeNicknameSubscriptionModal,
    setUpgradeNicknameSubscriptionModal,
  ] = useState<boolean>(false);
  const [
    showSwitchNicknameSubscriptionModal,
    setSwitchNicknameSubscriptionModal,
  ] = useState<boolean>(false);
  const [showRemoveUserPmModal, setShowRemoveUserPmModal] = useState<boolean>(false);
  const [showAddUserPmModal, setShowAddUserPmModal] = useState<boolean>(false);
  const [alert, setAlert] = useState<any>(null);
  const userApi = useUserApi();
  const { setShowSendFileModal } = useFileContext();
  const { showLoader, hideLoader } = useAppLoader();

  useEffect(() => {
    if (userSelector && userSelector.allow_create_room == 1) {
      let findAny = localStorage.getItem("open_room_create_modal");
      findAny && createRoomModalOpen(findAny);
    }

    if (userSelector && userSelector.allow_create_room == 0) {
      localStorage.removeItem("open_room_create_modal");
    }
  }, [userSelector]);
  useEffect(() => {
    if (openUserSubscriptionModal) {
      setUpgradeNicknameSubscriptionModal(true);
    }
  }, [openUserSubscriptionModal]);

  useEffect(() => {
    if (openUserSubscriptionModal) {
      setSwitchNicknameSubscriptionModal(true);
    }
  }, [openUserSubscriptionModal]);

  useEffect(() => {
    if (openRoomSubscriptionModal) {
      setUpgradeRoomSubscriptionModal(true);
    }
  }, [openRoomSubscriptionModal]);

  useEffect(() => {
    if (openRoomSubscriptionModal) {
      setSwitchRoomSubscriptionModal(true);
    }
  }, [openRoomSubscriptionModal]);

  const createRoomModalOpen = (e: any) => {
    setCreateRoomModal(true);
  };

  const createPrivateRoomModalOpen = (e: any) => {
    setCreateRoomModal(true);
    setCreateRoomFormStep(2);
  };


  const createVipRoomModalOpen = (e: any) => {
    setCreateVipRoomModal(true);
    // setCreateRoomFormStep(2);
  };

  const createRoomCloseModal = () => {
    if (showCreateRoomModal) setCreateRoomModal(false);
    localStorage.removeItem("open_room_create_modal");
  };
  const createVipRoomCloseModal = () => {
    if (showCreateVipRoomModal) setCreateVipRoomModal(false);
    // localStorage.removeItem("open_room_create_modal");
  };

  const whoIsViewingMeModalOpen = (e: any) => {
    setShowWhoIsViewingMyWebcamModal(true);
  };

  const whoIsViewingMeModalClose = () => {
    if (showWhoIsViewingMyWebcamModal) setShowWhoIsViewingMyWebcamModal(false);
  };

  const joinChatRoomAsAdminModalOpen = () => {
    setJoinChatRoomAsAdmin(true);
  };
  const joinChatAsAdminModalClose = () => {
    setJoinChatRoomAsAdmin(false);
  };
  const openAddUserModal = (data:string) => {
    if(data=='add') {
      setShowAddUserPmModal(true);
      setShowRemoveUserPmModal(false)
    }
    else {
      setShowRemoveUserPmModal(true)
      setShowAddUserPmModal(false);
    }

  };
  const closeAddUserPmModal = () => {
    if (showAddUserPmModal) setShowAddUserPmModal(false);
    getAllJoinRoomAsAdmin();
    // if(showRemoveUserPmModal) setShowRemoveUserPmModal(false)
  };

  const closeRemoveUserPmModal = () => {
    if(showRemoveUserPmModal) setShowRemoveUserPmModal(false)
  getAllJoinRoomAsAdmin();
    };
  const handleItemClick = (e: any) => {
    // openAddUserModal();
  };
  useEffect(() => {
    getAllJoinRoomAsAdmin();
  }, [])
  const getAllJoinRoomAsAdmin = () => {
    const params: GetContactListUser = {
      nickname: userSelector?.username
    }
    preference.callGetUserContactList(params, (message: string, respContact: any) => {
      if (respContact && respContact.list && respContact.list.length) {
    
        setContactList(respContact.list.map((obj: any) => (
          {
            value: obj.contact_user.id,
            label: obj.contact_user.username
          }
        ))
        )
      } else {
        setContactList([])
      }
    }, (message: string) => { })
  }



  const handleSendFile = (e: any) => {
    setShowSendFileModal(true);
    // const fileUploadInput = document.createElement('input');
    // fileUploadInput.type = 'file';
    // fileUploadInput.addEventListener('change', handleFileUpload);
    // fileUploadInput.click();
  };

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    // Process the uploaded file or perform any desired action
  };

  const handleFindAndJoinRoom = (e: any) => {
    history.push(URLS.USER.FIND_AND_JOIN_ROOM);
  };

  const handleFindAndAddUser = (e: any) => {
    // history.push(URLS.USER.FIND_AND_ADD_USER);
    userAction.showFindAndAddUserModal(true, FIND_AND_ADD_USER_TYPE.BOTH, null);
  };

  const handleChangePassowrd = (e: any) => {
    userAction.showChangePasswordModal(true);
  };

  const gotoPage = (page: string) => {
    switch (page) {
      case "voiceMail":
        history.push(URLS.USER.MANAGE_VOICE_MAIL);
        break;
      case "videoMessage":
        history.push(URLS.USER.MANAGE_VIDEO_MESSAGE);
        break;
      case "findAndJoinRoom":
        history.push(URLS.USER.FIND_AND_JOIN_ROOM);
        break;
      case "createRoom":
        history.push(URLS.USER.GROUPS_AND_CATEGORY);
        break;
      case "findNearbyUsers":
        history.push(URLS.USER.NEAR_BY_USER);
        break;
    }
  };

  const getRoomDetails = () => {
    const params = {
      room_id: roomId
        ? parseInt(cryptr.decrypt(roomId))
        : parseInt(openRoomSubscriptionModal.room_id),
    };
    groupCategoryApi.callGetRoomDetails(
      params,
      (message: string, resp: any) => {
        if (resp && resp.list && resp.list.length) {
        }
      },
      (message: string) => {
        // toast.error(message)
      }
    );
  };

  const handleLockMickAndPushToTalk = (operation: string) => {
    groupCategoryAction.resetNormalUserMicHandleIsChanged(true);
    const params = {
      room_id: parseInt(cryptr.decrypt(roomId)),
      key_name: operation, // 'lock_mic' : 'push_to_talk',
      key_value:
        roomDetailsSelector &&
          roomDetailsSelector.user &&
          roomDetailsSelector.user.room_user_settings &&
          roomDetailsSelector.user.room_user_settings[operation]
          ? 0
          : 1,
    };
    groupCategoryApi.callChangeUserRoomSettings(
      params,
      (message: string, resp: any) => {
        if (resp) {
          getRoomDetails();
        }
      },
      (message: string) => {
        // toast.error(message)
      }
    );
  };

  const handleClearMyChat = () => {
    const params = {
      room_id: parseInt(cryptr.decrypt(roomId)),
    };
    groupCategoryApi.callClearRoomChat(
      params,
      (message: string, resp: any) => {
        if (resp) {
          getAllChatFromRoom();
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  // const handleClearAllChatsInPm = () => {
  //   const params = {
  //     pm_id: parseInt(cryptr.decrypt(pmId)),
  //   };
  //   pmWindowApi.callClearAllChatsInPm(
  //     params,
  //     (message: string, resp: any) => {
  //       if (resp) {
  //         getAllChatFromRoom();
  //       }
  //     },
  //     (message: string) => {
  //       toast.error(message);
  //     }
  //   );
  // };

  const getAllChatFromRoom = () => {
    const params = {
      room_id: parseInt(cryptr.decrypt(roomId)),
      download: false,
      isPM: false,
    };
    groupCategoryApi.callGetAllChatFromRoom(
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

  const handlePlayVideo = () => {
    setShowRoomVideoUploadModal(true);
  };

  const roomVideoUploadCloseModal = () => {
    if (showRoomVideoUploadModal) setShowRoomVideoUploadModal(false);
  };

  //Pm setting related Api call
  useEffect(() => {
    // getPmWindowDetails();
  }, [pmId])


  const getPmWindowDetails = () => {
    let params = {
      pm_id: parseInt(cryptr.decrypt(pmId)),
    };
    pmWindowApi.callGetPmsDetails(
      params,
      (message: string, resp: any) => {
        setPmDetail(resp)
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handleMicHandle = (operation: string) => {
    const params = {
      pm_id: parseInt(cryptr.decrypt(pmId)),
      key_name: operation,
      key_value:
        pmWindowDetailsSelector &&
          pmWindowDetailsSelector.pm_settings &&
          pmWindowDetailsSelector.pm_settings[operation]
          ? 0
          : 1,
    };
    pmWindowApi.callPmHeaderMenuSettingActionUpdate(
      params,
      (message: string, resp: any) => {
        if (resp) {
          getPmWindowDetails();
        }
      },
      (message: string) => { }
    );
  };

  const handleOpenMultiRecipientMessageModal = () => {
    userAction.showMultiRecipientMessageModal(true);
  };

  const handleChangeMyAccount = () => {
    setChangeMyAccount(true);
  };

  const changeMyAccountModalClose = () => {
    setChangeMyAccount(false);
  };

  //Pm Action
  const openPmUsersListModal = () => {
    setPmUsersListModal(true);
  };

  const closePmUsersListModal = () => {
    if (showPmUsersListModal) setPmUsersListModal(false);
  };

  // Clear Chat PM
  // const openClearChatPmModal = () => {
  //   setClearChatPmModal(true);
  // }

  // const closeClearChatPmModal = () => {
  //   if (showClearChatPmModal) setClearChatPmModal(false);
  // }

  //Dig sound
  const openDigSoundListModal = () => {
    setDigSoundListModal(true);
  };

  const closeDigSoundListModal = () => {
    if (showDigSoundListModal) setDigSoundListModal(false);
  };

  //upgrade room subscription
  const upgradeRoomSubscriptionOpenModal = () => {
    setUpgradeRoomSubscriptionModal(true);
  };

  const upgradeRoomSubscriptionCloseModal = () => {
    if (showUpgradeRoomSubscriptionModal) {
      setUpgradeRoomSubscriptionModal(false);
      setOpenRoomSubscriptionModal(null);
      localStorage.removeItem("open_room_subscription_modal");
    }
  };

  //switch room subscription
  const switchRoomSubscriptionOpenModal = () => {
    setSwitchRoomSubscriptionModal(true);
  };

  const switchRoomSubscriptionCloseModal = () => {
    if (showSwitchRoomSubscriptionModal) {
      setSwitchRoomSubscriptionModal(false);
      setOpenRoomSubscriptionModal(null);
      localStorage.removeItem("open_room_subscription_modal");
    }
  };

  //Upgrade Nickname Subscription
  const upgradeNicknameSubscriptionOpenModal = () => {
    setUpgradeNicknameSubscriptionModal(true);
  };

  const upgradeNicknameSubscriptionCloseModal = () => {
    if (showUpgradeNicknameSubscriptionModal) {
      setUpgradeNicknameSubscriptionModal(false);
      setOpenUserSubscriptionModal(null);
      localStorage.removeItem("open_user_subscription_modal");
    }
  };

  //Switch Nickname Subscription
  const switchNicknameSubscriptionOpenModal = () => {
    setSwitchNicknameSubscriptionModal(true);
  };

  const switchNicknameSubscriptionCloseModal = () => {
    if (showSwitchNicknameSubscriptionModal) {
      setSwitchNicknameSubscriptionModal(false);
      setOpenUserSubscriptionModal(null);
      localStorage.removeItem("open_user_subscription_modal");
      // hideLoader();
    } else {
      // toast("error");
    }
  };

  //Init Api call
  const userMeCall = () => {
    userApi.callGetMe(
      (message: string, resp: any) => { },
      (message: string, resp: any) => {
        toast.error(message);
      }
    );
  };

  // const hideAlert = () => {
  //     setAlert(null);
  // }

  // const removeRoomSubscription = () => {
  //     const params = {
  //         room_id: parseInt(cryptr.decrypt(roomId))
  //     }
  //     groupCategoryApi.callRemoveRoomSubscription(params, (message: string, resp: any) => {
  //         if (resp) {
  //             hideAlert()
  //             getRoomDetails()
  //         }
  //     }, (message: string) => {
  //         toast.error(message)
  //         console.error("Error at room subscription remove");
  //     })
  // }

  // const handleRemoveRoomSubscription = () => {
  //     setAlert(
  //         <SweetAlert
  //             warning
  //             showCancel
  //             confirmBtnText="Yes"
  //             cancelBtnText="No"
  //             cancelBtnBsStyle="danger"
  //             confirmBtnBsStyle="success"
  //             allowEscape={false}
  //             closeOnClickOutside={false}
  //             title={`Remove Subscription`}
  //             onConfirm={() => removeRoomSubscription()}
  //             onCancel={hideAlert}
  //             focusCancelBtn={true}
  //         >
  //             {`Are you sure you want to remove room subscription?`}
  //         </SweetAlert>+
  //     );
  // }

  const [clearChatAlert, setClearChatAlert] = useState<boolean>(false);
  const toast = useToaster();

  const hideAlert = () => {
    setClearChatAlert(false);
  };

  const handleClearAllChatsInPm = () => {
    setClearChatAlert(true);
  };

  const confirmClearChat = () => {
    const params = {
      pm_id: parseInt(cryptr.decrypt(pmId)),
    };
    pmWindowApi.callClearAllChatsInPm(
      params,
      (message: string, resp: any) => {
        if (resp) {
          toast.success(message);
          // getAllChatFromRoom();
          hideAlert();
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  
  return (
    <React.Fragment>
      {alert}
      <Menu id="menu_header_action_id" className="header-click-menu">
        <Item onClick={upgradeNicknameSubscriptionOpenModal}>
          Upgrade Nickname
        </Item>
        <Item onClick={switchNicknameSubscriptionOpenModal}>
          Switch Nickname Subscription
        </Item>
        <Separator />
        <Item onClick={(event) => gotoPage("voiceMail")}>
          Manage Voicemails
        </Item>
        <Item onClick={(event) => gotoPage("videoMessage")}>
          Manage Video Messages
        </Item>
        {/* <Item onClick={(event) => handleItemClick(event)}>PM a User</Item> */}
        <Item onClick={(event) => handleFindAndAddUser(event)}>
          Find &amp; Add a User
        </Item>
        <Item onClick={() => handleOpenMultiRecipientMessageModal()}>
          Multi-recipient Messages
        </Item>
        <Item onClick={(event) => gotoPage("findAndJoinRoom")}>
          Find &amp; Join a Room
        </Item>
        <Item onClick={(event) => gotoPage("findNearbyUsers")}>
          Find users nearby
        </Item>
        <Item onClick={(event) => joinChatRoomAsAdminModalOpen()}>
          Join a chat room as Admin
        </Item>
        {
          // getBooleanStatus(userSelector && userSelector.allow_create_room) ?
          <Item
            onClick={(event) => createRoomModalOpen(event)}
            disabled={
              getBooleanStatus(userSelector && userSelector.allow_create_room)
                ? false
                : true
            }
          >
            Create a Room
          </Item>
          // : null
        }
        {getBooleanStatus(userSelector && userSelector.allow_create_room) ? (
          ""
        ) : (
          <Item onClick={(event) => createPrivateRoomModalOpen(event)}>
            Create private room
          </Item>
        )}
{
  userSelector?.roles[0].title=='staff' ?
  (<Item onClick={(event) => createVipRoomModalOpen(event)}>
  Create VIP Room
</Item>)
  :''
}

        <Item onClick={(event) => handleChangePassowrd(event)}>
          Change my Password
        </Item>
        <Item onClick={handleChangeMyAccount}>Change my Account</Item>
      </Menu>

      <Menu id="room_header_menu_action_id" className="header-click-menu">
        {/* <Item onClick={(event) => handleItemClick(event)}>Invite</Item>
                <Separator /> */}
        <Item onClick={upgradeNicknameSubscriptionOpenModal}>
          Upgrade Nickname
        </Item>
        {/* <Separator /> */}
        {/* Below menu ony available to owner */}
        <RoleBasedContextMenuHOC role={[3]}>
          {/* {
                        roomDetailsSelector && roomDetailsSelector.room && roomDetailsSelector.room.subscription_info ?
                            <Item onClick={handleRemoveRoomSubscription}>Remove Room Subscription
                                <span style={{
                                    color: getSubscriptionColor(roomDetailsSelector && roomDetailsSelector.room ? roomDetailsSelector.room : null)
                                }}>
                                    ({
                                        getRoomSubscriptionTitle(roomDetailsSelector && roomDetailsSelector.room ? roomDetailsSelector.room : null)

                                    })
                                </span>

                            </Item> :
                            <Item onClick={upgradeRoomSubscriptionOpenModal}>Upgrade Room Subscription</Item>
                    } */}
          <Item onClick={upgradeRoomSubscriptionOpenModal}>
            Upgrade Room Subscription
          </Item>
          <Item onClick={switchRoomSubscriptionOpenModal}>
            Switch Room Subscription
          </Item>
        </RoleBasedContextMenuHOC>
        {/* <Item onClick={(event) => handleItemClick(event)}>Start my Webcam</Item> */}
        <Separator />
        <Item onClick={(event) => whoIsViewingMeModalOpen(event)}>
          Who is viewing me
        </Item>
        <Item onClick={() => handlePlayVideo()}>Play a Video</Item>
        <Item onClick={() => handleClearMyChat()}>Clear my Text Chat</Item>
        <Submenu
          label="Talk"
          disabled={
            roomDetailsSelector &&
            roomDetailsSelector.room &&
            roomDetailsSelector.room.voice_enabled == 0
          }
        >
          {
            <Item
              onClick={(e) =>
                handleLockMickAndPushToTalk(MENU_OPERATIONS.PUSH_TO_TALK)
              }
              className={clsx({
                "disable-link":
                  roomDetailsSelector &&
                  roomDetailsSelector.user &&
                  roomDetailsSelector.user.room_user_settings &&
                  roomDetailsSelector.user.room_user_settings.push_to_talk,
              })}
            >
              {roomDetailsSelector &&
                roomDetailsSelector.user &&
                roomDetailsSelector.user.room_user_settings &&
                roomDetailsSelector.user.room_user_settings.push_to_talk ? (
                <i className="fa fa-check" aria-hidden="true"></i>
              ) : null}
              Push to Talk
            </Item>
          }

          {
            <Item
              className={clsx({
                "disable-link":
                  roomDetailsSelector &&
                  roomDetailsSelector.user &&
                  roomDetailsSelector.user.room_user_settings &&
                  roomDetailsSelector.user.room_user_settings.lock_mic,
              })}
              onClick={(e) => {
                handleLockMickAndPushToTalk(MENU_OPERATIONS.LOCK_MIC);
              }}
            >
              {roomDetailsSelector &&
                roomDetailsSelector.user &&
                roomDetailsSelector.user.room_user_settings &&
                roomDetailsSelector.user.room_user_settings.lock_mic ? (
                <i className="fa fa-check" aria-hidden="true"></i>
              ) : null}
              Lock Mic (Hands Free)
            </Item>
          }
        </Submenu>
      </Menu>

      <Menu id="pm_header_actions_id" className="header-click-menu">
        <Item onClick={(event) => openPmUsersListModal()}>View Profile</Item>
        <Item onClick={(event) => openAddUserModal('add')}>Add to List </Item>
        <Item onClick={(event) => openAddUserModal('remove')}>Remove from List</Item>
        <Item onClick={(event) => handleItemClick(event)}>Block the User</Item>
        {/* <Item onClick={(event) => openClearChatPmModal()}>Clear Chat</Item> */}
        <Item onClick={handleClearAllChatsInPm}>Clear Chat</Item>
        {/* <Item onClick={(event) => handleItemClick(event)}>Start my Webcam</Item> */}
        <Item onClick={(event) => handleItemClick(event)}>Customize Nickname</Item>
        {/* <Item onClick={(event) => handleItemClick(event)}>Invite Others</Item> */}
        <Separator />
        <Submenu
          label="Talk"
          disabled={
            roomDetailsSelector &&
            roomDetailsSelector.room &&
            roomDetailsSelector.room.voice_enabled == 0
          }
        >
          <Item onClick={() => handleMicHandle("push_to_talk")}>
            {pmWindowDetailsSelector &&
              pmWindowDetailsSelector.pm_settings &&
              pmWindowDetailsSelector.pm_settings.push_to_talk ? (
              <i className="fa fa-check" aria-hidden="true"></i>
            ) : null}
            Push to Talk
          </Item>
          <Item
            onClick={() => {
              handleMicHandle("lock_mic");
            }}
          >
            {pmWindowDetailsSelector &&
              pmWindowDetailsSelector.pm_settings &&
              pmWindowDetailsSelector.pm_settings.lock_mic ? (
              <i className="fa fa-check" aria-hidden="true"></i>
            ) : null}
            Lock Mic (Hands Free)
          </Item>
        </Submenu>
        <Separator />
        <Item onClick={(event) => handleSendFile(event)}>Send a File</Item>
        <Item onClick={(event) => openDigSoundListModal()}>
          Send a Dig Sound
        </Item>
        {/* <Item onClick={(event) => handleItemClick(event)}>Send a Screen Capture </Item> */}
        <Submenu label="Share Screen With">
          <Item onClick={(event) => handleItemClick(event)}>
            This User Only
          </Item>
          <Item onClick={(event) => handleItemClick(event)}>
            All Users in This Conversation
          </Item>
        </Submenu>
      </Menu>

      {changePasswordModalOpenSelector ? (
        <ChangePasswordModal shouldShow={changePasswordModalOpenSelector} />
      ) : null}

      {findAndAddUserModalOpenSelector.isOpen ? (
        <FindAndAddUserModal
          shouldShow={findAndAddUserModalOpenSelector.isOpen}
        />
      ) : null}

      {showCreateRoomModal ? (
        <CreateRoomTwoModal
          onClose={createRoomCloseModal}
          shouldShow={showCreateRoomModal}
          roomList={() => { }}
          formStep={createRoomFormStep > 1 ? createRoomFormStep : undefined}
        />
      ) : null}

{showCreateVipRoomModal ? (
        <CreateVipRoomModal
          onClose={createVipRoomCloseModal}
          shouldShow={showCreateVipRoomModal}
          roomList={() => { }}
                 />
      ) : null}

      {showRoomVideoUploadModal ? (
        <UploadRoomVideoModal
          onClose={roomVideoUploadCloseModal}
          shouldShow={showRoomVideoUploadModal}
          roomId={parseInt(cryptr.decrypt(roomId))}
          fromWhere="roomActionMenu"
        />
      ) : null}
      {showWhoIsViewingMyWebcamModal ? (
        <WhoIsViewingMeModal
          onClose={whoIsViewingMeModalClose}
          shouldShow={showWhoIsViewingMyWebcamModal}
          roomId={parseInt(cryptr.decrypt(roomId))}
        />
      ) : null}

      {isOpenMultiRecipientMessageModal ? (
        <MultiRecipientMessageModal
          shouldShow={isOpenMultiRecipientMessageModal}
        />
      ) : null}

      {joinChatRoomAsAdmin ? (
        <JoinChatRoomAsAdmin
          onClose={joinChatAsAdminModalClose}
          shouldShow={joinChatRoomAsAdmin}
        />
      ) : null}

      {changeMyAccount ? (
        <ChangeAccount
          onClose={changeMyAccountModalClose}
          shouldShow={changeMyAccount}
        />
      ) : null}

      {showPmUsersListModal ? (
        <PmUsersListModal
          onClose={closePmUsersListModal}
          shouldShow={showPmUsersListModal}
          users={pmWindowDetailsSelector.users.filter(
            (u: any) => u.user_id !== userSelector?.id
          )}
        />
      ) : null}

      {showAddUserPmModal ? (
        <AddContactPmModal
          shouldShow={showAddUserPmModal}
          onClose={closeAddUserPmModal}
          PmDetail={PmDetail}
          pmId={pmId}
          contactData={contactList}
          flag={'add'}
        />
      ) : null}

{/* showRemoveUserPmModal */}
{showRemoveUserPmModal ? (
        <AddContactPmModal
          shouldShow={showRemoveUserPmModal}
          onClose={closeRemoveUserPmModal}
          PmDetail={PmDetail}
          pmId={pmId}
          contactData={contactList}
          flag={'remove'}
        />
      ) : null}
      {/* {showClearChatPmModal ? (
        <ClearChatPmModal
          onClose={closeClearChatPmModal}
          shouldShow={showClearChatPmModal}
          userId={0} onClearChat={function (userId: number): void {
            throw new Error("Function not implemented.");
          } }        />
      ) : null} */}

      {showDigSoundListModal ? (
        <DigSoundListModal
          shouldShow={showDigSoundListModal}
          onClose={closeDigSoundListModal}
          pmId={pmWindowDetailsSelector.id}
        />
      ) : null}

      {showUpgradeRoomSubscriptionModal ? (
        <UpgradeRoomSubscriptionModal
          shouldShow={showUpgradeRoomSubscriptionModal}
          onClose={upgradeRoomSubscriptionCloseModal}
          roomId={
            roomId
              ? parseInt(cryptr.decrypt(roomId))
              : parseInt(openRoomSubscriptionModal.room_id)
          }
          onCancel={getRoomDetails}
          openRoomSubscriptionModal={openRoomSubscriptionModal}
        />
      ) : null}

      {showSwitchRoomSubscriptionModal ? (
        <SwitchRoomSubscriptionModal
          shouldShow={showSwitchRoomSubscriptionModal}
          onClose={switchRoomSubscriptionCloseModal}
          roomId={
            roomId
              ? parseInt(cryptr.decrypt(roomId))
              : parseInt(openRoomSubscriptionModal.room_id)
          }
          onCancel={getRoomDetails}
          openRoomSubscriptionModal={openRoomSubscriptionModal}
        />
      ) : null}

      {showUpgradeNicknameSubscriptionModal ? (
        <UpgradeNicknameSubscriptionModal
          shouldShow={showUpgradeNicknameSubscriptionModal}
          onClose={upgradeNicknameSubscriptionCloseModal}
          onCancel={userMeCall}
          openUserSubscriptionModal={openUserSubscriptionModal}
        />
      ) : null}

      {showSwitchNicknameSubscriptionModal ? (
        <SwitchNicknameSubscriptionModal
          shouldShow={showSwitchNicknameSubscriptionModal}
          onClose={switchNicknameSubscriptionCloseModal}
          onCancel={userMeCall}
          openUserSubscriptionModal={openUserSubscriptionModal} roomId={0} />
      ) : null}

      {clearChatAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes"
          cancelBtnText="No"
          cancelBtnBsStyle="danger"
          confirmBtnBsStyle="success"
          allowEscape={false}
          closeOnClickOutside={false}
          title="Clear Chat"
          onConfirm={confirmClearChat}
          onCancel={hideAlert}
          focusCancelBtn={true}
        >
          Are you sure you want to clear chat?
        </SweetAlert>
      )}

    </React.Fragment>
  );
};

export default ActionContextMenu;