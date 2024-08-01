import React, { useContext, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import SweetAlert from "react-bootstrap-sweetalert";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import BannerShow from "src/components/common/banner";
import FormTextInput from "src/_common/components/form-elements/textinput/formTextInput";
import SelectInput from "src/_common/components/form-elements/selectinput/selectInput";
import AddToFavouriteFolderSelectionModal from "src/components/commonModals/addToFavouriteFolderSelectionModal/addToFavouriteFolderSelectionModal";
import { OptionValue } from "src/_common/interfaces/common";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import { toast } from "react-toastify";
import { useUserApi } from "src/_common/hooks/actions/user/appUserApiHook";
import {
  getDisableStatus,
  getRoomcategoryInitials,
  getStaticColor,
  capitalizeFirstLetter,
  getBooleanToValueStatus,
  getSubscriptionColor,
} from "src/_config/functions";

import { CRYPTO_SECRET_KEY } from "src/_config";
import { useHistory } from "react-router";
import PasswordShowAdultRoomModal from "src/components/commonModals/groupsCategoryModals/passwordShowAdultRoomsModal";
import { removeFromFavouriteContactList } from "src/sagas/groupCategorysaga";
import InviteToRoomModal from "src/components/commonModals/inviteToRoomModal/inviteToRoomModal";
import { useAppShareWithContactListModalOpen } from "src/_common/hooks/selectors/userSelector";
import ShareWithContactListModal from "src/components/commonModals/shareWithContactListModal/shareWithContactListModal";
import { useAppUserAction } from "src/_common/hooks/actions/user/appUserActionHook";
import { useFavouritesApi } from "src/_common/hooks/actions/favourites/appFavouritesApiHook";
// import { AntmediaContext } from "src";

const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

interface SearchFieldFormValues {
  room_name?: string;
  language?: OptionValue | undefined | any;
  // keyword?: string;
}

const searchFieldFormSchema = yup.object().shape({
  room_name: yup.string(),
  language: yup.object().nullable(),
  // keyword: yup
  //     .string()
});

function FindAndJoinRoomPage() {
  const { register, control, setValue, handleSubmit, reset, errors } =
    useForm<SearchFieldFormValues>({
      resolver: yupResolver(searchFieldFormSchema),
      defaultValues: {
        room_name: "",
        language: null,
        // keyword: ''
      },
    });

  const history = useHistory();
  const groupCategoryApi = useGroupCategoryApi();
  const favouritesApi = useFavouritesApi();
  const userApi = useUserApi();
  const userAction = useAppUserAction();
  const shareWithOtherContactListSelector =
    useAppShareWithContactListModalOpen();
  const [roomLanguageList, setRoomLanguageList] = useState<any[]>([]);
  const [formValues, setFormValues] = useState<any>([]);
  const [adultCheck, setAdultCheck] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);
  const [findAndJoinRoomList, setFindAndJoinRoomList] = useState<any>(null);
  const [showAdultRoomPasswordModal, setAdultRoomPasswordModal] =
    useState<boolean>(false);
  const [showInviteToRoomModal, setShowInviteToRoomModal] =
    useState<boolean>(false);
  const [folderSelectionModal, setFolderSelectionModal] =
    useState<boolean>(false);
  const [roomLink, setRoomLink] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<any>();
  const [alert, setAlert] = useState<any>(null);

  // const antmedia = useContext<any>(AntmediaContext);

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

  const getFindAndJoinRoomList = (params: any) => {
    userApi.callFindAndJoinRoom(
      params,
      (message: string, resp: any) => {
        setFindAndJoinRoomList(resp);
        setShow(true);
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const inviteToRoom = (params: any) => {
    params.room_link = roomLink;
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

  const addToFavourites = (params: any) => {
    groupCategoryApi.callAddAsFavourite(
      params,
      (message: string, resp: any) => {},
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const getRoomFavouriteRoomList = () => {
    favouritesApi.callGetRommFavouriteFoldersList(
      (message: string, resp: any) => {
        if (resp) {
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const removeFromFavourites = (params: any) => {
    groupCategoryApi.callRemoveFavourite(
      params,
      (message: string, resp: any) => {
        if (resp) {
          hideAlert();
          getRoomFavouriteRoomList();
          getFindAndJoinRoomList(formValues);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const goToRoomDetails = (e: any, group: any, room: any) => {
    e.preventDefault();
    // if (antmedia.publishStreamId) antmedia.handleLeaveFromRoom();

    const groupId = cryptr.encrypt(group);
    const roomId = cryptr.encrypt(room);
    history.push(`${groupId}/${roomId}/room-details`);
  };

  const addRemoveFav = (e: any, room: any, status: any) => {
    e.preventDefault();
    var params = {
      room_id: room,
    };
    status
      ? showRemoveFavouriteAlert(params)
      : openFavouriteFolderSelectionModal(room);
    // if (findAndJoinRoomList && findAndJoinRoomList.list && findAndJoinRoomList.list.length) {
    //     var temp = { ...findAndJoinRoomList }
    //     temp.list.find((x: any) => x.id == room).is_favorites = !status
    //     setFindAndJoinRoomList(temp)
    // }
  };

  const onSubmit = (values: SearchFieldFormValues) => {
    var params = {
      room_name: values.room_name,
      language_id: values && values.language && values.language.value,
      "18plus_room": adultCheck ? 1 : 0,
    };
    setFormValues(params);
    getFindAndJoinRoomList(params);
  };

  const handleReset = (e: React.MouseEvent) => {
    e && e.preventDefault();
    reset({
      room_name: "",
      language: "",
      // keyword: ''
    });
    setShow(false);
    setFormValues([]);
  };

  const handleInviteToRoom = (e: any, group: any, room: any) => {
    e.preventDefault();
    const groupId = cryptr.encrypt(group);
    const roomId = cryptr.encrypt(room);
    // setRoomLink(window.location.origin + `/${groupId}/${roomId}/room-details`)
    const url = window.location.origin + `/${groupId}/${roomId}/room-details`;
    setShowInviteToRoomModal(true);
    userAction.showShareWithOtherContactListModal(true, url, room);
  };

  const handleCheckboxChange = (e: any) => {
    // setAdultCheck(e.target.checked)
    setAdultRoomPasswordModal(true);
  };

  const handleConfirm = (val: number, stat: boolean) => {
    setAdultCheck(stat);
    setShow(false);
  };

  //favourite Folder selectiom modal
  const openFavouriteFolderSelectionModal = (roomId: number) => {
    setSelectedRoomId(roomId);
    setFolderSelectionModal(true);
  };

  const closeFavouriteFolderSelectionModal = () => {
    if (folderSelectionModal) setFolderSelectionModal(false);
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const showRemoveFavouriteAlert = (params: any) => {
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
        title={`Remove Favourite`}
        onConfirm={() => removeFromFavourites(params)}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        {`Are you sure you want to delete this room from your Favorites?`}
      </SweetAlert>
    );
  };

  useEffect(() => {
    getLanguageList();
  }, []);

  return (
    <React.Fragment>
      {alert}
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-sm-12">
            <div className="page-heading-panel d-flex justify-content-between">
              <h1>Find and Join a Room</h1>
            </div>
          </div>
        </div>
        {/* end row */}
        <div className="row justify-content-center create-manager-panel">
          <div className="col-lg-12">
            <div className="dark-box-inner admin-room-setting-wrap">
              <h2 className="white-text">Search Criteria</h2>
              <form
                className="form-horizontal"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Room Name</label>
                      <Controller
                        control={control}
                        name="room_name"
                        render={({ onChange, onBlur, value, name, ref }) => (
                          <FormTextInput
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                            inputRef={ref}
                            type="text"
                            error={errors.room_name}
                            placeholder="Type Room name..."
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Language</label>
                      <Controller
                        control={control}
                        name="language"
                        render={({ onChange, onBlur, value, name, ref }) => (
                          <SelectInput
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                            inputRef={ref}
                            dark={true}
                            options={
                              roomLanguageList
                                ? roomLanguageList.map((c: any) => ({
                                    value: String(c.id),
                                    label: c.language_title,
                                  }))
                                : []
                            }
                            error={errors.language}
                            placeholder="Select language"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
                {/* <div className="row">
                                    <div className="col-sm-12">
                                        <div className="form-group">
                                            <label>Search by Keywords</label>
                                            <Controller
                                                control={control}
                                                name="keyword"
                                                render={({ onChange, onBlur, value, name, ref }) => (
                                                    <FormTextInput
                                                        onChange={onChange}
                                                        onBlur={onBlur}
                                                        value={value}
                                                        inputRef={ref}
                                                        type="text"
                                                        // error={errors.keyword}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div> */}
                <hr className="light-hr" />
                <div className="row">
                  <div className="col-sm-12">
                    <div className="d-flex justify-content-end w-100">
                      <div className="right-btns">
                        <a
                          href="#"
                          onClick={(e) => handleReset(e)}
                          className="btn theme-btn btn-danger waves-effect mr-2 "
                        >
                          Clear
                        </a>
                        <button
                          type="submit"
                          className="btn theme-btn btn-primary waves-effect"
                        >
                          Find
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              <div
                className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 d-inline-block pl-0"
                data-toggle="modal"
                data-target="#adultContent"
              >
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="customCheck-outlinecolor2"
                  onChange={handleCheckboxChange}
                  checked={adultCheck}
                />
                <label
                  className="custom-control-label"
                  id="customCheck-outlinecolor2"
                >
                  Show +18 Contents
                </label>
              </div>
              {show &&
              findAndJoinRoomList &&
              findAndJoinRoomList.list &&
              findAndJoinRoomList.list.length ? (
                <>
                  <h2 className="white-text">Search Results</h2>
                  <div className="row">
                    <div className="col-sm-12 ">
                      <div className="list-users-wrap voicemail-table mt-3 mb-4">
                        <div
                          className="table-responsive mb-0"
                          data-pattern="priority-columns"
                        >
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Room Name</th>
                                <th>Category</th>
                                <th className="text-center">Users</th>
                                <th className="text-center">Cams</th>
                                <th className="text-center">Likes</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {findAndJoinRoomList.list.map(
                                (room: any, index: number) => (
                                  <tr key={index}>
                                    <td>
                                      <div
                                        className="room-name"
                                        style={{
                                          color: getSubscriptionColor(room),
                                        }}
                                      >
                                        <span
                                          className="adult"
                                          style={{
                                            backgroundColor: getStaticColor(
                                              getRoomcategoryInitials(
                                                room.room_category
                                                  ?.category_title
                                              )
                                            ),
                                          }}
                                        >
                                          {getRoomcategoryInitials(
                                            room.room_category?.category_title
                                          )}
                                        </span>
                                        {room.room_name}
                                      </div>
                                    </td>
                                    <td>{room.room_group.group_name}</td>
                                    <td className="text-center">
                                      {room.total_user}
                                    </td>
                                    <td className="text-center">
                                      {room.total_camera_on}
                                    </td>
                                    <td className="text-center">
                                      {room.total_favourite}
                                    </td>
                                    <td className="actions">
                                      {room &&
                                      room.join_status &&
                                      room.join_status.is_accepted === 1 ? (
                                        <a
                                          href="#"
                                          onClick={(e) =>
                                            goToRoomDetails(
                                              e,
                                              room.group_id,
                                              room && room.join_status
                                                ? room.join_status.room_id
                                                : 0
                                            )
                                          }
                                          className="btn-already-joined"
                                        >
                                          Already Joined
                                        </a>
                                      ) : (
                                        <a
                                          href="#"
                                          onClick={(e) =>
                                            goToRoomDetails(
                                              e,
                                              room.group_id,
                                              room.id
                                            )
                                          }
                                          className="btn-join-room"
                                        >
                                          Join Room
                                        </a>
                                      )}
                                      <a
                                        href="#"
                                        onClick={(e) => {
                                          addRemoveFav(
                                            e,
                                            room.id,
                                            room && room.is_favorites
                                          );
                                        }}
                                        className={
                                          room && room.is_favorites
                                            ? "btn theme-btn btn-danger waves-effect ml-2"
                                            : "btn-add-fav ml-2"
                                        }
                                      >
                                        {room && room.is_favorites
                                          ? "Remove from"
                                          : "Add to"}{" "}
                                        Favorites
                                      </a>
                                      <a
                                        href="#"
                                        className="btn-invite ml-2"
                                        onClick={(e) =>
                                          handleInviteToRoom(
                                            e,
                                            room.group_id,
                                            room.id
                                          )
                                        }
                                      >
                                        Invite
                                      </a>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
          {showAdultRoomPasswordModal ? (
            <PasswordShowAdultRoomModal
              onClose={() => {
                setAdultRoomPasswordModal(false);
              }}
              shouldShow={showAdultRoomPasswordModal}
              onConfirm={handleConfirm}
              isCheck={adultCheck}
            />
          ) : null}
          {/* <InviteToRoomModal
                        shouldShow={showInviteToRoomModal}
                        onClose={()=>setShowInviteToRoomModal(false)}
                        getParams={inviteToRoom}
                    /> */}
        </div>
      </div>

      {shareWithOtherContactListSelector.isOpen && (
        <ShareWithContactListModal
          shouldShow={shareWithOtherContactListSelector.isOpen}
        />
      )}

      {folderSelectionModal && (
        <AddToFavouriteFolderSelectionModal
          onClose={closeFavouriteFolderSelectionModal}
          onSuccess={() => getFindAndJoinRoomList(formValues)}
          shouldShow={folderSelectionModal}
          roomId={selectedRoomId}
        />
      )}
    </React.Fragment>
  );
}

export default FindAndJoinRoomPage;
