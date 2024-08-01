import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useUserPreferenceApi } from "src/_common/hooks/actions/userPreference/appUserPreferenceApiHook";
import { useToaster } from "src/_common/hooks/actions/common/appToasterHook";
import CheckboxInput from "src/_common/components/form-elements/checkboxinput/checkboxInput";
import { useAppUserPreferencesSelector } from "src/_common/hooks/selectors/userPreferenceSelector";
import SweetAlert from "react-bootstrap-sweetalert";

// const FileSavingSettingSchema = yup.object().shape({

// })

function ChatSetting() {
  const {
    watch,
    register,
    control,
    setValue,
    getValues,
    reset,
    handleSubmit,
    errors,
  } = useForm<any>({
    // resolver: yupResolver(FileSavingSettingSchema),
    defaultValues: {
      delete_chat_history_pm_window_closed: false,
      save_chat_history: "",
    },
  });

  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector();
  const toast = useToaster();
  const [clearChatHistoryAlert, setClearChatHistoryAlert] =
    useState<any>(false);

  const onSubmit = (values: any) => {
    let params = {
      delete_chat_history_pm_window_closed:
        values.delete_chat_history_pm_window_closed ? 1 : 0,
      save_chat_history: values.save_chat_history
        ? values.save_chat_history
        : null,
    };
    preference.callSaveUserPreference(
      params,
      (message: string, resp: any) => {
        toast.success(message);
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const hideAlert = () => {
    setClearChatHistoryAlert(false);
  };

  const handleClearChatHistory = () => {
    setClearChatHistoryAlert(true);
  };

  const confirmClearChatHistory = () => {
    preference.callClearAllChatsForMe(
      {}, // Assuming the function doesn't need any specific data
      (message: string, resp: any) => {
        if (resp) {
          toast.success(message);
          hideAlert();
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  useEffect(() => {
    if (preferenceSelector && preferenceSelector.list) {
      for (let i = 0; i < preferenceSelector.list.length; i++) {
        if (preferenceSelector.list[i].field_type_details == "checkbox") {
          let val = parseInt(preferenceSelector.list[i].val) ? true : false;
          setValue(preferenceSelector.list[i].key, val);
        }

        if (preferenceSelector.list[i].field_type_details == "radio") {
          let val = parseInt(preferenceSelector.list[i].val)
            ? preferenceSelector.list[i].val
            : null;
          setValue(preferenceSelector.list[i].key, val);
        }
      }
    }
  }, [preferenceSelector]);

  // const handleClearChatHistory = () => {
  //   preference.callClearAllChatsForMe({}, (message: string, resp: any) => {
  //     toast.success("Chat history cleared successfully");
  //   }, (message: string) => {
  //     toast.error("Failed to clear chat history");
  //   });
  // };

  return (
    <React.Fragment>
      <div className="right-menu-details dark-box-inner inner_privacy">
        <h3>Chat History</h3>
        <form
          className="form-horizontal"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {/* {preferenceSelector &&
          preferenceSelector.list &&
          preferenceSelector.list.length
            ? preferenceSelector.list.map((field: any, index: number) =>
                field.field_type_details === "radio" ? (
                  <div key={index} className="form-group">
                    <label>{field.field_label}</label>
                    <div className="d-flex all_priv">
                      {field &&
                      field.field_options &&
                      field.field_options.length ? (
                        field.field_options.map((op: any, ind: number) => (
                          <div
                            key={ind}
                            className="custom-control custom-radio custom-checkbox-outline theme-custom-checkbox mr-3"
                          >
                            <input
                              type="radio"
                              name={field.key}
                              className="custom-control-input"
                              id={field.key + "-" + op.key}
                              value={op.key}
                              ref={register}
                            />
                            <label
                              className="custom-control-label"
                              htmlFor={field.key + "-" + op.key}
                            >
                              {op.val}
                            </label>
                          </div>
                        ))
                      ) : (
                        <span className="no-option">no option found</span>
                      )}
                    </div>
                  </div>
                ) : null
              )
            : null} */}
          <hr />
          <div className="form-group">
            <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
              <Controller
                control={control}
                name="delete_chat_history_pm_window_closed"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <CheckboxInput
                    name={name}
                    onChange={onChange}
                    classname="custom-control-input"
                    onBlur={onBlur}
                    value={value}
                    id="chat-setting-1"
                    inputRef={ref}
                    label="Always delete Chat History once PMs windows are closed."
                    error={errors.delete_chat_history_pm_window_closed}
                  />
                )}
              />
            </div>
          </div>

          <button
            type="button"
            className="clear-chat"
            onClick={handleClearChatHistory}
          >
            Clear chat history
          </button>

          <div className="form-group">
            <div className="d-flex mt-5">
              <button
                type="submit"
                className="btn theme-btn btn-primary mr-2 waves-effect"
              >
                Apply
              </button>
              {/* <button type="button" className="btn theme-btn btn-default waves-effect">Cancel</button> */}
            </div>
          </div>
        </form>
      </div>

      {clearChatHistoryAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes"
          cancelBtnText="No"
          cancelBtnBsStyle="danger"
          confirmBtnBsStyle="success"
          allowEscape={false}
          closeOnClickOutside={false}
          title="Clear Chat History"
          onConfirm={confirmClearChatHistory}
          onCancel={hideAlert}
          focusCancelBtn={true}
        >
          Are you sure you want to clear chat history?
        </SweetAlert>
      )}
    </React.Fragment>
  );
}

export default ChatSetting;
