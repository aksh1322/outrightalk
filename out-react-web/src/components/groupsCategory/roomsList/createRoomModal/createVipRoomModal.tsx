import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { Form, Modal } from "react-bootstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import { Controller, useForm } from "react-hook-form";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import CheckboxInput from "src/_common/components/form-elements/checkboxinput/checkboxInput";
import EditorInputBasic from "src/_common/components/form-elements/ckTextEditor/ckEditorInputBasic";
import SelectInput from "src/_common/components/form-elements/selectinput/selectInput";
import FormTextInput from "src/_common/components/form-elements/textinput/formTextInput";
import { useCommonApi } from "src/_common/hooks/actions/commonApiCall/appCommonApiCallHook";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import { useUserApi } from "src/_common/hooks/actions/user/appUserApiHook";
import { useUserPreferenceApi } from "src/_common/hooks/actions/userPreference/appUserPreferenceApiHook";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";
import {
  ContactListOnlineOffline
} from "src/_common/interfaces/ApiReqRes";
import { OptionValue } from "src/_common/interfaces/common";
import { CRYPTO_SECRET_KEY, URLS } from "src/_config";
import {
  getBooleanToValueStatus,
  replaceCommaSeparator,
} from "src/_config/functions";
import { CREATE_ROOM_POST_URL_USERS } from "src/_config/site_statics";
import * as yup from "yup";
const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

interface CreateRoomTwoModalProps {
  onClose: (success: any) => void;
  shouldShow: boolean;
  roomList: () => void;
}
interface createRoomStepTwoFormValues {
  room_name: string;
  for_nickname:string;
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
  acceptPolicy: boolean;
  is_comma_separated: boolean;
  room_pic: any;
  file_hidden: string;
}
interface createPrivateFormStepTwoFormValues {
  room_name: string;
  for_nickname:string;
  welcome_message: string;
  acceptPolicy: boolean;
  room_pic: any;
  file_hidden: string;
}

const createRoomStepTwoFormSchema = yup.object().shape({
  room_name: yup.string().required("Room name is required"),
  for_nickname:yup.string().required("Nick name is required"),
  room_category_id: yup
    .object()
    .shape({
      value: yup.string(),
    })
    .nullable()
    ,
  group_id: yup
    .object()
    .shape({
      value: yup.string(),
    })
    .nullable(),
  welcome_message: yup.string(),
  // .required('Welcome message is required'),
  banner_url: yup.string(),
  // .required('Banner url is required'),
  language_id: yup
    .object()
    .shape({
      value: yup.string().required("Language is required"),
    })
    .nullable()
    .required("Language is required"),
  video_enabled: yup.boolean().required("Video enabled is required"),
  voice_enabled: yup.boolean().required("Voice enabled is required"),
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
  room_password: yup
    .string()
    .required("Room password is required")
    .min(6, "Password should have minimum 6 characters")
    .max(16, "Max 16 characters are allowed"),
  c_room_password: yup
    .string()
    .oneOf([yup.ref("room_password"), ""], "Passwords must match")
    .required("Confirm room password is Required"),
  post_url: yup
    .object()
    .shape({
      value: yup.string().required("Post url is required"),
    })
    .nullable()
    .required("Post url is required"),
  filter_words: yup.string(),
  // .required('Filter words is required'),
  acceptPolicy: yup.boolean().oneOf([true], "Must Accept rooms policy"),
  room_pic: yup.mixed(),
  file_hidden: yup.string(),
  // .required("Room thumbnail is required")
});

const createRoomStepOneFormSchema = yup.object().shape({
  isPublicPrivate: yup.string().required("Room type is required"),
});

const createPrivateRoomFormSchema = yup.object().shape({
  room_name: yup.string().required("Room name is required"),
  for_nickname:yup.string().required("nickname is required"),
  welcome_message: yup.string(),
  room_pic: yup.mixed(),
  file_hidden: yup.string(),
  // .required("Room thumbnail is required"),
  acceptPolicy: yup.boolean().oneOf([true], "Must Accept rooms policy"),
});

export default function CreateVipRoomModal({
  onClose,
  shouldShow,
  roomList,
}: CreateRoomTwoModalProps) {
  const history = useHistory();
  const groupCategoryApi = useGroupCategoryApi();
  const commonApi = useCommonApi();
  const userApi = useUserApi();
  const preferenceApi = useUserPreferenceApi();
  const userSelector = useAppUserDetailsSelector();
  const [roomTypes, setRoomTypes] = useState<any>();
  const [roomGroupList, setRoomGroupList] = useState<any[]>([]);
  const [voiceEnbledDisabled, setVoiceEnbledDisabled] = useState(false);
  const [groupListDisable, setGroupListDisable] = useState<boolean>(true);
  const [selectedFileName, setSelectedFileName] = useState<any>(null);
  const [fetchLanguageList, setFetchLanguageList] = useState<any[]>([]);
  const [fetchCategoryList, setFetchCategoryList] = useState<any[]>([]);

  const [lockPasswordTextToggle, setLockPasswordTextToggle] =
    useState("password");
  const [adminPasswordTextToggle, setAdminPasswordTextToggle] =
    useState("password");
  const [passwordTextToggle, setPasswordTextToggle] = useState("password");
  const [passwordConfirmTextToggle, setPasswordConfirmTextToggle] =
    useState("password");
  const [showLockwordField, setShowLockwordField] = useState<boolean>(false);
  const [checkedValues, setCheckedValues] = useState<number[]>([]);
  const [contactList, setContactList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<any>("");
  const [roomJoinConfirmationAlert, setRoomJoinConfirmationAlert] =
    useState<any>(null);
  const [showFakeField, setShowFakeField] = useState<boolean>(true);

  //Hide alert if user reject to join the room
  const hideRoomJoinConfirmationAlert = () => {
    setRoomJoinConfirmationAlert(null);
    onClose(false);
    roomList();
  };



  //Room Join confirmation alert
  const showRoomJoinConfirmationAlert = (roomId: number, groupId: number) => {
    // e && e.preventDefault()
    setRoomJoinConfirmationAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        cancelBtnBsStyle="danger"
        confirmBtnBsStyle="success"
        allowEscape={false}
        closeOnClickOutside={false}
        title="Join Room"
        onConfirm={() => handleJoinRoom(roomId, groupId)}
        onCancel={hideRoomJoinConfirmationAlert}
        focusCancelBtn={true}
      >
        The room has been successfully created! Join Now
      </SweetAlert>
    );
  };

  const handleMultipleJoinRoomCancel = () => {
    setRoomJoinConfirmationAlert(null);
    history.replace("");
    history.push(URLS.USER.DASHBOARD);
  };

  const handleShowAlert = (
    roomId: number,
    groupId: number,
    exit_room: number
  ) => {
    setRoomJoinConfirmationAlert(
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
        onConfirm={() => handleFinalJoinRoom(roomId, groupId, exit_room)}
        onCancel={handleMultipleJoinRoomCancel}
        focusCancelBtn={true}
      >
        You have a basic nickname, you cannot be in more than one voice room
        simultaneously, you will exit the current room automatically. Do you
        want to proceed?
      </SweetAlert>
    );
  };

  //Join room api call
  const handleJoinRoom = (roomId: number, groupId: number) => {
    const params = {
      room_id: roomId,
    };

    groupCategoryApi.callJoinSimultaneouslyRoom(
      params,
      (message: string, resp: any) => {
        if (resp) {
          handleFinalJoinRoom(roomId, groupId, 0);
        }
      },
      (message: string) => {
        // toast.error(message)
        handleShowAlert(roomId, groupId, 1);
      }
    );
  };

  const handleFinalJoinRoom = (
    roomId: number,
    groupId: number,
    exit_room: number,
    invitation_code?: number // initation code
  ) => {
    const params = {
      room_id: roomId,
      exit_room,
      invitation_code, // initation code
    };
    groupCategoryApi.callJoinRoom(
      params,
      (message: string, resp: any) => {
        if (resp) {
          toast.success(message);
          onClose(false);
          redirectToRoomDetailsPage(roomId, groupId);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  //Redirected to room details page after join confirmation accept
  const redirectToRoomDetailsPage = (r_Id: number, g_Id: number) => {
    const roomId = cryptr.encrypt(r_Id);
    const groupId = cryptr.encrypt(g_Id);
    history.replace("");
    history.push(`${groupId}/${roomId}/room-details`);
  };

  //Select Checkbox for private room invitation member select
  const handleSelect = (checkedName: number) => {
    const newNames = checkedValues?.includes(checkedName)
      ? checkedValues?.filter((name) => name !== checkedName)
      : [...(checkedValues ?? []), checkedName];
    setCheckedValues(newNames);
    return newNames;
  };

  //Filter the users from the list for private room
  const results = !searchTerm
    ? contactList
    : contactList &&
      contactList.length &&
      contactList.filter((el: any) =>
        el.customize_nickname && el.customize_nickname.nickname
          ? el.customize_nickname.nickname
              .toLowerCase()
              .includes(searchTerm.toLocaleLowerCase())
          : el.contact_user.username
              .toLowerCase()
              .includes(searchTerm.toLocaleLowerCase())
      );

  const handleContactSearch = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const userMeCall = () => {
    userApi.callGetMe(
      (message: string, resp: any) => {},
      (message: string, resp: any) => {
        toast.error(message);
      }
    );
  };

  // Public Room Form
  const {
    register,
    control,
    setValue,
    getValues,
    reset,
    handleSubmit: handleSubmitTwo,
    errors,
  } = useForm<createRoomStepTwoFormValues>({
    // mode: 'onBlur',
    resolver: yupResolver(createRoomStepTwoFormSchema),
    defaultValues: {
      room_name: "",
      for_nickname:"",
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
      filter_words: "",
      is_comma_separated: false,
      acceptPolicy: false,
      room_pic: "",
      file_hidden: "",
    },
  });

  // Form One
  const {
    control: controlOne,
    register: registerOne,
    errors: errorsOne,
    handleSubmit: handleSubmitOne,
  } = useForm<any>({
    resolver: yupResolver(createRoomStepOneFormSchema),
    defaultValues: {
      isPublicPrivate: "",
    },
  });

  //Private room Form
  const {
    control: controlPrivateRoom,
    register: registerPrivateRoom,
    errors: errorsPrivateRoom,
    handleSubmit: handleSubmitPrivateForm,
    reset: privateRoomReset,
    getValues: privateRoomGetValues,
    setValue: privateRoomSetValue,
  } = useForm<createPrivateFormStepTwoFormValues>({
    resolver: yupResolver(createPrivateRoomFormSchema),
    defaultValues: {
      room_name: "",
      for_nickname:'',
      welcome_message: "",
      acceptPolicy: false,
      room_pic: "",
      file_hidden: "",
    },
  });

  const getContactList = () => {
    const params: ContactListOnlineOffline = {
      type: "online",
    };
    commonApi.callOnlineOfflineCOntactList(
      params,
      (message: string, respContact: any) => {
        if (respContact && respContact.users && respContact.users.length) {
          setContactList(respContact.users);
        } else {
          setContactList([]);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
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

  const getGroupList = (id: number) => {
    const params = {
      category_id: id,
    };
    groupCategoryApi.callGetRoomGroups(
      params,
      (message: string, resp: any) => {
        if (resp && resp.list && resp.list.length) {
          setRoomGroupList(resp.list);
          // setRoomGroupList([
          //   {
          //     "id": 4,
          //     "group_name": "General Category",
          //     "categoty_type": 0
          //   },
          //     {
          //     "id": 4,
          //     "group_name": "Business and stocks",
          //     "categoty_type": 0
          //   },
          //       {
          //     "id": 4,
          //     "group_name": "Social Affairs&Politics",
          //     "categoty_type": 0
          //   }
          // ]
          // );
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
      setValue("group_id", "");
      getGroupList(parseInt(e.value));
      setGroupListDisable(false);
    } else {
      setValue("group_id", "");
      setGroupListDisable(true);
    }
  };



  const onFormTwoSubmit = (values: createRoomStepTwoFormValues) => {
    console.log(values,"values");
    
    let fd = new FormData();
    const params = {
      group_id: 21,
      room_type_id: 1,
      room_name: values.room_name,
      for_nickname:values.for_nickname,
      room_category_id: 5,
      welcome_message: values.welcome_message,
      banner_url: values.banner_url,
      language_id: parseInt(values.language_id.value),
      video_enabled: getBooleanToValueStatus(values.video_enabled),
      voice_enabled: getBooleanToValueStatus(values.voice_enabled),
      locked_room: getBooleanToValueStatus(values.locked_room),
      text_enabled: 1,
      lockword: values.lockword,
      admin_code: values.admin_code,
      room_password: values.room_password,
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

    groupCategoryApi.callCreateVipRoom(
      fd,
      (message: string, resp: any) => {
        if (resp) {
          toast.success(message);
          // roomList()
          onClose(false);
          userMeCall(); // call init api for updated menu/reducer data
          // showRoomJoinConfirmationAlert(resp.id, resp.group_id);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  

  const handleVideo = (evt: any) => {
    if (evt) {
      setValue("voice_enabled", 1);
      setVoiceEnbledDisabled(true);
    } else {
      setVoiceEnbledDisabled(false);
      setValue("voice_enabled", 0);
    }
  };

  const handleReset = (e: any) => {
    e.preventDefault();
    setSelectedFileName(null);

      reset({
        room_name: "",
        for_nickname:"",
        room_category_id: "",
        group_id: "",
        welcome_message: "",
        banner_url: "",
        language_id: "",
        video_enabled: false,
        voice_enabled: false,
        locked_room: false,
        lockword: "",
        admin_code: "",
        room_password: "",
        c_room_password: "",
        post_url: "",
        filter_words: "",
        acceptPolicy: false,
        room_pic: null,
        file_hidden: "",
      });

  };

  const handelRoomFileChange = () => {

      setSelectedFileName(
        getValues("room_pic") && getValues("room_pic").length
          ? getValues("room_pic")[0].name
          : ""
      );
      setValue(
        "file_hidden",
        getValues("room_pic") && getValues("room_pic").length
          ? getValues("room_pic")[0].name
          : ""
      );
    
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
      setShowFakeField(true);
    } else {
      setShowLockwordField(false);
      setShowFakeField(true);
    }
  };

  const getLanguageList = () => {
    groupCategoryApi.callGetRoomLanguage(
      (message: string, resp: any) => {
        if (resp && resp.list && resp.list.length) {
          setFetchLanguageList(resp.list);
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
          let finalList = resp.list.filter(
            (ele: any) =>
              ele.category_title != "System" && ele.category_title != "VIP"
          );
          setFetchCategoryList(finalList);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  //If room type is public then below useEffect will call


  useEffect(() => {
    getContactList();
    getCategoryList();
    getLanguageList();
  }, []);

  



  const handleCloseClick = () => {
    setRoomJoinConfirmationAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes"
        cancelBtnText="No"
        cancelBtnBsStyle="danger"
        confirmBtnBsStyle="success"
        allowEscape={false}
        closeOnClickOutside={false}
        title="Cancel"
        onConfirm={() => onClose(true)}
        onCancel={() => setRoomJoinConfirmationAlert(null)}
        focusCancelBtn={true}
      >
        Are you sure you want to close this?
      </SweetAlert>
    );
  };

  return (
    <React.Fragment>
      {roomJoinConfirmationAlert}

          <Modal
            show={shouldShow}
            backdrop="static"
            onHide={() => onClose(false)}
            keyboard={false}
            className="theme-custom-modal"
            dialogClassName="modal-dialog-scrollable"
            size={"lg"}
            centered
            contentClassName="custom-modal"
          >
            <Modal.Header>
              <h2>Create a Vip Room</h2>
            </Modal.Header>
            <Modal.Body
              bsPrefix={"create-room"}
              className="modal-body pl-0 pr-0"
            >
              {/**This is Fake field for bypassing browser saved password */}
              {showFakeField ? (
                <>
                  <input
                    type="text"
                    style={{ opacity: 0 }}
                    name="fakeusernameremembered"
                  />
                  <input
                    type="password"
                    style={{ opacity: 0 }}
                    name="fakepasswordremembered"
                  />
                </>
              ) : null}

              <div className="manage-video-message-panel">
                <div className="row">
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
                  {/* <div className="col-sm-6">
                    <div className="form-group">
                      <Controller
                        control={control}
                        name="room_category_id"
                        render={({ onChange, onBlur, value, name, ref }) => (
                          <SelectInput
                            onChange={(e) => {
                              onChange(e);
                              handleRoomCategoryChange(e);
                            }}
                            onBlur={onBlur}
                            value={value}
                            inputRef={ref}
                            dark={true}
                            options={
                              fetchCategoryList
                                ? fetchCategoryList.map((c: any) => ({
                                    value: String(c.id),
                                    label: c.category_title,
                                  }))
                                : []
                            }
                            error={errors.room_category_id}
                            placeholder="Select room rating"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="col-sm-12">
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
                            dark={true}
                            isDisabled={groupListDisable}
                            options={
                              roomGroupList
                                ? roomGroupList.map((c: any) => ({
                                    value: String(c.id),
                                    label: c.group_name,
                                  }))
                                : []
                            }
                            error={errors.group_id}
                            placeholder="Select a Category"
                          />
                        )}
                      />
                    </div>
                  </div> */}
                  <div className="col-sm-6">
                    <div className="form-group">
                      <Controller
                        control={control}
                        name="for_nickname"
                        render={({ onChange, onBlur, value, name, ref }) => (
                          <FormTextInput
                            // name={name}
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                            inputRef={ref}
                            type="text"
                            error={errors.for_nickname}
                            placeholder="user name"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <label>Room Welcome Message</label>
                  </div>
                  <div className="col-sm-12">
                    <div className="form-group">
                      {/* <textarea className="form-control" placeholder="Welcome Message" style={{ resize: 'none', height: 100 }} defaultValue={""} /> */}
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
                            toolbarItems={["undo", "redo"]}
                            error={errors.welcome_message}
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
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
                        accept="image/*"
                        ref={register}
                        onChange={handelRoomFileChange}
                      />
                      {!selectedFileName ? (
                        errors &&
                        errors.file_hidden &&
                        errors.file_hidden.message ? (
                          <>
                            <Form.Control.Feedback type="invalid">
                              {errors.file_hidden.message}
                            </Form.Control.Feedback>
                          </>
                        ) : null
                      ) : null}
                    </div>
                    <label className="selected-file-name-label">
                      {selectedFileName}
                    </label>
                  </div>
                  <div className="col-sm-6">
                    <div className="help-text"></div>
                  </div>
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
                            dark={true}
                            options={
                              fetchLanguageList
                                ? fetchLanguageList.map((c: any) => ({
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

                  {/*  <div className="col-sm-12">
                                            <div className="three-checkbox-wrap">
                                                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4">
                                                    <input type="checkbox" name="video_enabled" className="custom-control-input" id="customCheck-outlinecolor4" onChange={(e) => handleVideo(e.target.checked)} ref={register} />
                                                    <label className="custom-control-label" htmlFor="customCheck-outlinecolor4">Check this small box to allow users to have Video Chat</label>
                                                </div> */}
                  {/* <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 ">
                                                    <input type="checkbox" disabled={voiceEnbledDisabled} name="voice_enabled" className="custom-control-input" id="customCheck-outlinecolor5" ref={register} />
                                                    <label className="custom-control-label" htmlFor="customCheck-outlinecolor5">Check this small box to allow users to have Voice Chat</label>
                                                </div> */}
                  {/* <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 ">
                                                    <Controller
                                                        control={control}
                                                        name="locked_room"
                                                        render={({ onChange, onBlur, value, name, ref }) => (
                                                            <CheckboxInput
                                                                name={name}
                                                                onChange={
                                                                    (e) => {
                                                                        onChange(e)
                                                                        handleLockwordCheckBoxChange(e)
                                                                    }

                                                                }
                                                                classname="custom-control-input"
                                                                onBlur={onBlur}
                                                                value={value}
                                                                id="customCheck-outlinecolor6"
                                                                inputRef={ref}
                                                                label="A Lockword will be shared and used by the users to join this room"
                                                                error={errors.locked_room}
                                                            />
                                                        )}
                                                    />
                                                </div> 
                                            </div>
                                        </div>*/}
                  <div className="col-sm-4">
                    <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4">
                      <input
                        type="checkbox"
                        name="video_enabled"
                        className="custom-control-input"
                        id="customCheck-outlinecolor4"
                        onChange={(e) => handleVideo(e.target.checked)}
                        ref={register}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="customCheck-outlinecolor4"
                      >
                        Enable Video{" "}
                      </label>
                      <div className="help-tip">
                        <span title="Check this small box to allow users to have Video Chat">
                          <i className="fa fa-info-circle"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 ">
                      <input
                        type="checkbox"
                        disabled={voiceEnbledDisabled}
                        name="voice_enabled"
                        className="custom-control-input"
                        id="customCheck-outlinecolor5"
                        ref={register}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="customCheck-outlinecolor5"
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
                  <div className="col-sm-4">
                    <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 ">
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
                            onBlur={onBlur}
                            value={value}
                            id="customCheck-outlinecolor6"
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
                  {showLockwordField ? (
                    <>
                      <div className="col-sm-6">
                        <div className="form-group">
                          {/* <input type="text" className="form-control" placeholder="Lockword" /> */}
                          <Controller
                            control={control}
                            name="lockword"
                            render={({
                              onChange,
                              onBlur,
                              value,
                              name,
                              ref,
                            }) => (
                              <FormTextInput
                                // name={name}
                                onChange={onChange}
                                onBlur={onBlur}
                                value={value}
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
                              <i
                                className="fa fa-eye-slash"
                                aria-hidden="true"
                              ></i>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="help-text">
                          Lockword must be between 4 and 16 characters.
                        </div>
                      </div>
                    </>
                  ) : null}

                  <div className="col-sm-12">
                    <div className="info-check-wrap-small">
                      <p>
                        *Free Locked chat rooms are limited to maximum of 10
                        users.
                      </p>
                      <p>
                        **The room will be closed automatically if there is no
                        admin.
                      </p>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      {/* <input type="text" className="form-control" placeholder="Admin Code" /> */}
                      <Controller
                        control={control}
                        name="admin_code"
                        render={({ onChange, onBlur, value, name, ref }) => (
                          <FormTextInput
                            name={name + Math.random()}
                            id={"code" + Math.random()}
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
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
                  <div className="col-sm-6">
                    {/* <div className="help-text">Admin Code should be 6 and 12 characters.</div> */}
                  </div>
                  <div className="col-sm-4">
                    <div className="form-group">
                      {/* <input type="text" className="form-control" placeholder="Room's Password" /> */}
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
                  <div className="col-sm-4">
                    <div className="form-group">
                      {/* <input type="text" className="form-control" placeholder="Retype Room's Password" /> */}
                      <Controller
                        control={control}
                        name="c_room_password"
                        render={({ onChange, onBlur, value, name, ref }) => (
                          <FormTextInput
                            // name={name}
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
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
                  <div className="col-sm-4">
                    {/* <div className="help-text mt-0">Room's Password should be 6 and 16 characters.</div> */}
                  </div>
                  <div className="col-sm-12">
                    <div className="info-check-wrap-small">
                      {/* <p>*Room's password is confidential. It will be used to identify you as the room's owner and to be abale to do any modifications to your room's settings in the future.</p> */}
                      <p>
                        **Premium rooms will hold the same capacity locked or
                        unlocked. They are permanent, unless owners decide to
                        close it.
                      </p>
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
                  <div className="col-sm-6">
                    <div className="help-text">Post URLs into the Room</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      {/* <input type="text " className="form-control" placeholder="Filterd Words in Room" /> */}
                      <Controller
                        control={control}
                        name="filter_words"
                        render={({ onChange, onBlur, value, name, ref }) => (
                          <FormTextInput
                            // name={name}
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                            inputRef={ref}
                            type="text"
                            error={errors.filter_words}
                            placeholder="Filterd Words in Room"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 pl-0">
                      <input
                        type="checkbox"
                        name="is_comma_separated"
                        ref={register}
                        className="custom-control-input"
                        id="customCheck-outlinecolor9"
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="customCheck-outlinecolor9"
                      >
                        {/* Use commas to seperate words */}
                        <div className="help-tip">
                          <span title="Use commas to seperate words">
                            <i className="fa fa-info-circle"></i>
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <div className="info-check-wrap-small">
                      <p>
                        *Max 3 words for free rooms and upto 25 words in
                        featured ones.
                      </p>
                    </div>
                  </div>
                  <div className="col-sm-12 msg_drop">
                    <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 pl-0">
                      <input
                        type="checkbox"
                        name="acceptPolicy"
                        className="custom-control-input"
                        id="customCheck-outlinecolor10"
                        ref={register}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="customCheck-outlinecolor10"
                      >
                        I agree,
                        <a href="#" style={{ paddingLeft: "6px" }}>
                          Click here to read more about OutrighTalk room's
                          Administrators Policy
                        </a>
                      </label>
                      {errors &&
                      errors.acceptPolicy &&
                      errors.acceptPolicy.message ? (
                        <>
                          <Form.Control.Feedback type="invalid">
                            {errors.acceptPolicy.message}
                          </Form.Control.Feedback>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="modal-footer">
              <div className="d-flex justify-content-between w-100">
                <div className="left-btns">
                  <a
                    href="#"
                    onClick={(e) => handleReset(e)}
                    className="btn theme-btn btn-default waves-effect"
                  >
                    Reset
                  </a>
                </div>
                <div className="right-btns">
                  <button
                    type="button"
                    className="btn theme-btn btn-danger waves-effect mr-2 "
                    data-dismiss="modal"
                    aria-label="Close"
                    onClick={handleCloseClick}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmitTwo(onFormTwoSubmit)}
                    className="btn theme-btn btn-primary waves-effect"
                  >
                    Create
                  </button>
                </div>
              </div>
            </Modal.Footer>
          </Modal>
     
    </React.Fragment>
  );
}
