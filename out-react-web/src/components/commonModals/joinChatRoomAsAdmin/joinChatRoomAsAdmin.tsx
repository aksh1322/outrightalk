import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router";
import { Modal } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import SweetAlert from "react-bootstrap-sweetalert";
import FormTextInput from "src/_common/components/form-elements/textinput/formTextInput";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import { OptionValue } from "src/_common/interfaces/common";
import SelectInput from "src/_common/components/form-elements/selectinput/selectInput";
import { toast } from "react-toastify";
import { CRYPTO_SECRET_KEY, LOGIN_STORAGE, URLS } from "src/_config";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";
import { useAppGroupCategoryAction } from "src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook";
const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

interface LockWordModalProps {
  onClose: (success: any) => void;
  shouldShow: boolean;
}

interface LockWordFormValues {
  lockword: string;
  rooms: OptionValue | undefined | any;
}

const lockSchema = yup.object().shape({
  rooms: yup
    .object()
    .shape({
      value: yup.string().required("Please select the Owner Nickname"),
    })
    .nullable()
    .required("Please select the Owner Nickname"),
  lockword: yup.string().required("Admin code is required"),
});

export default function JoinChatRoomAsAdmin({
  onClose,
  shouldShow,
}: LockWordModalProps) {
  const { roomId } = useParams<any>();
  const history = useHistory();
  const groupCategoryApi = useGroupCategoryApi();
  const [passwordTextToggle, setPasswordTextToggle] = useState("password");
  const [roomAdminList, setRoomAdminList] = useState<any>([]);
  const [alert, setAlert] = useState<any>(null);
  const [RoomData, setRoomData] = useState<any>();
  const [activerooms, SetActiveRooms] = useState<any>();
  const value = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS);
  const userSelector = useAppUserDetailsSelector();
  const groupCategoryAction = useAppGroupCategoryAction();

  const { id: userId, username: UserName } = value ? JSON.parse(value) : "";
  const { register, control, setValue, handleSubmit, errors } =
    useForm<LockWordFormValues>({
      resolver: yupResolver(lockSchema),
      defaultValues: {
        lockword: "",
      },
    });

  const hideAlert = () => {
    setAlert(null);
  };

  const handleMultipleJoinRoomCancel = () => {
    setAlert(null);
    history.replace("");
    history.push(URLS.USER.DASHBOARD);
  };

  const handleFinalJoinRoom = (
    values: LockWordFormValues,
    exit_room: number
  ) => {
    var params = {
      room_id: parseInt(values.rooms.value),
      admincode: values.lockword,
      exit_room,
    };
    groupCategoryApi.callJoinRoomAsAdminRoomVerify(
      params,
      (message: string, resp: any) => {
        if (resp) {
          onClose(true);
          const groupId = cryptr.encrypt(resp.group_id);
          const roomId = cryptr.encrypt(resp.id);
          history.replace("");
          history.push(`${groupId}/${roomId}/room-details`);
        }
      },
      (message: string) => {
        toast.error(message);
        setAlert(null);
      }
    );
  };

  const handleShowAlert = (values: LockWordFormValues, exit_room: number) => {
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
        onConfirm={() => handleFinalJoinRoom(values, exit_room)}
        onCancel={handleMultipleJoinRoomCancel}
        focusCancelBtn={true}
      >
        You have a basic nickname, you cannot be in more than one voice room
        simultaneously, you will exit the current room automatically. Do you
        want to proceed?
      </SweetAlert>
    );
  };

  const handleShowAlerts = (values: LockWordFormValues, exit_room: number) => {
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
        onCancel={handleMultipleJoinRoomCancel}
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
    onClose(true);
    groupCategoryAction.activeRoomsPopDownHandler(true);
    setAlert(null);
  };

  const getAllJoinRoomAsAdmin = () => {
    let params = {};
    groupCategoryApi.callJoinRoomAsAdminRoomList(
      params,
      (message: string, resp: any) => {
        if (resp && resp.contact_list && resp?.contact_list?.length) {
          var roomArr: any = [];
          for (let i = 0; i < resp?.contact_list?.length; i++) {
            let obj = {
              value: findRoomId(resp, resp?.contact_list[i]?.contact_user_id),
              // label: resp.list[i].room_owner_with_trashed ? resp.list[i].room_owner_with_trashed.details.username : 'Owner not found'
              // label: resp.list[i].room_name ? resp.list[i].room_name + ' ' + '(' +  (resp?.list[i].room_owner_with_trashed.details.username) + ')' : 'Owner not found'

              // label: resp.list[i].room_owner ? resp.list[i].room_owner.details.username : 'Owner not found'
              label: resp?.contact_list[i]?.contact_user?.username
                ? resp?.contact_list[i]?.contact_user?.username
                : "Owner not found",
            };
            roomArr.push(obj);
          }
          let newObj = {
            value: findRoomId(resp, userId),
            label: UserName,
          };
          roomArr.push(newObj);

          setRoomAdminList(roomArr);
        } else {
          setRoomAdminList([]);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const findRoomId = (RoomData: any, id: any) => {
    if (RoomData) {
      const foundData =
        RoomData &&
        RoomData?.list.find((x: any) => {
          return x?.room_owner_with_trashed?.user_id == id;
        });
      return foundData ? foundData?.id : 0;
    }
  };

  useEffect(() => {
    getAllJoinRoomAsAdmin();
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

  const onSubmit = (values: LockWordFormValues) => {
    let SimultaneousRoom = userSelector?.is_subscribed?.feature.filter(
      (x: any) => x.type == "simultaneous_room"
    );
    if (SimultaneousRoom) {
      activerooms?.length > SimultaneousRoom[0]?.value
        ? handleShowAlerts(values, 1)
        : handleFinalJoinRoom(values, 0);
    } else {
      activerooms?.length > 0
        ? handleShowAlert(values, 1)
        : handleFinalJoinRoom(values, 0);
    }

    // var params = {
    //     room_id: parseInt(values.rooms.value),
    //     admincode: values.lockword
    // }
    // groupCategoryApi.callJoinRoomAsAdminRoomVerify(params, (message: string, resp: any) => {
    //     if (resp) {
    //         onClose(true)
    //         const groupId = cryptr.encrypt(resp.group_id)
    //         const roomId = cryptr.encrypt(resp.id)
    //         history.replace("")
    //         history.push(`${groupId}/${roomId}/room-details`)
    //     }
    // }, (message: string) => {
    //     toast.error(message)
    // })
    // const params = {
    //   room_id: parseInt(values.rooms.value),
    // };
    // groupCategoryApi.callJoinSimultaneouslyRoom(
    //   params,
    //   (message: string, resp: any) => {
    //     if (resp) {
    //       handleFinalJoinRoom(values, 0);
    //     }
    //   },
    //   (message: string) => {
    //     // toast.error(message)
    //     // history.replace("")
    //     // history.push(URLS.USER.DASHBOARD)
    //     handleShowAlert(values, 1);
    //   }
    // );
  };

  // const confirmPassword = () => {
  //     console.log('success true called')
  //     onClose(true)
  // }

  const handlePasswordTextToggle = () => {
    if (passwordTextToggle == "password") {
      setPasswordTextToggle("text");
    } else {
      setPasswordTextToggle("password");
    }
  };

  return (
    <React.Fragment>
      {alert}
      <Modal
        show={shouldShow}
        backdrop="static"
        // onHide={() => onClose()}
        keyboard={false}
        className="sendvoicemail send-video-message theme-custom-modal"
        // size="sm"
        centered
        contentClassName="custom-modal"
      >
        <Modal.Header>
          <div className="modal-logo d-flex justify-content-center w-100">
            <img src="/img/logo.png" />
          </div>
        </Modal.Header>
        <Modal.Body bsPrefix={"sendvoice-mail"}>
          <div className="modal-body pl-0 pr-0">
            <div className="manage-video-message-panel">
              <h2>Join Room As Admin</h2>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="form-group">
                  <Controller
                    control={control}
                    name="rooms"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <SelectInput
                        onChange={(e) => {
                          onChange(e);
                        }}
                        onBlur={onBlur}
                        value={value}
                        inputRef={ref}
                        dark={true}
                        options={roomAdminList}
                        error={errors.rooms}
                        placeholder="Select"
                      />
                    )}
                  />
                </div>
                <div className="form-group">
                  <Controller
                    control={control}
                    name="lockword"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <FormTextInput
                        // name={name}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                        inputRef={ref}
                        type={passwordTextToggle}
                        error={errors.lockword}
                        placeholder="Admin Code"
                      />
                    )}
                  />
                  <span
                    className="eye-password-text"
                    onClick={handlePasswordTextToggle}
                  >
                    {passwordTextToggle == "password" ? (
                      <i className="fa fa-eye" aria-hidden="true"></i>
                    ) : (
                      <i className="fa fa-eye-slash" aria-hidden="true"></i>
                    )}
                  </span>
                </div>

                <div className="d-flex">
                  <button
                    type="submit"
                    className="btn theme-btn btn-primary mr-2 waves-effect"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="btn theme-btn btn-default waves-effect"
                    onClick={() => onClose(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}
