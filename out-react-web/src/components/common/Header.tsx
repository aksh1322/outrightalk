import React, { useContext, useEffect, useState } from "react";
import { Link, NavLink, useHistory } from "react-router-dom";
import FileContextMenu from "src/components/clickContextMenu/fileContextMenu";
import EditContextMenu from "src/components/clickContextMenu/editContextMenu";
import ActionContextMenu from "src/components/clickContextMenu/actionContextMenu";
import FavouriteContextMenu from "src/components/clickContextMenu/favouriteContextMenu";
import SettingContextMenu from "src/components/clickContextMenu/settingContextMenu";
import HelpContextMenu from "src/components/clickContextMenu/helpContextMenu";
import AdminContextMenu from "src/components/clickContextMenu/adminContextMenu";
import { useToaster } from "src/_common/hooks/actions/common/appToasterHook";
import jsPDF from "jspdf";

import { useUserApi } from "src/_common/hooks/actions/user/appUserApiHook";
import {
  URLS,
  STORAGE,
  getNameInitials,
  HEADER_TYPE,
  CUSTOM_MESSAGE,
  getSubscriptionColor,
  CRYPTO_SECRET_KEY,
  LOGIN_STORAGE,
  IS_ADULT,
} from "src/_config";
import { useAppUserAction } from "src/_common/hooks/actions/user/appUserActionHook";
import {
  useAppUserCallDetails,
  useAppUserDetailsSelector,
  // useAppUserCallDetails
} from "src/_common/hooks/selectors/userSelector";
import { useAppGroupCategoryAction } from "src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook";
import { MainWindowHeaderMenu } from "./headerMenuItems/mainWindow";
import { RoomWindowHeaderMenu } from "./headerMenuItems/roomWindow";
import { PmWindowHeaderMenu } from "./headerMenuItems/pmWindow";
import { useUserPreferenceApi } from "src/_common/hooks/actions/userPreference/appUserPreferenceApiHook";
import Notification from "./notification";
import { useAppPmWindowAction } from "src/_common/hooks/actions/pmWindow/appPmWindowActionHook";
import SweetAlert from "react-bootstrap-sweetalert";
import { useCallContext } from "src/hooks";

// import { AntmediaContext } from 'src';
import {
  useAppPmWindowDetails,
  useAppIsOpenPmWindowCallAlertSelector,
  useAppPmWindowIsCallAcceptedSelector,
} from "src/_common/hooks/selectors/pmWindowSelector";
import { useChatContext } from "src/hooks";
const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

interface HeaderProps {
  type?: string;
}

function Header({ type }: HeaderProps) {
  const userApi = useUserApi();
  const history = useHistory();
  const toast = useToaster();
  const userAction = useAppUserAction();
  const preference = useUserPreferenceApi();
  const groupCategoryAction = useAppGroupCategoryAction();
  const pmWindowAction = useAppPmWindowAction();
  const userSelector = useAppUserDetailsSelector();
  const { openCall, openAudioCall, microphoneState } = useCallContext();
  const [alert, setAlert] = useState<any>(null);
  // const antmedia = useContext<any>(AntmediaContext);
  const pmWindowDetailsSelector = useAppPmWindowDetails();

  const [callModal, setCallModal] = useState<any>(null);
  const isCallAlertModalOpen = useAppIsOpenPmWindowCallAlertSelector();
  const isPmCallAccepted = useAppPmWindowIsCallAcceptedSelector();
  const userCallDetails = useAppUserCallDetails();
  const [ongoingCallAlert, setOngoingCallAlert] = useState<any>(null);

  const { currentSuperRoomChat, currentRoomChat } = useChatContext();

  useEffect(() => {
    if (
      pmWindowDetailsSelector &&
      userSelector &&
      (pmWindowDetailsSelector.is_video_on ||
        pmWindowDetailsSelector.is_voice_on) &&
      pmWindowDetailsSelector.is_initiated_by &&
      pmWindowDetailsSelector.is_initiated_by != userSelector.id &&
      (!isPmCallAccepted || isPmCallAccepted.pmId != pmWindowDetailsSelector.id)
    ) {
      let callingUser = pmWindowDetailsSelector.users.find((ele: any) => {
        return ele.user_id == pmWindowDetailsSelector.is_initiated_by;
      });

      let isCallAccepted = pmWindowDetailsSelector.users.find((ele: any) => {
        return ele.user_id == userSelector.id;
      });

      if (
        callingUser &&
        isCallAccepted &&
        isCallAccepted.is_accept_audio_video == 0
      ) {
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
              console.log(sound, "sound");
              sound.play().catch((error) => {
                console.error("Error playing sound:", error);
              });
            }
          }
        }
        pmWindowAction.openClosePmCallAlertModal(
          <SweetAlert
            warning
            showCancel
            confirmBtnText="Accept"
            cancelBtnText="Reject"
            cancelBtnBsStyle="danger"
            confirmBtnBsStyle="success"
            allowEscape={false}
            closeOnClickOutside={false}
            title="Ringing"
            onConfirm={() => {
              // setCallModal(null)
              // if (!userCallDetails) {
              pmWindowAction.openClosePmCallAlertModal(null);
              pmWindowAction.pmCallAccepted({
                pmId: pmWindowDetailsSelector.id,
                is_initiated_by: pmWindowDetailsSelector.is_initiated_by,
              });

              localStorage.setItem(
                "receivingCallInsidePm",
                JSON.stringify({
                  pmId: pmWindowDetailsSelector.id,
                  is_initiated_by: pmWindowDetailsSelector.is_initiated_by,
                })
              );

              const pmId = cryptr.encrypt(pmWindowDetailsSelector.id);
              // history.replace('')
              history.push(`/pm/${pmId}`);
              // }
              // else {
              //   setOngoingCallAlert(
              //     < SweetAlert
              //     warning
              //     showCancel={false}
              //     confirmBtnText="Ok"
              //     cancelBtnText="Reject"
              //     cancelBtnBsStyle="danger"
              //     confirmBtnBsStyle="success"
              //     allowEscape={false}
              //     closeOnClickOutside={false}
              //     title="Ongoing call"
              //     onConfirm={() => {
              //       pmWindowAction.openClosePmCallAlertModal(null)
              //       setOngoingCallAlert(null)
              //     }
              //     }
              //     onCancel={() => {

              //     }
              //     }
              //     focusCancelBtn={true}
              //   >
              //     {`You are already in a ${pmWindowDetailsSelector.is_video_on == 1 ? "video" : "call"} session! Please terminate it first and then try again.`}
              //   </SweetAlert >
              //   )
              // }
            }}
            onCancel={() => {
              // setCallModal(null)
              pmWindowAction.openClosePmCallAlertModal(null);
            }}
            focusCancelBtn={true}
          >
            {`${
              callingUser.user_info.username
            } is inviting you to start a private ${
              pmWindowDetailsSelector.is_video_on == 1 ? "video" : "call"
            } session. Do you want to accept the invitation?`}
          </SweetAlert>
        );
      } else {
        pmWindowAction.openClosePmCallAlertModal(null);
      }
    } else {
      pmWindowAction.openClosePmCallAlertModal(null);
      // setCallModal(null)
    }
  }, [
    pmWindowDetailsSelector,
    userSelector,
    openCall,
    openAudioCall,
    microphoneState,
  ]);

  const [openUserSubscriptionModal, setOpenUserSubscriptionModal] =
    useState<any>(null);
  const [openRoomSubscriptionModal, setOpenRoomSubscriptionModal] =
    useState<any>(null);
  const [openVirtualCreditsModal, setOpenVirtualCreditsModal] =
    useState<any>(null);

  const hideAlert = () => {
    setAlert(null);
  };

  // const handleLogout = (evt: any) => {
  //   evt && evt.preventDefault()
  //   setAlert(
  //     <SweetAlert
  //       warning
  //       showCancel
  //       confirmBtnText="Yes"
  //       cancelBtnText="No"
  //       cancelBtnBsStyle="danger"
  //       confirmBtnBsStyle="success"
  //       allowEscape={false}
  //       closeOnClickOutside={false}
  //       title="Log Out"
  //       onConfirm={() => LogOut()}
  //       onCancel={hideAlert}
  //       focusCancelBtn={true}
  //     >
  //       Are you sure you want to logout OutrighTalk?
  //     </SweetAlert>
  //   );
  // }

  const LogOut = (evt: any) => {
    evt && evt.preventDefault();
    userApi.callLogout(
      (message: string, resp: any) => {
        if (resp) {
          userAction.logout();
          localStorage.removeItem(STORAGE);
          localStorage.removeItem(LOGIN_STORAGE.SIGNED_IN_AS);
          localStorage.removeItem(LOGIN_STORAGE.SIGNED_IN_TOKEN);
          localStorage.removeItem('timeStamp');
          localStorage.removeItem('roomSettings');
          localStorage.setItem(IS_ADULT, "0");
          groupCategoryAction.emptyRoomListCategoryWise();
          toast.success("Logged out successfully");
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handleMyActiveRooms = (e: any) => {
    e.preventDefault();
    groupCategoryAction.activeRoomsPopDownHandler(true);
  };

  const handleMyActivePmWindow = (e: any) => {
    e.preventDefault();
    pmWindowAction.activePmWindowPopDownHandler(true);
  };

  //Update user current location API call
  const updateUserCurentLocation = (location: any) => {
    const params = {
      curr_loc_lat: location.coords.latitude,
      curr_loc_lon: location.coords.longitude,
    };
    userApi.callUpdateCurrentLocation(
      params,
      (message: string) => {},
      (message: string) => {}
    );
  };

  //Below useEffect is used for Update user current location timer
  useEffect(() => {
    const update = async () => {
      navigator.geolocation.getCurrentPosition(
        updateUserCurentLocation,
        () => {}
      );
    };
    const timer = setInterval(() => {
      update();
    }, 300000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let params = {};
    preference.callGetUserPreference(
      params,
      (message: string, resp: any) => {},
      (message: string) => {
        toast.error(message);
      }
    );
  }, []);
  // const myObject = {
  //   room_id: 98,
  //   group_id: 4,
  //   plan_id: 2,
  //   duration_id: 6
  // }
  // localStorage.setItem("open_room_subscription_modal", JSON.stringify(myObject));

  // let newObject: any = window.localStorage.getItem("myObject");
  // console.log(JSON.parse(newObject));

  useEffect(() => {
    let ifOpen = localStorage.getItem("open_user_subscription_modal");
    if (ifOpen) {
      ifOpen = JSON.parse(ifOpen);
      setOpenUserSubscriptionModal(ifOpen);
    }
  }, []);

  const goToRoomDetails = (group: any, room: any) => {
    const groupId = cryptr.encrypt(group);
    const roomId = cryptr.encrypt(room);
    history.push(`/${groupId}/${roomId}/room-details`);
  };
  useEffect(() => {
    let ifOpen: any = localStorage.getItem("open_room_subscription_modal");
    if (ifOpen) {
      ifOpen = JSON.parse(ifOpen);
      setOpenRoomSubscriptionModal(ifOpen);

      // goToRoomDetails(ifOpen.group_id, ifOpen.room_id)
    }
  }, []);

  useEffect(() => {
    let ifOpen: any = localStorage.getItem("open_virtual_credits_modal");
    if (ifOpen) {
      ifOpen = JSON.parse(ifOpen);
      setOpenVirtualCreditsModal(ifOpen);
    }
  }, []);

  // get messages to save with proper format

  const groupRoomChat = currentSuperRoomChat?.map((item: any) => {
    const formattedDate = new Date(item.createdAt).toLocaleString(); // Format the timestamp
    return {
      message: item?.message,
      createdAt: formattedDate,
      nickname: item?.sender?.nickname,
    };
  });

  const pmRoomChat = currentRoomChat?.map((item: any) => {
    const formattedDate = new Date(item.createdAt).toLocaleString(); // Format the timestamp
    return {
      message: item?.message,
      createdAt: formattedDate,
      nickname: item?.sender?.nickname,
    };
  });

  const generatePDF = (chatHistory: any) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let currentY = 10;

    chatHistory.forEach((message: any) => {
      const nickname = `Nickname: ${message.nickname || "Unknown"}`;
      const date = `Date: ${message.createdAt}`;
      const text = message.message;

      const nicknameLines = doc.splitTextToSize(
        nickname,
        doc.internal.pageSize.width - 20
      );
      const dateLines = doc.splitTextToSize(
        date,
        doc.internal.pageSize.width - 20
      );

      let contentLines;
      if (text.includes("<img")) {
        const match = /src="(.*?)"/.exec(text);
        const url = match ? match[1] : "";
        doc.addImage(url, "JPEG", 10, currentY, 17, 17);
        contentLines = [text];
      } else {
        contentLines = doc.splitTextToSize(
          text,
          doc.internal.pageSize.width - 20
        );
      }

      const lineHeight = 7; // Adjust this value according to your font and size
      const totalLines =
        nicknameLines.length + dateLines.length + contentLines.length;
      const totalHeight = totalLines * lineHeight;

      if (currentY + totalHeight > pageHeight) {
        doc.addPage();
        currentY = 10;
      }

      doc.text(nicknameLines, 10, currentY);
      currentY += nicknameLines.length * lineHeight;
      doc.text(dateLines, 10, currentY);
      currentY += dateLines.length * lineHeight;

      if (contentLines[0].includes("<img")) {
        currentY += 55; // Adjust vertical position after adding the image
      } else {
        doc.text(contentLines, 10, currentY);
        currentY += contentLines.length * lineHeight + 10; // Add some extra padding between messages
      }
    });

    doc.save("chat_history.pdf");
  };

  const handlePdfSave = () => {
    generatePDF(pmRoomChat);
  };

  const handleGroupPdfSave = () => {
    generatePDF(groupRoomChat);
  };

  return (
    <React.Fragment>
      {alert}

      <header id="page-topbar">
        {isCallAlertModalOpen}
        {ongoingCallAlert}
        <div className="navbar-header">
          <div className="d-flex">
            <div className="navbar-brand-box">
              <Link
                to={URLS.USER.DASHBOARD}
                className="logo logo-dark"
                onClick={() => {
                  // if (antmedia.publishStreamId) antmedia.handleLeaveFromRoom();
                }}
              >
                <span className="logo-sm">
                  <img src="/img/logo.png" alt="" height={40} />
                </span>
                <span className="logo-lg">
                  <img src="/img/logo.png" alt="" height={40} />
                </span>
              </Link>
              <a href="#" className="logo logo-light">
                <span className="logo-sm">
                  <img src="/img/logo.png" alt="" height={40} />
                </span>
                <span className="logo-lg">
                  <img src="/img/logo.png" alt="" height={40} />
                </span>
              </a>
            </div>
          </div>
          <a
            href="#"
            onClick={(e) => handleMyActiveRooms(e)}
            className="my-active-btn"
          >
            <span></span>Rooms I'm in
          </a>
          <a
            href="#"
            onClick={(e) => handleMyActivePmWindow(e)}
            className="my-active-btn"
          >
            <span></span>My PMs
          </a>
          <div className="d-flex ml-auto">
            <div className="top-menu">
              {type == HEADER_TYPE.ROOM_WINDOW ? (
                <RoomWindowHeaderMenu />
              ) : type === HEADER_TYPE.PM_WINDOW ? (
                <PmWindowHeaderMenu />
              ) : (
                <MainWindowHeaderMenu />
              )}
            </div>

            <Notification />

            <div className="dropdown d-inline-block top-user-panel">
              <button
                type="button"
                className="btn header-item waves-effect"
                id="page-header-user-dropdown"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <div className="top-user-avatar">
                  {userSelector &&
                  userSelector.avatar &&
                  userSelector.avatar.thumb ? (
                    <img
                      className="rounded-circle header-profile-user"
                      src={userSelector.avatar.thumb}
                      alt="Header Avatar"
                    />
                  ) : (
                    <span className="header-avatar">
                      {getNameInitials(userSelector?.username)}
                    </span>
                  )}
                  <span
                    className={
                      userSelector && userSelector.visible_status
                        ? "top-user-status st-" + userSelector.visible_status
                        : "top-user-status st-1"
                    }
                  />
                </div>
                <span
                  className="d-none d-xl-inline-block ml-1"
                  key="t-henry"
                  style={{
                    color: getSubscriptionColor(userSelector),
                  }}
                >
                  {userSelector && userSelector.username
                    ? userSelector.username
                    : ".."}
                </span>
                <i className="mdi mdi-chevron-down d-none d-xl-inline-block" />
              </button>
              <div className="dropdown-menu dropdown-menu-right">
                <NavLink to={URLS.USER.MY_PROFILE} className="dropdown-item">
                  <i className="bx bx-user font-size-16 align-middle mr-1" />
                  <span key="t-profile">Profile</span>
                </NavLink>
                <a className="dropdown-item" href="#">
                  <i className="bx bx-wallet font-size-16 align-middle mr-1" />
                  <span key="t-my-wallet">My Wallet</span>
                </a>
                {/* <a className="dropdown-item d-block" href="#"> */}
                <NavLink
                  to={URLS.USER.USER_PREFERENCES}
                  className="dropdown-item d-block"
                >
                  {/* <span className="badge badge-success float-right">11</span> */}
                  <i className="bx bx-wrench font-size-16 align-middle mr-1" />
                  <span key="t-settings">Preferences</span>
                </NavLink>
                {/* </a> */}
                {/* <a className="dropdown-item" href="#">
                  <i className="bx bx-lock-open font-size-16 align-middle mr-1" />
                  <span key="t-lock-screen">Lock screen</span>
                </a> */}
                {/* <div className="dropdown-divider" /> */}
                <a
                  className="dropdown-item text-danger"
                  href="#"
                  onClick={(e) => LogOut(e)}
                >
                  <i className="bx bx-power-off font-size-16 align-middle mr-1 text-danger" />{" "}
                  <span key="t-logout">Logout</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <FileContextMenu
        openVirtualCreditsModal={openVirtualCreditsModal}
        setOpenVirtualCreditsModal={setOpenVirtualCreditsModal}
        handlePdfSave={handlePdfSave}
        handleGroupPdfSave={handleGroupPdfSave}
      />

      <EditContextMenu />

      <ActionContextMenu
        openUserSubscriptionModal={openUserSubscriptionModal}
        setOpenUserSubscriptionModal={setOpenUserSubscriptionModal}
        openRoomSubscriptionModal={openRoomSubscriptionModal}
        setOpenRoomSubscriptionModal={setOpenRoomSubscriptionModal}
      />

      <FavouriteContextMenu />

      <HelpContextMenu />

      <AdminContextMenu />

      <SettingContextMenu />
    </React.Fragment>
  );
}

export default Header;
