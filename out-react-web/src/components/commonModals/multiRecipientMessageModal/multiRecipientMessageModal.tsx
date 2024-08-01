import React, { useState, useEffect, useRef } from "react";
import { useHistory, useParams } from "react-router";
import { Modal } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";
import { useAppUserAction } from "src/_common/hooks/actions/user/appUserActionHook";
import { useUserApi } from "src/_common/hooks/actions/user/appUserApiHook";
import FormTextAreaInput from "src/_common/components/form-elements/textarea/textareaInput";
import { OptionValue } from "src/_common/interfaces/common";
import SelectInput from "src/_common/components/form-elements/selectinput/selectInput";
import { CRYPTO_SECRET_KEY, MULTI_RECIPIENT_MESSGE_OPTION } from "src/_config";
import { useAppLeftMenuItemListSelector } from "src/_common/hooks/selectors/groupCategorySelector";
import { useSendBird } from "src/hooks";
import { usePmWindowApi } from "src/_common/hooks/actions/pmWindow/appPmWindowApiHook";
const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);
interface MultiRecipientMessageModalProps {
  shouldShow: boolean;
}

interface MultiRecipientMessageFormValues {
  message: string;
  options: OptionValue | undefined | any;
}

const messageSchema = yup.object().shape({
  message: yup.string().required("Message is required"),
  // options: yup
  //     .object()
});

export default function MultiRecipientMessageModal({
  shouldShow,
}: MultiRecipientMessageModalProps) {
  const { register, control, setValue, handleSubmit, errors } =
    useForm<MultiRecipientMessageFormValues>({
      resolver: yupResolver(messageSchema),
      defaultValues: {
        message: "",
        options: undefined,
      },
    });
  const pmWindowApi = usePmWindowApi();
  const userAction = useAppUserAction();
  const userApi = useUserApi();
  const userSelector = useAppUserDetailsSelector();
  const leftMenuItemDetails = useAppLeftMenuItemListSelector();
  const [checkedValues, setCheckedValues] = useState<number[]>([]);
  const [listOfUsers, setListOfUsers] = useState<any[]>([]);
  const { sendMessageInRoom, populateCurrentRoomChat } = useSendBird();

  useEffect(() => {
    populateCurrentRoomChat();
  }, []);

  const onCheckSelectAll = (evt: any) => {
    let tempCheckedValues = [...checkedValues];
    if (evt) {
      if (listOfUsers && listOfUsers.length) {
        for (let k = 0; k < listOfUsers.length; k++) {
          let exist = tempCheckedValues.indexOf(listOfUsers[k].contact_user_id);
          if (exist == -1) {
            tempCheckedValues.push(listOfUsers[k].contact_user_id);
          }
        }
      }
      setCheckedValues(tempCheckedValues);
    } else {
      if (listOfUsers && listOfUsers.length) {
        for (let k = 0; k < listOfUsers.length; k++) {
          let exist = tempCheckedValues.indexOf(listOfUsers[k].contact_user_id);
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
    if (listOfUsers && listOfUsers.length) {
      for (let k = 0; k < listOfUsers.length; k++) {
        let exist = tempCheckedValues.indexOf(listOfUsers[k].contact_user_id);
        if (exist == -1) {
          return false;
        }
      }
    }
    return true;
  };

  const handleSelect = (checkedName: number) => {
    const newNames = checkedValues?.includes(checkedName)
      ? checkedValues?.filter((name) => name !== checkedName)
      : [...(checkedValues ?? []), checkedName];
    setCheckedValues(newNames);
    return newNames;
  };

  const checkDisableElement = (ele: any) => {
    const pmsSetting = ele.find(
      (ele: any) => ele.key == "pms_calls_othr_activity_frm_contact_list"
    );
    return pmsSetting ? (pmsSetting.val == 1 ? true : false) : false;
  };
  const sendMsg = async (res: any, mess: string) => {
    res.map(async (x: any) => {
      localStorage.setItem(
        "CURRENT_ROOM_URL",
        JSON.stringify(x?.send_bird_channel_url)
      );
      const message = `<span style="font-size: 13px;color: #162334;">${mess}</span>`;
      const message_id: any = await sendMessageInRoom(message, "chat");
      if (message_id) {
        var params = {
          pm_id: x?.pm_id,
          chat_body: message,
          message_id: message_id,
          type: "normal", 
        };

        //reset content editable div
        pmWindowApi.callSendPmWindowChat(
          params,
          (message: string, resp: any) => {},
          (message: string) => {
            toast.error(message);
          }
        );
      }
    });
  };
  const onSubmit = (values: MultiRecipientMessageFormValues) => {
    // checkedValues.map((userIds) => {
    //   const params = {
    //     user_id: userIds,
    //   };
    //   pmWindowApi.callSendPms(
    //     params,
    //     async (message: string, resp: any) => {
    //       if (resp) {
    //         userAction.showMultiRecipientMessageModal(false);
    //         await sendMsg(resp, values.message);
    //         toast.success("message has been sent successfully");
    //       } else {
    //         toast.error(message);
    //       }
    //     },
    //     (message: string, resp: any) => {
    //       toast.error(message);
    //     }
    //   );
    // });

    const params = {
      chat_body: values.message,
      user_id: checkedValues,
    };
    userApi.callSendMultiRecipientMessage(
      params,
      async (message: string, resp: any) => {
        if (resp) {
          userAction.showMultiRecipientMessageModal(false);
          await sendMsg(resp, values.message);
          toast.success("message has been sent successfully");
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handleOnClose = () => {
    userAction.showMultiRecipientMessageModal(false);
  };

  const handleOptionsChange = (e: { label: string; value: string }) => {
    let type = e && e.value;
    switch (type) {
      case "online":
        setListOfUsers(leftMenuItemDetails.online_users);
        break;
      case "offline":
        setListOfUsers(leftMenuItemDetails.offline_users);
        break;
      case "favourite":
        setListOfUsers(leftMenuItemDetails.favourite_contact);
        break;
      case "all":
        setListOfUsers([
          ...leftMenuItemDetails.online_users,
          ...leftMenuItemDetails.offline_users,
        ]);
        break;
      default:
        setListOfUsers([]);
        break;
    }
  };

  useEffect(() => {}, []);

  return (
    <React.Fragment>
      <Modal
        show={shouldShow}
        backdrop="static"
        onHide={() => handleOnClose()}
        keyboard={false}
        className="multi-recipient-message theme-custom-modal"
        size="lg"
        centered
        contentClassName="custom-modal"
      >
        <Modal.Header>
          <div className="modal-logo d-flex justify-content-center w-100">
            <h2>Multi-recipients message</h2>
            <button type="button" className="close" onClick={handleOnClose}>
              <i className="modal-close"></i>
            </button>
          </div>
        </Modal.Header>
        <Modal.Body bsPrefix={"multi-recipient-message"}>
          <div className="modal-body pl-0 pr-0">
            <div className="manage-video-message-panel">
              <div className="row">
                <div className="col-sm-6">
                  <h4>Message</h4>
                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="form-group">
                      <Controller
                        control={control}
                        name="message"
                        render={({ onChange, onBlur, value, name, ref }) => (
                          <FormTextAreaInput
                            name={name}
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                            inputRef={ref}
                            rows={4}
                            type="text"
                            error={errors.message}
                            placeholder="Type ..."
                          />
                        )}
                      />
                    </div>
                    <div className="d-flex">
                      <button
                        type="submit"
                        className="btn theme-btn btn-primary mr-2 waves-effect"
                        disabled={checkedValues.length ? false : true}
                      >
                        Send
                      </button>
                      <button
                        type="button"
                        className="btn theme-btn btn-default waves-effect"
                        onClick={() => handleOnClose()}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <Controller
                      control={control}
                      name="options"
                      render={({ onChange, onBlur, value, name, ref }) => (
                        <SelectInput
                          onChange={(e) => {
                            onChange(e);
                            handleOptionsChange(e);
                          }}
                          onBlur={onBlur}
                          value={value}
                          inputRef={ref}
                          dark={true}
                          options={MULTI_RECIPIENT_MESSGE_OPTION}
                          error={errors.options}
                          placeholder="Select"
                        />
                      )}
                    />
                  </div>
                  {listOfUsers && listOfUsers.length ? (
                    <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="customCheck-outlinecolor150"
                        checked={selectMaster()}
                        onChange={(evt) => {
                          onCheckSelectAll(evt.target.checked);
                        }}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="customCheck-outlinecolor150"
                      >
                        Recipients
                      </label>
                    </div>
                  ) : null}
                  <div className="list-users-wrap">
                    <ul>
                      {listOfUsers && listOfUsers.length ? (
                        listOfUsers.map((x: any, index: number) => (
                          <li key={x.contact_user.id}>
                            <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                id={"contactList" + x.contact_user.id}
                                checked={checkedValues.includes(
                                  x.contact_user.id
                                )}
                                disabled={checkDisableElement(
                                  x.privacy_setting
                                )}
                                onChange={() => handleSelect(x.contact_user.id)}
                              />
                              <label
                                className="custom-control-label"
                                htmlFor={"contactList" + x.contact_user.id}
                              >
                                {x.customize_nickname
                                  ? x.customize_nickname.nickname
                                  : x.contact_user.username}
                              </label>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li>
                          <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                            No option selected
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}
