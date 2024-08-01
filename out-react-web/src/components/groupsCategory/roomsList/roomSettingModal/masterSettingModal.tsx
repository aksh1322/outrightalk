import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import SweetAlert from "react-bootstrap-sweetalert";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import CheckboxInput from "src/_common/components/form-elements/checkboxinput/checkboxInput";
import FormTextInput from "src/_common/components/form-elements/textinput/formTextInput";
import FormTextAreaInput from "src/_common/components/form-elements/textarea/textareaInput";
import SelectInput from "src/_common/components/form-elements/selectinput/selectInput";
import { OptionValue } from "src/_common/interfaces/common";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import { useAppGroupCategoryAction } from "src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook";
import {
  CREATE_ROOM_POST_URL_USERS,
  CRYPTO_SECRET_KEY,
  getBooleanToValueStatus,
  getSubscriptionColor,
  replaceCommaSeparator,
  URLS,
} from "src/_config";
import AdminSettingModal from "./adminSettingModal";
import { useAppRoomDetailsSelector } from "src/_common/hooks/selectors/groupCategorySelector";
import { useHistory } from "react-router";
import EditorInputBasic from "src/_common/components/form-elements/ckTextEditor/ckEditorInputBasic";
import { useUserApi } from "src/_common/hooks/actions/user/appUserApiHook";
const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);


interface RoomSettingModalProps {
  shouldShow?: boolean;
  // isCheck?: boolean | null;
  // id?: string;
  // fetchLanguageList?: any[];
  // fetchCategoryList?: any[];
}
interface roomSettingModalFormValues {
  isPublicPrivate: string;
  room_name: string;
  room_category_id: OptionValue | undefined | any;
  group_id: OptionValue | undefined | any;
  welcome_message: string;
  banner_url: string;
  language_id: OptionValue | undefined | any;
  video_enabled?: boolean;
  voice_enabled?: boolean;
  locked_room?: boolean;
  lockword: string;
  admin_code: string;
  room_password: string;
  c_room_password: string;
  post_url: OptionValue | undefined | any;
  filter_words: string;
  is_comma_separated: boolean;
  room_pic: any;
}

const roomSetttingModalFormSchema = yup.object().shape({
  room_name: yup.string().required("Room name is required"),
  isPublicPrivate: yup.string(),
  // .required('Room type is required'),
  room_category_id: yup
    .object()
    .shape({
      value: yup.string().required("Category is required"),
    })
    .nullable()
    .required("Category is required"),
  group_id: yup
    .object()
    .shape({
      value: yup.string().required("Group is required"),
    })
    .nullable()
    .required("Group is required"),
  // welcome_message: yup
  //     .string()
  //     .required('Welcome message is required'),
  banner_url: yup.string(),
  // .required('Banner url is required'),
  language_id: yup
    .object()
    .shape({
      value: yup.string().required("Language is required"),
    })
    .nullable()
    .required("Language is required"),
  // video_enabled: yup.boolean().required("Video enabled is required"),
  // voice_enabled: yup.boolean().required("Voice enabled is required"),
  video_enabled: yup.boolean(),
  voice_enabled: yup.boolean(),
  // lockword: yup
  //     .string()
  //     .required('Lockword is required')
  //     .min(4, 'Lockword should have minimum 4 characters')
  //     .max(16, 'Max 16 characters are allowed'),
  lockword: yup.string().when("locked_room", (locked_room: any) => {
    if (locked_room)
      return yup
        .string()
        .required("Lockword is required")
        .min(4, "Lockword should have minimum 4 characters")
        .max(16, "Max 16 characters are allowed");
  }),
  locked_room: yup.boolean().required("Locked room is required"),
  admin_code: yup
    .string()
    .required("Admin code is required")
    .min(6, "Admin code should have minimum 6 characters")
    .max(12, "Max 12 characters are allowed"),
  post_url: yup
    .object()
    .shape({
      value: yup.string().required("Post url is required"),
    })
    .nullable()
    .required("Post url is required"),
  filter_words: yup.string(),
  // .required('Filter words is required')
});

export default function RoomSettingModal({
  shouldShow,
}: RoomSettingModalProps) {
  const { register, control, setValue, getValues, handleSubmit, errors } =
    useForm<roomSettingModalFormValues>({
      resolver: yupResolver(roomSetttingModalFormSchema),
      defaultValues: {
        room_name: "",
        isPublicPrivate: "",
        room_category_id: undefined,
        group_id: undefined,
        welcome_message: "",
        banner_url: "",
        language_id: undefined,
        video_enabled: false,
        voice_enabled: false,
        locked_room: false,
        lockword: "",
        admin_code: "",
        room_password: "",
        c_room_password: "",
        post_url: undefined,
        is_comma_separated: false,
        filter_words: "",
        room_pic: "",
      },
    });
  const history = useHistory();
  const groupCategoryApi = useGroupCategoryApi();
  const userApi = useUserApi();
  const groupCategoryAction = useAppGroupCategoryAction();
  const [selectedFileName, setSelectedFileName] = useState<any>(null);
  const [voiceEnbledDisabled, setVoiceEnbledDisabled] = useState(false);
  const [showAdminSetting, setShowAdminSetting] = useState(false);
  const [adminType, setAdminType] = useState("");
  const [alert, setAlert] = useState<any>(null);
  const [roomCategoryList, setRoomCategoryList] = useState<any>();
  const [roomGroupList, setRoomGroupList] = useState<any>();
  const [languageList, setLanguageList] = useState<any>();
  const [roomTypes, setRoomTypes] = useState<any>();
  const [verifyPassword, setVerifyPassword] = useState("");
  const [verifiedRoomDetails, setVerifiedRoomDetails] = useState<any>();
  const roomDetailsSelector = useAppRoomDetailsSelector();
  const [roomVerified, setRoomVerified] = useState<boolean>(false);

  const [roomPasswordTextToggle, setRoomPasswordTextToggle] =
    useState("password");
  const [lockPasswordTextToggle, setLockPasswordTextToggle] =
    useState("password");
  const [adminPasswordTextToggle, setAdminPasswordTextToggle] =
    useState("password");
  const [passwordTextToggle, setPasswordTextToggle] = useState("password");
  const [passwordConfirmTextToggle, setPasswordConfirmTextToggle] =
    useState("password");
  const [showLockwordField, setShowLockwordField] = useState<boolean>(false);
  const [cancelChanges, setCancelChanges] = useState<any>("")

  //Init Api call
  console.log('roomDetailsSelector--', roomDetailsSelector)
  const userMeCall = () => {
    userApi.callGetMe(
      (message: string, resp: any) => { },
      (message: string, resp: any) => {
        toast.error(message);
      }
    );
  };

  const adminSettingModalOpen = (e: any, type: string) => {
    e.preventDefault();
    setAdminType(type);
    setShowAdminSetting(true);
  };

  const adminSettingModalClose = () => {
    setAdminType("");
    setShowAdminSetting(false);
  };

  const handelClose = (e: any) => {
    e.preventDefault();
    groupCategoryAction.showRoomSettingModal(false);
  };

  const handelCancel = (e: any) => {
    e.preventDefault();
    getGroupList()
    setTimeout(() => {
      setCancelChanges('' + new Date().getTime())
    }, 300)
    // setCancelChanges('' + new Date().getTime())
    // groupCategoryAction.showRoomSettingModal(false);
  };

  const getCategoryList = () => {
    groupCategoryApi.callGetRoomCategory(
      (message: string, resp: any) => {
        if (resp && resp.list && resp.list.length) {
          let finalList = resp.list.filter((ele: any) => ele.category_title != "System")
          setRoomCategoryList(finalList);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const getGroupList = (id?: number) => {
    const params = {
      // category_id: id ? id : roomDetailsSelector.room.group_id,
      category_id: id ? id : roomDetailsSelector.room.room_category_id,
    };
    groupCategoryApi.callGetRoomGroups(
      params,
      (message: string, resp: any) => {
        if (resp && resp.list && resp.list.length) {
          setRoomGroupList(resp.list);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handleRoomCategoryChange = (
    e: { value: string; label: string } | null
  ) => {
    if (e && e.value) {
      // setValue('room_category_id', e)
      setValue("group_id", "");
      getGroupList(parseInt(e.value));
    } else {
      // setValue('room_category_id', '')
      setValue("group_id", "");
    }
  };

  const getRoomsTypes = () => {
    groupCategoryApi.callGetRoomTypes(
      (message: string, resp: any) => {
        if (resp && resp.list && resp.list.length) {
          setRoomTypes(resp.list);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const getLanguageList = () => {
    groupCategoryApi.callGetRoomLanguage(
      (message: string, resp: any) => {
        if (resp && resp.list && resp.list.length) {
          setLanguageList(resp.list);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handleOnSubmitConfirmationAlert = (
    values: roomSettingModalFormValues
  ) => {
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
        title="Change Settings"
        onConfirm={() => onSubmit(values)}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        Are you sure you want to save the changes?
      </SweetAlert>
    );
  };

  const onSubmit = (values: roomSettingModalFormValues) => {
    let fd = new FormData();
    const params = {
      group_id: parseInt(values.group_id.value),
      // room_type_id: parseInt(values.isPublicPrivate),
      room_type_id: 1, //1 Public, 2 private
      room_name: values.room_name,
      room_category_id: parseInt(values.room_category_id.value),
      welcome_message: values.welcome_message,
      banner_url: values.banner_url,
      language_id: parseInt(values.language_id.value),
      video_enabled: getBooleanToValueStatus(values.video_enabled),
      voice_enabled: getBooleanToValueStatus(values.voice_enabled),
      locked_room: getBooleanToValueStatus(values.locked_room),
      text_enabled: 1,
      lockword: values.lockword,
      admin_code: values.admin_code,
      room_password: values.room_password ? values.room_password : "",
      post_url: values.post_url.value,
      filter_words: values.is_comma_separated
        ? values.filter_words
        : replaceCommaSeparator(values.filter_words ? values.filter_words : ""),
      is_comma_separated: getBooleanToValueStatus(values.is_comma_separated),
      room_pic: values && values.room_pic.length ? values.room_pic[0] : "",
    };

    for (const [key, value] of Object.entries(params)) {
      fd.append(key, value);
    }

    var apiParams = {
      apiParms: fd,
      extra: {
        id: roomDetailsSelector.room.id,
      },
    };

    groupCategoryApi.callUpdateRoom(
      apiParams,
      (message: string, resp: any) => {
        if (resp) {
          getRoomDetails({ room_id: roomDetailsSelector.room.id })
          toast.success(message);
          // groupCategoryAction.showRoomSettingModal(false);
          hideAlert()

        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const getRoomDetails = ({ room_id }: any) => {
    const params = {
      // room_id: parseInt(cryptr.decrypt(roomId))
      room_id: room_id
    };
    groupCategoryApi.callGetRoomDetails(params, (message: string, resp: any) => {
       
      if (resp && resp.list && resp.list.length) {
      }
    }, (message: string) => {
      // toast.error(message)
    })
  }

  const handleVideo = (evt: any) => {
    console.log("HANDLE VIDEO")
    if (evt) {
      setValue("video_enabled", 1);
      // setVoiceEnbledDisabled(true);
    } else {
      // setVoiceEnbledDisabled(false);
      setValue("video_enabled", 0);
    }
  };

  const handleAudio = (evt: any) => {
    if (evt) {
      setValue("voice_enabled", 1);
      // setVoiceEnbledDisabled(true);
    } else {
      // setVoiceEnbledDisabled(false);
      setValue("voice_enabled", 0);
    }
  };

  const handlePasswordOnchange = (val: any) => {
    setVerifyPassword(val);
  };

  const handleRoomPasswordVerify = (e: any) => {
    e.preventDefault();
    var params = {
      room_id: roomDetailsSelector.room.id,
      room_password: verifyPassword,
    };

    groupCategoryApi.callVerifyRoomPassword(
      params,
      (message: string, resp: any) => {
        if (resp && resp.room) {
          console.log('resp.room---', resp.room)
          setVerifiedRoomDetails(resp.room);
          setRoomVerified(true);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const handelDeleteRoom = (e: any) => {
    // e.preventDefault()
    //sweet alert confirmation here and call delete Room
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
        title="Delete Room"
        onConfirm={() => deleteRoom()}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        Are you sure want to delete room?
      </SweetAlert>
    );
  };

  const deleteRoom = () => {
    hideAlert();
    var params = {
      room_id: roomDetailsSelector.room.id,
    };
    groupCategoryApi.callDeleteRoom(
      params,
      (message: string, resp: any) => {
        if (resp) {
          groupCategoryAction.showRoomSettingModal(false);
          userMeCall();
          history.push(URLS.USER.GROUPS_AND_CATEGORY);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handelRoomFileChange = () => {
    setSelectedFileName(
      getValues("room_pic") && getValues("room_pic").length
        ? getValues("room_pic")[0].name
        : ""
    );
    // setValue('file_hidden', getValues('room_pic') && getValues('room_pic').length ? getValues('room_pic')[0].name : '')
  };

  // console.log('roomDetailsSelector.room----', roomDetailsSelector.room)
  useEffect(() => {
    getCategoryList();
    getGroupList();
    getLanguageList();
    getRoomsTypes();
  }, []);

  useEffect(() => {
    console.log('roomGroupList--', roomGroupList)
    if (roomDetailsSelector && roomGroupList && roomCategoryList) {
      var groupFound =
        roomGroupList && roomGroupList.length
          ? roomGroupList.filter(
            (x: any) => x.id === roomDetailsSelector.room.group_id
          )
          : [];
      if (groupFound && groupFound.length) {
        setValue("group_id", {
          value: String(groupFound[0].id),
          label: groupFound[0].group_name,
        });
      }
      var categoryFound =
        roomCategoryList && roomCategoryList.length
          ? roomCategoryList.filter(
            (x: any) => x.id === roomDetailsSelector.room.room_category_id
          )
          : [];
      if (categoryFound && categoryFound.length) {
        setValue("room_category_id", {
          value: String(categoryFound[0].id),
          label: categoryFound[0].category_title,
        });
      }
      var languageFound =
        languageList && languageList.length
          ? languageList.filter(
            (x: any) => x.id === roomDetailsSelector.room.language_id
          )
          : [];
      if (languageFound && languageFound.length) {
        setValue("language_id", {
          value: String(languageFound[0].id),
          label: languageFound[0].language_title,
        });
      }
      var postUrlFound = CREATE_ROOM_POST_URL_USERS.length
        ? CREATE_ROOM_POST_URL_USERS.filter(
          (x: any) => x.value === roomDetailsSelector.room.post_url
        )
        : [];
      if (postUrlFound && postUrlFound.length) {
        setValue("post_url", {
          value: postUrlFound[0].value,
          label: postUrlFound[0].label,
        });
      }

      // if (roomTypes && roomTypes.length) {
      //     setValue('isPublicPrivate', roomDetailsSelector.room.room_type_id.toString())
      // }

      setValue(
        "room_name",
        roomDetailsSelector.room.room_name
          ? roomDetailsSelector.room.room_name
          : ""
      );
      setValue(
        "welcome_message",
        roomDetailsSelector.room.welcome_message
          ? roomDetailsSelector.room.welcome_message
          : ""
      );
      setValue(
        "banner_url",
        roomDetailsSelector.room.banner_url
          ? roomDetailsSelector.room.banner_url
          : ""
      );
      setValue(
        "video_enabled",
        roomDetailsSelector.room.video_enabled ? true : false
      );
      if (roomDetailsSelector.room.video_enabled) {
        handleVideo(true);
      }
      setValue(
        "voice_enabled",
        roomDetailsSelector.room.voice_enabled ? true : false
      );
      if (roomDetailsSelector.room.voice_enabled) {
        handleAudio(true);
      }
      setValue(
        "is_comma_separated",
        roomDetailsSelector.room.is_comma_separated ? true : false
      );
      setValue(
        "filter_words",
        roomDetailsSelector.room.filter_words
          ? roomDetailsSelector.room.filter_words
          : ""
      );
    }

    if (verifiedRoomDetails) {
      if (verifiedRoomDetails.locked_room) {
        setShowLockwordField(true);
      } else {
        setShowLockwordField(false);
      }

      setValue("locked_room", verifiedRoomDetails.locked_room ? true : false);
      setTimeout(() => {
        setValue(
          "lockword",
          verifiedRoomDetails.lockword ? verifiedRoomDetails.lockword : ""
        );
      }, 1000);

      setValue(
        "admin_code",
        verifiedRoomDetails.admin_code ? verifiedRoomDetails.admin_code : ""
      );
      setValue(
        "room_password",
        verifiedRoomDetails.room_password
          ? verifiedRoomDetails.room_password
          : ""
      );
      setValue(
        "c_room_password",
        verifiedRoomDetails.room_password
          ? verifiedRoomDetails.room_password
          : ""
      );
    }
  }, [verifiedRoomDetails, cancelChanges]); //roomCategoryList, roomDetailsSelector, roomGroupList, languageList, roomTypes

  const handleRoomPasswordTextToggle = () => {
    if (roomPasswordTextToggle == "password") {
      setRoomPasswordTextToggle("text");
    } else {
      setRoomPasswordTextToggle("password");
    }
  };

  const handleAdminPasswordTextToggle = () => {
    if (adminPasswordTextToggle == "password") {
      setAdminPasswordTextToggle("text");
    } else {
      setAdminPasswordTextToggle("password");
    }
  };

  const handleLockPasswordTextToggle = () => {
    if (lockPasswordTextToggle == "password") {
      setLockPasswordTextToggle("text");
    } else {
      setLockPasswordTextToggle("password");
    }
  };

  const handlePasswordTextToggle = () => {
    if (passwordTextToggle == "password") {
      setPasswordTextToggle("text");
    } else {
      setPasswordTextToggle("password");
    }
  };

  const handleConfirmPasswordTextToggle = () => {
    if (passwordConfirmTextToggle == "password") {
      setPasswordConfirmTextToggle("text");
    } else {
      setPasswordConfirmTextToggle("password");
    }
  };

  const handleLockwordCheckBoxChange = (e: any) => {
    if (e) {
      setShowLockwordField(true);
    } else {
      setShowLockwordField(false);
    }
  };

  return (
    <React.Fragment>
      {alert}
      <Modal
        show={shouldShow}
        backdrop="static"
        // onHide={() => onClose(false)}
        keyboard={false}
        className="theme-custom-modal"
        dialogClassName="modal-dialog-scrollable"
        size={"lg"}
        centered
        contentClassName="custom-modal"
      >
        <Modal.Header >
          <h2>Room Setting</h2>
          <span style={{ cursor: "pointer" }} onClick={(e) => handelClose(e)}>
            <i className="fa fa-times fa-2x text-white"></i>
          </span>
        </Modal.Header>
        <Modal.Body className="pl-0 pr-0">
          <form noValidate>
            <div className="manage-video-message-panel room_modal">
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <input
                      type={roomPasswordTextToggle}
                      className="form-control"
                      value={verifyPassword}
                      disabled={roomVerified}
                      onChange={(e) => handlePasswordOnchange(e.target.value)}
                      placeholder="Room Password"
                    />
                    <span
                      className="eye-password-text"
                      onClick={handleRoomPasswordTextToggle}
                    >
                      {roomPasswordTextToggle == "password" ? (
                        <i className="fa fa-eye" aria-hidden="true"></i>
                      ) : (
                        <i className="fa fa-eye-slash" aria-hidden="true"></i>
                      )}
                    </span>
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="form-group">
                    <button
                      type="button"
                      className="btn theme-btn btn-primary mr-2 waves-effect"
                      disabled={roomVerified}
                      onClick={(e) => handleRoomPasswordVerify(e)}
                    >
                      Verify
                    </button>
                  </div>
                </div>
                {/* <div className="col-sm-3">
                  <div className="form-group text_in"> */}
                {/* <input type="text" className="form-control" placeholder="Room Name" /> */}
                {/* <span
                      className="owner-name"
                      style={{
                        color: verifiedRoomDetails?.room_owner?.details
                          ? getSubscriptionColor(
                            verifiedRoomDetails.room_owner.details
                          )
                          : "#acb9f9",
                      }}
                    >
                      {verifiedRoomDetails &&
                        verifiedRoomDetails.room_owner &&
                        verifiedRoomDetails.room_owner.details &&
                        verifiedRoomDetails.room_owner.details.username
                        ? verifiedRoomDetails.room_owner.details.username
                        : null}
                    </span>
                  </div>
                </div> */}

                <div className="col-sm-6">
                  <div className="form-group">
                    <Controller
                      control={control}
                      name="room_name"
                      render={({ onChange, onBlur, value, name, ref }) => (
                        <FormTextInput
                          // name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          disabled={true}
                          // disabled={verifiedRoomDetails ? false : true}
                          value={value}
                          inputRef={ref}
                          type="text"
                          error={errors.room_name}
                          placeholder="Room name"
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <Controller
                      control={control}
                      name="room_category_id"
                      render={({ onChange, onBlur, value, name, ref }) => (
                        <SelectInput
                          // name={name}
                          onChange={(e) => {
                            onChange(e);
                            handleRoomCategoryChange(e);
                          }}
                          onBlur={onBlur}
                          value={value}
                          inputRef={ref}
                          dark={true}
                          isDisabled={verifiedRoomDetails ? false : true}
                          options={
                            roomCategoryList
                              ? roomCategoryList.map((c: any) => ({
                                value: String(c.id),
                                label: c.category_title,
                              }))
                              : []
                          }
                          error={errors.room_category_id}
                          placeholder="Select room rate"
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <Controller
                      control={control}
                      name="group_id"
                      render={({ onChange, onBlur, value, name, ref }) => (
                        <SelectInput
                          // name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          inputRef={ref}
                          isDisabled={verifiedRoomDetails ? false : true}
                          dark={true}
                          options={
                            roomGroupList
                              ?
                              roomGroupList.map((c: any) => ({
                                value: String(c.id),
                                label: c.group_name,
                              }))
                              :
                              []
                          }
                          error={errors.group_id}
                          placeholder="Select a Category"
                        />
                      )}
                    />
                  </div>
                </div>
                {
                  // [1, 3].includes(roomDetailsSelector.room.join_status.is_admin) &&
                  <div className="col-sm-6">
                    <div className="form-group">
                      <Controller
                        control={control}
                        name="banner_url"
                        render={({ onChange, onBlur, value, name, ref }) => (
                          <FormTextInput
                            // name={name}
                            onChange={onChange}
                            onBlur={onBlur}
                            disabled={verifiedRoomDetails ? ![1, 3].includes(roomDetailsSelector.room.join_status.is_admin) : true}
                            value={value}
                            inputRef={ref}
                            type="text"
                            error={errors.banner_url}
                            placeholder="Banner's URL"

                          />
                        )}
                      />
                    </div>
                  </div>
                }

                <div className="col-sm-12">
                  <label>Room Welcome Message</label>
                </div>
                <div className="col-sm-12">
                  <div className="form-group">
                    <Controller
                      control={control}
                      name="welcome_message"
                      render={({ onChange, onBlur, value, name, ref }) => (
                        // <FormTextAreaInput
                        //     name={name}
                        //     onChange={onChange}
                        //     onBlur={onBlur}
                        //     value={value}
                        //     rows={4}
                        //     isDisabled={verifiedRoomDetails ? false : true}
                        //     inputRef={ref}
                        //     type="textarea"
                        //     error={errors.welcome_message}
                        //     placeholder="Welcome Message"
                        // />
                        <EditorInputBasic
                          value={value}
                          inputRef={ref}
                          name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          isDisabled={verifiedRoomDetails ? false : true}
                          toolbarItems={["undo", "redo"]}
                          error={errors.welcome_message}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="col-sm-12">
                  <div className="ch_img">
                    {roomDetailsSelector.room.room_picture.thumb ? (
                      <img
                        src={roomDetailsSelector.room.room_picture.thumb}
                        alt={roomDetailsSelector.room.room_name}
                      />
                    ) : null}
                  </div>
                  <div className="form-group input_f">
                    <span>Choose File</span>
                    <input
                      type="hidden"
                      name="file_hidden"
                      placeholder="hidden field"
                      ref={register}
                    />
                    <input
                      className=""
                      type="file"
                      name="room_pic"
                      placeholder="Select room thumbnail"
                      capture
                      disabled={verifiedRoomDetails ? false : true}
                      accept="image/*"
                      ref={register}
                      onChange={handelRoomFileChange}
                    />
                  </div>
                  <label className="selected-file-name-label">
                    {selectedFileName}
                  </label>
                  <hr className="light-hr"></hr>
                </div>

                <div className="col-sm-3">
                  <div className="three-checkbox-wrap">
                    <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 ">
                      <input
                        type="checkbox"
                        name="video_enabled"
                        disabled={verifiedRoomDetails ? false : true}
                        className="custom-control-input"
                        id="customCheck-outlinecolor51"
                        onChange={(e) => handleVideo(e.target.checked)}
                        ref={register}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="customCheck-outlinecolor51"
                      >
                        Enable Video
                      </label>
                      <div className="help-tip">
                        <span title="Check this small box to allow users to have Video Chat">
                          <i className="fa fa-info-circle"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-sm-3">
                  <div className="three-checkbox-wrap">
                    <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 ">
                      <input
                        type="checkbox"
                        name="voice_enabled"
                        disabled={verifiedRoomDetails ? false : true}
                        className="custom-control-input"
                        id="customCheck-outlinecolor52"
                        onChange={(e) => handleAudio(e.target.checked)}
                        ref={register}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="customCheck-outlinecolor52"
                      >
                        Enable Audio
                      </label>
                      <div className="help-tip">
                        <span title="Check this small box to allow users to have Audio Chat">
                          <i className="fa fa-info-circle"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>


                {/* <div className="col-sm-3">
                  <div className="three-checkbox-wrap">
                    <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4">
                      <input
                        type="checkbox"
                        name="voice_enabled"
                        disabled={
                          verifiedRoomDetails ? false : true
                        }
                        className="custom-control-input"
                        id="customCheck-outlinecolor41"
                        onChange={(e) => handleAudio(e.target.checked)}
                      // ref={register}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="customCheck-outlinecolor41"
                      >
                        Enable Audio
                      </label>
                      <div className="help-tip">
                        <span title="Check this small box to allow users to have Voice Chat">
                          <i className="fa fa-info-circle"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div> */}
                <div className="col-sm-3">
                  <div className="three-checkbox-wrap">
                    <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 ">
                      {/* <input type="checkbox" name="locked_room" disabled={verifiedRoomDetails ? false : true} className="custom-control-input" id="customCheck-outlinecolor52" ref={register} />
                                            <label className="custom-control-label" htmlFor="customCheck-outlinecolor52">Locked Room</label> */}
                      <Controller
                        control={control}
                        name="locked_room"
                        render={({ onChange, onBlur, value, name, ref }) => (
                          <CheckboxInput
                            name={name}
                            onChange={(e) => {
                              onChange(e);
                              handleLockwordCheckBoxChange(e);
                            }}
                            classname="custom-control-input"
                            disabled={verifiedRoomDetails ? false : true}
                            onBlur={onBlur}
                            value={value}
                            id="customCheck-outlinecolor53"
                            inputRef={ref}
                            label="Add Lockword"
                            error={errors.locked_room}
                          />
                        )}
                      />
                      <div className="help-tip">
                        <span title="A Lockword will be shared and used by the users to join this room">
                          <i className="fa fa-info-circle"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {showLockwordField ? (
                  <div className="col-sm-3">
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
                            disabled={verifiedRoomDetails ? false : true}
                            inputRef={ref}
                            type={lockPasswordTextToggle}
                            error={errors.lockword}
                            placeholder="Lockword"
                          />
                        )}
                      />
                      <span
                        className="eye-password-text"
                        onClick={handleLockPasswordTextToggle}
                      >
                        {lockPasswordTextToggle == "password" ? (
                          <i className="fa fa-eye" aria-hidden="true"></i>
                        ) : (
                          <i className="fa fa-eye-slash" aria-hidden="true"></i>
                        )}
                      </span>
                    </div>
                  </div>
                ) : null}
                <div className="col-sm-6">
                  <div className="form-group">
                    <Controller
                      control={control}
                      name="admin_code"
                      render={({ onChange, onBlur, value, name, ref }) => (
                        <FormTextInput
                          // name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          disabled={verifiedRoomDetails ? false : true}
                          inputRef={ref}
                          type={adminPasswordTextToggle}
                          error={errors.admin_code}
                          placeholder="Admin Code"
                        />
                      )}
                    />
                    <span
                      className="eye-password-text"
                      onClick={handleAdminPasswordTextToggle}
                    >
                      {adminPasswordTextToggle == "password" ? (
                        <i className="fa fa-eye" aria-hidden="true"></i>
                      ) : (
                        <i className="fa fa-eye-slash" aria-hidden="true"></i>
                      )}
                    </span>
                    <div className="help-tip">
                      <span title="Admin Code should be 6 and 12 characters.">
                        <i className="fa fa-info-circle"></i>
                      </span>
                    </div>
                  </div>
                </div>
                {/* <div className="col-sm-6">
                                    <div className="two-checkbox-wrap">
                                        {roomTypes && roomTypes.length ? roomTypes.map((x: any, index: number) =>
                                            <div key={index} className="custom-control custom-radio custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 d-inline-block ml-0 pl-0">
                                                <img src={index === 0 ? "/img/public-icon.png" : "/img/lock-icon.png"} alt={x.type_name} />
                                                <input type="radio" disabled={verifiedRoomDetails ? false : true} className="custom-control-input" id={"radiopublic" + index} name="isPublicPrivate" value={x.id} ref={register} />
                                                <label className="custom-control-label" htmlFor={"radiopublic" + index}>{x.type_name}</label>
                                            </div>
                                        ) :
                                            <span>No Room Type Found</span>
                                        }
                                        {
                                            errors && errors.isPublicPrivate && errors.isPublicPrivate.message ? <>
                                                <Form.Control.Feedback type="invalid" >
                                                    {errors.isPublicPrivate.message}
                                                </Form.Control.Feedback>
                                            </> : null
                                        }
                                    </div>
                                </div> */}
                <div className="col-sm-6">
                  <div className="form-group">
                    <Controller
                      control={control}
                      name="room_password"
                      render={({ onChange, onBlur, value, name, ref }) => (
                        <FormTextInput
                          // name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          inputRef={ref}
                          disabled={verifiedRoomDetails ? false : true}
                          type={passwordTextToggle}
                          error={errors.room_password}
                          placeholder="Room's Password"
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
                    <div className="help-tip">
                      <span title="Room's password is confidential. It will be used to identify you as the room's owner and to be abale to do any modifications to your room's settings in the future.">
                        <i className="fa fa-info-circle"></i>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <Controller
                      control={control}
                      name="c_room_password"
                      render={({ onChange, onBlur, value, name, ref }) => (
                        <FormTextInput
                          // name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          disabled={verifiedRoomDetails ? false : true}
                          inputRef={ref}
                          type={passwordConfirmTextToggle}
                          error={errors.c_room_password}
                          placeholder="Retype Room's Password"
                        />
                      )}
                    />
                    <span
                      className="eye-password-text"
                      onClick={handleConfirmPasswordTextToggle}
                    >
                      {passwordConfirmTextToggle == "password" ? (
                        <i className="fa fa-eye" aria-hidden="true"></i>
                      ) : (
                        <i className="fa fa-eye-slash" aria-hidden="true"></i>
                      )}
                    </span>
                    <div className="help-tip">
                      <span title="Room's Password should be 6 and 16 characters.">
                        <i className="fa fa-info-circle"></i>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6"></div>

                {
                  // [1, 3].includes(roomDetailsSelector.room.join_status.is_admin) &&
                  <>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <Controller
                          control={control}
                          name="filter_words"
                          render={({ onChange, onBlur, value, name, ref }) => (
                            <FormTextInput
                              onChange={onChange}
                              onBlur={onBlur}
                              value={value}
                              inputRef={ref}
                              disabled={verifiedRoomDetails ? ![1, 3].includes(roomDetailsSelector.room.join_status.is_admin) : true}
                              type="text"
                              error={errors.filter_words}
                              placeholder="Filterd Words in Room"
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <div className="form-group">
                        <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 pl-0">
                          <input
                            type="checkbox"
                            disabled={verifiedRoomDetails ? ![1, 3].includes(roomDetailsSelector.room.join_status.is_admin) : true}
                            name="is_comma_separated"
                            ref={register}
                            className="custom-control-input"
                            id="customCheck-outlinecolor9"
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="customCheck-outlinecolor9"
                          >
                            Use commas to seperate words
                          </label>
                          <div className="help-tip">
                            <span title="Use commas to seperate words">
                              <i className="fa fa-info-circle"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                }

                <div className="col-sm-6">
                  <div className="form-group">
                    <Controller
                      control={control}
                      name="language_id"
                      render={({ onChange, onBlur, value, name, ref }) => (
                        <SelectInput
                          // name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          inputRef={ref}
                          isDisabled={verifiedRoomDetails ? false : true}
                          dark={true}
                          options={
                            languageList && languageList.length
                              ? languageList.map((c: any) => ({
                                value: String(c.id),
                                label: c.language_title,
                              }))
                              : []
                          }
                          error={errors.language_id}
                          placeholder="Select language"
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <Controller
                      control={control}
                      name="post_url"
                      render={({ onChange, onBlur, value, name, ref }) => (
                        <SelectInput
                          // name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          isDisabled={verifiedRoomDetails ? false : true}
                          inputRef={ref}
                          dark={true}
                          options={CREATE_ROOM_POST_URL_USERS}
                          error={errors.post_url}
                          placeholder="Select option"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              {/* room type public then open this */}
              {roomDetailsSelector?.room.room_type_id === 1 ? (
                <div className="row">
                  {/* {roomDetailsSelector?.room.join_status.is_admin === 3 ? ( */}
                  <div className="col-sm-6 text-right">
                    {/* <a href="#" className="btn btn-primary waves-effect" onClick={(e) => adminSettingModalOpen(e, 'headAdmins')} >Head Admins</a> */}
                    {/* <button disabled={verifiedRoomDetails ? false : true} className="btn btn-primary waves-effect" onClick={(e) => adminSettingModalOpen(e, 'headAdmins')}>Head Admins</button> */}
                    <button
                      disabled={verifiedRoomDetails ? ![3].includes(roomDetailsSelector?.room.join_status.is_admin) : true}
                      className="btn btn-primary waves-effect"

                      onClick={(e) => adminSettingModalOpen(e, "headAdmins")}
                    >
                      Head Admins
                    </button>
                  </div>
                  {/* ) : null} */}
                  {/* {[1, 3].includes(
                    roomDetailsSelector?.room.join_status.is_admin
                  ) ? ( */}
                  <div className="col-sm-6">
                    {/* <a href="#" className="btn btn-primary waves-effect" onClick={(e) => adminSettingModalOpen(e, 'admins')} > Admins</a> */}
                    <button
                      disabled={verifiedRoomDetails ? ![1, 3].includes(roomDetailsSelector?.room.join_status.is_admin) : true}
                      className="btn btn-primary waves-effect"
                      onClick={(e) => adminSettingModalOpen(e, "admins")}
                    >
                      Admins
                    </button>
                  </div>
                  {/* ) : null} */}
                </div>
              ) : null}
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <div className="left-btns">
              {/* <a href="#" className="btn theme-btn btn-danger  waves-effect" onClick={(e) => handelDeleteRoom(e)} >Delete Room</a> */}
              <button
                type="button"
                disabled={(verifiedRoomDetails && roomDetailsSelector.room.join_status.is_admin == 3) ? false : true}
                onClick={handelDeleteRoom}
                className="btn theme-btn btn-danger waves-effect"
              >
                Delete Room
              </button>
            </div>
            <div className="right-btns">
              <a
                href="#"
                className="btn theme-btn btn-default waves-effect mr-2"
                onClick={(e) => handelCancel(e)}
              >
                Cancel
              </a>
              {/* <a href="#" className="btn theme-btn btn-primary waves-effect">Apply</a> */}
              <button
                type="submit"
                disabled={verifiedRoomDetails ? false : true}
                onClick={handleSubmit(handleOnSubmitConfirmationAlert)}
                className="btn theme-btn btn-primary waves-effect"
              >
                Apply
              </button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
      {showAdminSetting ? (
        <AdminSettingModal
          onClose={adminSettingModalClose}
          shouldShow={showAdminSetting}
          adminType={adminType}
        />
      ) : null}
    </React.Fragment>
  );
}
