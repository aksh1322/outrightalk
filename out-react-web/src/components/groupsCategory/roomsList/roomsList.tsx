import queryString from "query-string";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router";
import { toast } from "react-toastify";
import { useAppGroupCategoryAction } from "src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import { useAppRoomListCategoryWiseSelector } from "src/_common/hooks/selectors/groupCategorySelector";
import { LOGIN_STORAGE, URLS } from "src/_config";
import {
  capitalizeFirstLetter,
  getDisableStatus,
  getRoomcategoryInitials,
  getStaticColor,
  getSubscriptionColor,
} from "src/_config/functions";
import PasswordShowAdultRoomModal from "../../commonModals/groupsCategoryModals/passwordShowAdultRoomsModal";
import SearchRoomForm from "../common/searchRoom";
import CreateRoomTwoModal from "./createRoomModal/createRoomModalTwo";
// import { AntmediaContext } from "src";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";

import { capitalize } from "lodash";
import { useUserPreferenceApi } from "src/_common/hooks/actions/userPreference/appUserPreferenceApiHook";
import { CRYPTO_SECRET_KEY } from "src/_config";
import PasswordShowVipRoomModal from "src/components/commonModals/groupsCategoryModals/passwordShowVipRoomsModal";
import ParentalControlPasswordConfirmationModal from "src/components/commonModals/parentalControlPasswordConfirmationModal/parentalControlPasswordConfirmationModal";
import { roomListCategoryWise } from "src/sagas/groupCategorysaga";
import SweetAlert from "react-bootstrap-sweetalert";
import { OptionValue } from "src/_common/interfaces/common";
const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

interface LockWordFormValues {
  lockword: string;
  rooms: OptionValue | undefined | any;
}
function RoomsListPage() {
  const history = useHistory();
  const location = useLocation();
  const getQueryValue = queryString.parse(location.search);
  const { groupId } = useParams<any>();
  const rommListCategoryWise = useAppRoomListCategoryWiseSelector();
  const groupCategoryAction = useAppGroupCategoryAction();
  const groupCategoryApi = useGroupCategoryApi();
  const [room, setRoom] = useState<any>();
  const [showAdultRoomPasswordModal, setAdultRoomPasswordModal] =
    useState<boolean>(false);
  const [showCreateRoomModalOne, setCreateRoomModalOne] =
    useState<boolean>(false);
  const [isCheckAdultRooms, setIsCheckAdultRooms] = useState<any>(
    localStorage.getItem("isAdult") == "1" ? true : false
  );
  const [vip, setVip] = useState<any>(
    localStorage.getItem("isVip") == "1" ? 1 : 0
  );
  const [isCheckVipRooms, setIsCheckVipRooms] = useState<any>(
    localStorage.getItem("isVip") == "1" ? true : false
  );
  const [showVipRoomsPasswordModal, setShowVipRoomsPasswordModal] =
    useState<boolean>(false);
  const [roomName, setRoomName] = useState("");
  const [roomID, setRoomID] = useState("");
  const [groupID, setGroupId] = useState("");
  const [language, setLanguage] = useState<any>({});
  const [resetSearchParms, setResetSearchParms] = useState<boolean>(false);
  const [eighteenPlus, setEighteenPlus] = useState<any>(
    localStorage.getItem("isAdult")
  );
  const [roomLanguageList, setRoomLanguageList] = useState<any>();
  const [roomCategoryList, setRoomCategoryList] = useState<any>();
  const [showPasswordConfirmationModal, setShowPasswordConfirmationModal] =
    useState<boolean>(false);
  const [selectedAccountPassword, setSelectedAccountPassword] =
    useState<any>(null);
  const [activerooms, SetActiveRooms] = useState<any>();
  const [alert, setAlert] = useState<any>(null);
  const preference = useUserPreferenceApi();
  const useSelector = useAppUserDetailsSelector();
  // const [roomGroupList, setRoomGroupList] = useState<any>();

  // const antmedia = useContext<any>(AntmediaContext);
//   const value = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS);
//   const {
//     id: signedInUserId,
//     send_bird_user: { sb_access_token },
//   } = value ? JSON.parse(value) : "";

const value = localStorage.getItem(LOGIN_STORAGE?.SIGNED_IN_AS);
// const {
//   id: signedInUserId,
//   send_bird_user: { sb_access_token },
// } = value ? JSON.parse(value) : "";
const data= value ? JSON.parse(value) : '';


  const { sb_access_token, sb_user_id } = data?.send_bird_user;
  const adultRoomShowPasswordModalOpen = (e: any) => {
    e.preventDefault();
    setAdultRoomPasswordModal(true);
  };

  const adultRoomShowPasswordCloseModal = () => {
    if (showAdultRoomPasswordModal) setAdultRoomPasswordModal(false);
  };
  const vipRoomShowPasswordModalOpen = (e: any) => {
    e.preventDefault();
    setShowVipRoomsPasswordModal(true);
  };
  const vipRoomShowPasswordCloseModal = () => {
    if (showVipRoomsPasswordModal) setShowVipRoomsPasswordModal(false);
  };

  const createRoomOneModalOpen = (e: any) => {
    setCreateRoomModalOne(true);
  };

  const createRoomOneCloseModal = () => {
    if (showCreateRoomModalOne) setCreateRoomModalOne(false);
  };

  useEffect(() => {
    getActiveRoom();
  }, []);
  const getActiveRoom = () => {
    groupCategoryApi.callGetMyActiveRooms(
      (message: string, resp: any) => {
        SetActiveRooms(resp?.active_rooms);
      },
      (message: string) => {}
    );
  };

  const isParentalPasswordConfirmationIsCorrect = (status: boolean) => {
    if (status) {
      passwordConfirmationModalClose();
      //   e.preventDefault();
      // if (antmedia.publishStreamId) antmedia.handleLeaveFromRoom();
      const groupId = cryptr.encrypt(groupID);
      const roomId = cryptr.encrypt(roomID);
      history.push(`${roomId}/room-details`);
      //   handleShowRemovePasswordConfirmAlert()
    } else {
      passwordConfirmationModalClose();
      toast.error("Invalid Password");
    }
  };
  const passwordConfirmationModalOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPasswordConfirmationModal(true);
  };
  const passwordConfirmationModalClose = () => {
    if (showPasswordConfirmationModal) setShowPasswordConfirmationModal(false);
  };

  const handleShowAlert = (
    exit_room: number,
    roomId: number,
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
        onConfirm={() => joinRoom(exit_room, roomId, activeRoomId)}
        focusCancelBtn={true}
        onCancel={handleMultipleJoinRoomCancel}
      >
        You have a basic nickname, you cannot be in more than one voice room
        simultaneously, you will exit the current room automatically. Do you
        want to proceed?
      </SweetAlert>
    );
  };
  const handleMultipleJoinRoomCancel = () => {
    setAlert(null);
    history.replace("");
    history.push('groups');
  };

  const handleShowAlerts = (exit_room: number) => {
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
        onConfirm={() => redirecttoactiveRooms()}
        focusCancelBtn={true}
        onCancel={handleMultipleJoinRoomCancel}
        >
        <p>
          You have reached your room joining limit. You need to exit the room to
          join a new one.
        </p>
      </SweetAlert>
    );
  };

  const joinRoom = (
    exit_room: number,
    roomId: number,
    activeRoomId: number
  ) => {
      handleExitRoom(activeRoomId);
    //   getActiveRoom();
      setTimeout(() => {
          history.push(`${roomId}/room-details`);
      }, 3000);
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

        // window.location.reload();
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };
  const redirecttoactiveRooms = () => {
    // onClose(true);
    groupCategoryAction.activeRoomsPopDownHandler(true);
    setAlert(null);
  };
  const goToRoomDetails = (
    e: any,
    group: any,
    room: any,
    roomCategory: any
  ) => {
    setRoomID(room);
    setGroupId(group);
    if (
      useSelector?.is_set_parental &&
      roomCategory?.category_title != "General"
    ) {
      // passwordConfirmationModalOpen()
      setShowPasswordConfirmationModal(true);
    } else {
      e.preventDefault();

      let SimultaneousRoom = useSelector?.is_subscribed?.feature.filter(
        (x: any) => x.type == "simultaneous_room"
      );
      console.log(SimultaneousRoom,"simultaneous room");
      
      if (SimultaneousRoom) {
        if (activerooms?.length > SimultaneousRoom[0]?.value) {
          handleShowAlerts(1);
        } else {
          // const groupId = cryptr.encrypt(group)
          const roomId = cryptr.encrypt(room);
          history.push(`${roomId}/room-details`);
        }
      } else {
        console.log("else part");
        
        if (activerooms?.length > 0) {
          // const groupId = cryptr.encrypt(group)
          const roomId = cryptr.encrypt(room);
          console.log("room id inisde where i show handle alert ");
          
          handleShowAlert(1, roomId, activerooms[0]?.id);
        } else {
          const roomId = cryptr.encrypt(room);
          console.log(roomId,"last else part where redirect to rrom"
          );
          
          history.push(`${roomId}/room-details`);
        }
      }

    
    }
  };

  const backToGroupAndCategoryList = (e: any) => {
    e.preventDefault();
    history.push(URLS.USER.GROUPS_AND_CATEGORY);
  };

  const getSearchParms = (r_name: string = "", r_language: any = {}) => {
    setRoomName(r_name);
    setLanguage(r_language);
    setResetSearchParms(false);
  };

  const getRoomList = () => {
    const id: number = parseInt(cryptr.decrypt(groupId));

    const params = {
      group_id: id,
      room_name: roomName,
      language_id: language && language.value ? parseInt(language.value) : "",
      "18plus_room": eighteenPlus,
    };

    groupCategoryApi.callGetRoomListCategoryWise(
      params,
      (message: string, resp: any) => {
        if (resp && resp.list && resp.list.length) {
          // setRoom(resp.list)
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const confirm18PlusFilter = (
    isAdult: number = 0,
    isCheck: boolean = false
  ) => {
    // if (!isCheck) {
    //     history.replace('');
    //     history.push(`${groupId}/rooms`);
    // } else {
    //     history.replace('');
    //     history.push(`${groupId}/rooms?adult=true`);
    // }
    if (isCheck) {
      localStorage.setItem("isAdult", "1");
    } else {
      localStorage.setItem("isAdult", "0");
    }
    setIsCheckAdultRooms(isCheck);
    setEighteenPlus(isAdult);
  };
  const confirmVipFilter = (isVip: number = 0, isCheck: boolean = false) => {
    if (isCheck) {
      localStorage.setItem("isVip", "1");
    } else {
      localStorage.setItem("isVip", "0");
    }
    setIsCheckVipRooms(isCheck);
    setVip(isVip);
  };

  const refreshRoomList = (e: any) => {
    e.preventDefault();
    setRoomName("");
    setLanguage({});
    // setEighteenPlus(0)
    // setIsCheckAdultRooms(false)

    setResetSearchParms(true);
  };

  const getLanguageList = () => {
    groupCategoryApi.callGetRoomLanguage(
      (message: string, resp: any) => {
        if (resp && resp.list && resp.list.length) {
          setRoomLanguageList(resp.list);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const getCategoryList = () => {
    groupCategoryApi.callGetRoomCategory(
      (message: string, resp: any) => {
        if (resp && resp.list && resp.list.length) {
          setRoomCategoryList(resp.list);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  // const getGroupList = () => {
  //     const params = {
  //         category_id: 1
  //     }
  //     groupCategoryApi.callGetRoomGroups(params, (message: string, resp: any) => {
  //         if (resp && resp.list && resp.list.length) {
  //             setRoomGroupList(resp.list)
  //         }
  //     }, (message: string) => {
  //         toast.error(message)
  //     })
  // }

  useEffect(() => {
    handleChangeAccount(sb_user_id);
  }, []);
  const handleChangeAccount = (e: any) => {
    if (sb_user_id) {
      const params: any = {
        user_id: sb_user_id,
      };
      preference.callGetParentalControlInfo(
        params,
        (message: string, resp: any) => {
          if (resp && resp.list && resp.list.length) {
            //   setParentalControlInfo(resp.list)
            let findIndex = resp.list.findIndex(
              (z: any) => z.key == "parental_password"
            );
            if (findIndex >= 0) {
              let value = resp.list[findIndex];

              if (value.val) {
                //   setIsPasswordAvailable(true)
                //   setValue('hidden_password', null)
                setSelectedAccountPassword(value.val); //set user current password at state
              } else {
                //   setIsPasswordAvailable(false)
                //   setValue('hidden_password', 'available')
                setSelectedAccountPassword(null); //if no password available set state to null
              }
            }
          }
        },
        (message: string) => {
          toast.error(message);
        }
      );
    } else {
      //   setIsPasswordAvailable(null)
    }
  };

  useEffect(() => {
    getRoomList();
    getLanguageList();
    // getCategoryList()
    // getGroupList()
  }, [eighteenPlus, roomName, language]);

  // Below useeffect used for nullify the kickuser reducer data
  useEffect(() => {
    groupCategoryAction.roomListCategoryWise();
  }, []);

  return (
    <React.Fragment>
      {alert}
      <div className="page-heading-panel d-flex justify-content-between">
        <h1>Rooms</h1>
        <div className="d-flex">
          <button
            disabled={getDisableStatus(
              rommListCategoryWise &&
                rommListCategoryWise.allow_create_room &&
                rommListCategoryWise.allow_create_room
            )}
            onClick={(e) => createRoomOneModalOpen(e)}
            className="mail-action-btn waves-effect send-voice-btn"
          >
            <i className="create-room-icon" /> Create Room
          </button>
          <a
            href="#"
            onClick={(e) => refreshRoomList(e)}
            className="mail-action-btn waves-effect"
          >
            <i className="refresh-icon" />
          </a>
        </div>
      </div>
      <div className="search-box-inner">
        <SearchRoomForm
          getParams={getSearchParms}
          resetSearchParms={resetSearchParms}
          fetchLanguageList={roomLanguageList}
        />
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {rommListCategoryWise?.category_info?.categories_id == 1 ? (
          <div
            className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 d-inline-block"
            data-toggle="modal"
            data-target="#adultContent"
          >
            <input
              type="checkbox"
              className="custom-control-input"
              id="customCheck-outlinecolor2"
              onChange={adultRoomShowPasswordModalOpen}
              checked={isCheckAdultRooms}
            />
            <label
              className="custom-control-label"
              htmlFor="customCheck-outlinecolor2"
            >
              Show +18 rooms
            </label>
          </div>
        ) : rommListCategoryWise?.category_info?.categories_id == 5 ? (
          <div
            className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 d-inline-block"
            data-toggle="modal"
            data-target="#adultContent"
          >
            <input
              type="checkbox"
              className="custom-control-input"
              id="customCheck-outlinecolor2"
              onChange={(e) => vipRoomShowPasswordModalOpen(e)}
              checked={isCheckVipRooms}
            />
            <label
              className="custom-control-label"
              htmlFor="customCheck-outlinecolor2"
            >
              Show Vip Rooms{" "}
            </label>
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="table-panel voicemail-table custom_height">
        <div className="table-responsive mb-0" data-pattern="priority-columns">
          <table className="table">
            <thead>
              <tr>
                <th data-priority={1} colSpan={7}>
                  <div className="group-name-wrap">
                    {rommListCategoryWise &&
                    rommListCategoryWise.category_info &&
                    capitalize(rommListCategoryWise.category_info.group_type)
                      ? rommListCategoryWise.category_info.categoty_type === 0
                        ? capitalizeFirstLetter(
                            rommListCategoryWise.category_info.group_type
                          ) + ": "
                        : "Adult: "
                      : ""}
                    {rommListCategoryWise &&
                      rommListCategoryWise.category_info &&
                      rommListCategoryWise.category_info.group_name}
                    <a href="#" onClick={(e) => backToGroupAndCategoryList(e)}>
                      <i className="bx bx-chevron-left" />
                      Back to Categories 
                    </a>
                  </div>
                </th>
              </tr>
              <tr>
                <th data-priority={1} className="text-center">
                  Lock
                </th>
                <th data-priority={2} className="text-center">
                  Type
                </th>
                <th data-priority={3}>Room List</th>
                <th data-priority={4} className="text-center">
                  Users
                </th>
                <th data-priority={5} className="text-center">
                  Cams On
                </th>
                <th data-priority={6} className="text-center">
                  Likes
                </th>
                <th data-priority={7} className="text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {(rommListCategoryWise &&
                rommListCategoryWise.list &&
                rommListCategoryWise.list.length &&
                ((rommListCategoryWise?.category_info?.categories_id == 1 &&
                  isCheckAdultRooms) ||
                  (rommListCategoryWise?.category_info?.categories_id == 5 &&
                    isCheckVipRooms))) ||
              rommListCategoryWise?.category_info?.categories_id == 3 ? (
                rommListCategoryWise?.list.map(
                  (listValue: any, index: number) => {
                    return (
                      <tr key={index}>
                        <td align="center">
                          <a href="#">
                            {listValue && listValue.locked_room === 1 ? (
                              <img
                                src="/img/lock-icon.png"
                                alt={`Private-${index}`}
                              />
                            ) : (
                              <img
                                src="/img/public-icon.png"
                                alt={`Public-${index}`}
                              />
                            )}
                          </a>
                        </td>
                        <td align="center">
                          {listValue.type ? listValue.type : "--"}
                        </td>
                        <td>
                          <div
                            className="room-name"
                            style={{ color: getSubscriptionColor(listValue) }}
                          >
                            <span
                              className="adult"
                              style={{
                                backgroundColor: getStaticColor(
                                  getRoomcategoryInitials(
                                    listValue.room_category?.category_title
                                  )
                                ),
                              }}
                            >
                              {getRoomcategoryInitials(
                                listValue.room_category?.category_title
                              )}
                            </span>
                            {listValue.room_name ? listValue.room_name : "--"}
                          </div>
                        </td>
                        <td align="center">
                          {listValue.total_user ? listValue.total_user : 0}
                        </td>
                        <td align="center">
                          {listValue.total_camera_on
                            ? listValue.total_camera_on
                            : 0}
                        </td>
                        <td align="center">
                          {listValue.total_like ? listValue.total_like : 0}
                        </td>
                        <td align="center">
                          {listValue &&
                          listValue.join_status &&
                          listValue.join_status.is_accepted === 1 ? (
                            <a
                              href="#"
                              onClick={(e) =>
                                goToRoomDetails(
                                  e,
                                  listValue.group_id,
                                  listValue && listValue.join_status
                                    ? listValue.join_status.room_id
                                    : 0,
                                  listValue?.room_category
                                )
                              }
                              className={
                                (rommListCategoryWise?.category_info
                                  ?.categories_id == 5 &&
                                  useSelector?.isVipOwner.includes(
                                    listValue.id
                                  )) ||
                                rommListCategoryWise?.category_info
                                  ?.categories_id != 5
                                  ? "btn-already-joined"
                                  : "btn btn-already-joined disabled"
                              }
                            >
                              Already Joined
                            </a>
                          ) : (
                            <a
                              href="#"
                              onClick={(e) =>
                                goToRoomDetails(
                                  e,
                                  listValue.group_id,
                                  listValue.id,
                                  listValue?.room_category
                                )
                              }
                              className={
                                (rommListCategoryWise?.category_info
                                  ?.categories_id == 5 &&
                                  useSelector?.isVipOwner.includes(
                                    listValue.id
                                  )) ||
                                rommListCategoryWise?.category_info
                                  ?.categories_id != 5
                                  ? "btn btn-join-room"
                                  : " btn btn-join-room disabled"
                              }
                            >
                              Join Room
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )
              ) : (
                <tr>
                  <td colSpan={50} align="center">
                    {" "}
                    No Rooms Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showAdultRoomPasswordModal ? (
        <PasswordShowAdultRoomModal
          onClose={adultRoomShowPasswordCloseModal}
          shouldShow={showAdultRoomPasswordModal}
          onConfirm={confirm18PlusFilter}
          isCheck={isCheckAdultRooms}
        />
      ) : null}
      {showVipRoomsPasswordModal ? (
        <PasswordShowVipRoomModal
          onClose={vipRoomShowPasswordCloseModal}
          shouldShow={showVipRoomsPasswordModal}
          onConfirm={confirmVipFilter}
          isCheck={isCheckVipRooms}
        />
      ) : null}

      {showPasswordConfirmationModal ? (
        <ParentalControlPasswordConfirmationModal
          onClose={passwordConfirmationModalClose}
          onSuccess={isParentalPasswordConfirmationIsCorrect}
          shouldShow={showPasswordConfirmationModal}
          setPassword={selectedAccountPassword}
        />
      ) : null}

      {showCreateRoomModalOne ? (
        <CreateRoomTwoModal
          onClose={createRoomOneCloseModal}
          shouldShow={showCreateRoomModalOne}
          roomList={getRoomList}
        />
      ) : null}
    </React.Fragment>
  );
}

export default RoomsListPage;
