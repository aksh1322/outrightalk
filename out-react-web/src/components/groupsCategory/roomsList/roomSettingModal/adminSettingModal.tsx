import React, { useState, useEffect } from "react";
import { Modal, Form } from "react-bootstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import { toast } from "react-toastify";
import { useParams } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
// import AsyncSelect from 'react-select/async';
import AsyncSelectInput from "src/_common/components/form-elements/asyncSelect/asyncSelectInput";
import debounce from "lodash/debounce";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import { CRYPTO_SECRET_KEY } from "src/_config";
import { useAppRoomDetailsSelector } from "src/_common/hooks/selectors/groupCategorySelector";
import SelectInput from "src/_common/components/form-elements/selectinput/selectInput";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";
import { GetContactListUser } from "src/_common/interfaces/ApiReqRes";
import { useUserPreferenceApi } from "src/_common/hooks/actions/userPreference/appUserPreferenceApiHook";

const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

interface RoomSettingModalProps {
  onClose: () => void;
  shouldShow: boolean;
  adminType: string;
}

const addAdminSchema = yup.object().shape({
  searchmember: yup
    .object()
    .shape({
      value: yup.string().required("member is required"),
    })
    .nullable()
    .required("member is required"),
});

export default function AdminSettingModal({
  onClose,
  shouldShow,
  adminType,
}: RoomSettingModalProps) {
  const { register, control, setValue, handleSubmit, errors } = useForm<any>({
    resolver: yupResolver(addAdminSchema),
    defaultValues: {
      searchmember: "",
    },
  });

  const preference = useUserPreferenceApi();
  const groupCategoryApi = useGroupCategoryApi();
  const roomDetailsSelector = useAppRoomDetailsSelector();
  const userSelector = useAppUserDetailsSelector();
  const { roomId } = useParams<any>();
  const [alert, setAlert] = useState<any>(null);
  const room_id: number = parseInt(cryptr.decrypt(roomId));
  const [roomAdminList, setRoomAdminList] = useState<any>([]);
  const [contactList, setContactList] = useState<any>([])
  const [roomAdminSearchValueList, setRoomAdminSearchValueList] = useState<any>(
    []
  );
  const [checkedValues, setCheckedValues] = useState<number[]>([]);

  useEffect(() => {
    //  get roomAdmin lists
    getRoomAdminLists();
    adminSearchValuePrePared();
  }, []);

  const adminSearchValuePrePared = () => {
    if (
      roomDetailsSelector &&
      roomDetailsSelector.members &&
      roomDetailsSelector.members.length
    ) {
      var tempList = [];
      for (let i = 0; i < roomDetailsSelector.members.length; i++) {
        let obj = {
          label:
            roomDetailsSelector.members[i].customize_nickname &&
              roomDetailsSelector.members[i].customize_nickname.nickname
              ? roomDetailsSelector.members[i].customize_nickname.nickname
              : roomDetailsSelector.members[i].details.username,
          value: roomDetailsSelector.members[i].details.id,
        };
        tempList.push(obj);
      }
      setRoomAdminSearchValueList(tempList);
    }
  };

  const getRoomAdminLists = () => {
    var params = {
      room_id: room_id,
    };
    groupCategoryApi.callRoomAdminList(
      params,
      (message: string, resp: any) => {
        if (
          resp &&
          resp.admin &&
          resp.admin.length &&
          adminType &&
          adminType == "admins"
        ) {
          setRoomAdminList(resp.admin);
        } else if (
          resp &&
          resp.head_admin &&
          resp.head_admin.length &&
          adminType &&
          adminType == "headAdmins"
        ) {
          setRoomAdminList(resp.head_admin);
        } else {
          setRoomAdminList([]);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  function handleSelect(checkedName: number) {
    const newNames = checkedValues?.includes(checkedName)
      ? checkedValues?.filter((name) => name !== checkedName)
      : [...(checkedValues ?? []), checkedName];
    setCheckedValues(newNames);
    return newNames;
  }

  const onCheckSelectAll = (evt: any) => {
    let tempCheckedValues = [...checkedValues];
    if (evt) {
      if (roomAdminList && roomAdminList.length) {
        for (let k = 0; k < roomAdminList.length; k++) {
          let exist = tempCheckedValues.indexOf(roomAdminList[k].user_id);
          if (exist == -1) {
            tempCheckedValues.push(roomAdminList[k].user_id);
          }
        }
      }
      setCheckedValues(tempCheckedValues);
    } else {
      if (roomAdminList && roomAdminList.length) {
        for (let k = 0; k < roomAdminList.length; k++) {
          let exist = tempCheckedValues.indexOf(roomAdminList[k].user_id);
          if (exist !== -1) {
            tempCheckedValues.splice(exist, 1);
          }
        }
      }
      setCheckedValues(tempCheckedValues);
    }
  };

  const selectMaster = () => {
    let tempCheckedValues = [...checkedValues];
    if (roomAdminList && roomAdminList.length) {
      for (let k = 0; k < roomAdminList.length; k++) {
        let exist = tempCheckedValues.indexOf(roomAdminList[k].user_id);
        if (exist == -1) {
          return false;
        }
      }
    }
    return true;
  };
  const hideAlert = () => {
    setAlert(null);
  };

  const handleDeleteAdmin = (e: any) => {
    e.preventDefault();

    //Get the list of username selected from the list
    let adminList: string[] = [];
    checkedValues &&
      checkedValues.length &&
      checkedValues.map((x: number) => {
        let user = roomAdminList.filter((users: any) => users.details.id == x);
        if (user && user.length) {
          adminList.push(user.map((x: any) => x.details.username));
        }
      });

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
        title={
          checkedValues.length === roomAdminList.length
            ? `Clear ${adminType === "headAdmins" ? " Head-Admins" : "Admins"
            } List`
            : `Remove ${adminType === "headAdmins" ? " Head-Admins" : "Admins"}`
        }
        onConfirm={() => deleteRoomAdmin()}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        {checkedValues.length === roomAdminList.length
          ? `Are you sure you want to clear the ${adminType === "headAdmins" ? " Head-Admins" : "Admins"
          } List?`
          : `Are you sure you want to remove (${adminList.toString()}) from the ${adminType === "headAdmins" ? " Head-Admins" : "Admins"
          } List?`}
      </SweetAlert>
    );
  };

  const deleteRoomAdmin = () => {
    hideAlert();
    var params = {
      room_id: room_id,
      user_id: checkedValues,
    };
    groupCategoryApi.callRemoveRoomAdmin(
      params,
      (message: string, resp: any) => {
        toast.success(message);
        getRoomAdminLists();
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const getTimestampFromString = (dateString: string) => {
    // Parse the date string using the Date constructor
    const dateObject = new Date(dateString);

    // Get the UTC timestamp in milliseconds
    const utcTimestamp = dateObject.getTime();

    // If you want to convert the timestamp to seconds, you can divide by 1000
    return utcTimestamp / 1000;
  }

  const addTimezoneToUTCTimestamp = (utcTimestampInSeconds: string | number, targetTimezone: string) => {
    // Convert UTC timestamp to a Date object
    const dateObject = new Date(+utcTimestampInSeconds * 1000);

    // Get the date and time in the target timezone
    const localDateString = dateObject.toLocaleString("en-US", {
      timeZone: targetTimezone,
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return localDateString
  }

  const refreshList = (e: any) => {
    e.preventDefault();
    getRoomAdminLists();
  };

  const getAllJoinRoomAsAdmin = () => {
    const params: GetContactListUser = {
      nickname: userSelector?.username
    }

    preference.callGetUserContactList(params, (message: string, respContact: any) => {
      if (respContact && respContact.list && respContact.list.length) {
        console.log(respContact.list);

        setContactList(respContact.list.map((obj: any) => (
          {
            value: obj.contact_user.id,
            label: obj.contact_user.username
          }
        )))
      } else {
        setContactList([])
      }
    }, (message: string) => { })
  }

  useEffect(() => {
    getAllJoinRoomAsAdmin();
  }, [])

  //search member for head-admin or admin
  const filterMembers = (inputValue: string) => {
    if (inputValue) {
      return contactList.filter((i: any) =>
        i.label.toLowerCase().includes(inputValue.toLowerCase())
      );
    } else {
      return contactList;
    }
  };

  const promiseOptions = debounce((inputValue, call) => {

    if (inputValue) {
      var resFound = contactList && contactList.length ? contactList.filter((x: any) =>
        x.label.toLowerCase().includes(inputValue.toLowerCase())
      ) : [];
      if (resFound && resFound.length) {
        console.log('resfound', resFound)
        call(resFound)
      } else {
        call([])
      }
    }
    call(filterMembers(inputValue));
  }, 500);

  //add member api call
  const onSubmit = (values: any) => {
    var params = {
      room_id: room_id,
      user_id: values.searchmember.value,
      is_admin: adminType == "headAdmins" ? 1 : 2,
    };
    groupCategoryApi.callAddRoomAdmin(
      params,
      (message: string, resp: any) => {
        toast.success(message);
        setValue("searchmember", "");
        getRoomAdminLists();
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  return (
    <React.Fragment>
      {alert}
      <Modal
        show={shouldShow}
        backdrop="static"
        onHide={() => onClose()}
        keyboard={false}
        className="theme-custom-modal"
        dialogClassName="modal-dialog-scrollable"
        size={"lg"}
        centered
        contentClassName="custom-modal"
      >
        <Modal.Header>
          <h2>Room Setting 2</h2>
        </Modal.Header>
        <Modal.Body className="pl-0 pr-0">
          <div className="manage-video-message-panel">
            {
              [1, 3].includes(roomDetailsSelector.room.join_status.is_admin) &&
              <ul className="nav nav-tabs custom-tab" role="tablist">
                {
                  roomDetailsSelector.room.join_status.is_admin == 3 &&
                  <li className="nav-item">
                    <a
                      className={
                        adminType && adminType == "headAdmins"
                          ? "nav-link active"
                          : "nav-link"
                      }
                      data-bs-toggle="tab"
                      href="#home"
                      role="tab"
                      aria-selected="true"
                    >
                      <span>Head Admins</span>
                    </a>
                  </li>
                }

                <li className="nav-item">
                  <a
                    className={
                      adminType && adminType == "admins"
                        ? "nav-link active"
                        : "nav-link"
                    }
                    data-bs-toggle="tab"
                    href="#profile"
                    role="tab"
                    aria-selected="false"
                  >
                    <span>Admins</span>
                  </a>
                </li>
              </ul>
            }

            <div className="tab-content py-3 text-muted">
              <div className="tab-pane active" id="home" role="tabpanel">
                <div className="row">
                  <div className="col-sm-12">
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                      <div className="form-group d-flex">
                        <Controller
                          control={control}
                          name="searchmember"
                          render={({ onChange, onBlur, value, name, ref }) => (
                            <SelectInput
                              name={name}
                              className="admin-member-async-search"
                              onChange={onChange}
                              onBlur={onBlur}
                              value={value}
                              isClearable={true}
                              inputRef={ref}
                              dark={true}
                              options={contactList}
                              error={errors.searchmember}
                              placeholder="Enter or select a Member"
                            />
                            // <AsyncSelectInput
                            //   name={name}
                            //   onChange={onChange}
                            //   onBlur={onBlur}
                            //   onFocus={() => filterMembers('')}
                            //   value={value}
                            //   isClearable={true}
                            //   inputRef={ref}
                            //   options={filterMembers || promiseOptions}
                            //   className="admin-member-async-search"
                            //   error={errors.searchmember}
                            //   noOptionsMessage="No Member Found"
                            //   placeholder="Enter or select a Member"
                            //   dark={true}
                            // />
                          )}
                        />

                        {/* <a href="#" className="btn-verify">Add to List</a> */}
                        <button className="btn-verify" type="submit">
                          Add to List
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="table-panel voicemail-table normal-dark-bg-no-shadow">
                  <div
                    className="table-responsive mb-0"
                    data-pattern="priority-columns"
                  >
                    <table className="table">
                      <thead>
                        <tr>
                          <th colSpan={2}>
                            {roomAdminList && roomAdminList.length ? (
                              <div
                                className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success"
                                style={{ whiteSpace: "nowrap" }}
                              >
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  id="customCheck-outlinecolor1"
                                  checked={selectMaster()}
                                  onChange={(evt) => {
                                    onCheckSelectAll(evt.target.checked);
                                  }}
                                />
                                <label
                                  className="custom-control-label pl-3"
                                  htmlFor="customCheck-outlinecolor1"
                                >
                                  Select All
                                </label>
                              </div>
                            ) : null}
                          </th>
                          <th className="text-right">
                            <div className="d-inline-flex p-r-2">
                              {roomAdminList && roomAdminList.length ? (
                                <a
                                  href="#"
                                  onClick={(e) => handleDeleteAdmin(e)}
                                  className="mail-action-btn waves-effect"
                                >
                                  <i className="delete-icon" />
                                </a>
                              ) : null}
                              <a
                                href="#"
                                className="mail-action-btn waves-effect"
                                onClick={(e) => refreshList(e)}
                              >
                                <i className="refresh-icon" />
                              </a>
                            </div>
                          </th>
                        </tr>
                        <tr>
                          <th>Nickname</th>
                          <th>Added On</th>
                          <th>Added By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roomAdminList && roomAdminList.length ? (
                          roomAdminList.map((room: any, index: number) => {
                            console.log("roomAdmins", room)
                            return (
                              <tr key={index}>
                                <td>
                                  <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                                    <input
                                      type="checkbox"
                                      className="custom-control-input"
                                      id={"customCheck-outlinecolor" + index}
                                      checked={checkedValues.includes(
                                        room.user_id
                                      )}
                                      onChange={() => handleSelect(room.user_id)}
                                    />
                                    <label
                                      className="custom-control-label pl-3"
                                      htmlFor={"customCheck-outlinecolor" + index}
                                    >
                                      {room.details.username}
                                    </label>
                                  </div>
                                </td>
                                <td>{addTimezoneToUTCTimestamp(getTimestampFromString(room.added_on), room.timezone)}</td>
                                <td>Head Admin</td>
                              </tr>
                            )
                          })
                        ) : (
                          <tr>
                            <td colSpan={50}>No List Found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-end w-100">
            <a
              href="#"
              className="btn theme-btn btn-default waves-effect mr-2"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
            >
              Close
            </a>
          </div>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
