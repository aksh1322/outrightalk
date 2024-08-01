import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
import { useUserPreferenceApi } from "src/_common/hooks/actions/userPreference/appUserPreferenceApiHook";
import { useToaster } from "src/_common/hooks/actions/common/appToasterHook";
import CheckboxInput from "src/_common/components/form-elements/checkboxinput/checkboxInput";
import { useAppUserPreferencesSelector } from "src/_common/hooks/selectors/userPreferenceSelector";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";
// const FileSavingSettingSchema = yup.object().shape({

// })

function RoomSetting() {
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
      popup_new_window_received_pm: false,
      // convert_text_to_emoticon_room: false,
      // convert_text_to_emoticon_pm: false,
      // show_emoticon_room: false,
      // show_emoticon_pm: false,
      show_room_notification: false,
      show_timestamp_chat_room: false,
      show_timestamp_pm: false,
      // pm_window_outrightalk_notifier_top: false,
      // chat_room_windows_top: false,
      not_display_profile_pic_pm: false,
      notify_users_join_exit_room: false,
      notify_users_start_stops_webcam: false,
      disable_dig_sound: false,
      enable_spelling_checker_pm: false,
      enable_real_time_translator_pm: false,
      show_typing_pm: false,
      reset_to_default_setting: false,
      pressing_enter_key: "",
    },
  });
  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector();
  const toast = useToaster();
  const userSelector = useAppUserDetailsSelector();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true);

  const onSubmit = (values: any) => {
    let params = {
      popup_new_window_received_pm: values.popup_new_window_received_pm ? 1 : 0,
      // convert_text_to_emoticon_room: values.convert_text_to_emoticon_room
      //   ? 1
      //   : 0,
      // convert_text_to_emoticon_pm: values.convert_text_to_emoticon_pm ? 1 : 0,
      // show_emoticon_room: values.show_emoticon_room ? 1 : 0,
      // show_emoticon_pm: values.show_emoticon_pm ? 1 : 0,
      show_room_notification: values.show_room_notification ? 1 : 0,
      show_timestamp_chat_room: values.show_timestamp_chat_room ? 1 : 0,
      show_timestamp_pm: values.show_timestamp_pm ? 1 : 0,
      // pm_window_outrightalk_notifier_top:
      //   values.pm_window_outrightalk_notifier_top ? 1 : 0,
      // chat_room_windows_top: values.chat_room_windows_top ? 1 : 0,
      not_display_profile_pic_pm: values.not_display_profile_pic_pm ? 1 : 0,
      notify_users_join_exit_room: values.notify_users_join_exit_room ? 1 : 0,
      notify_users_start_stops_webcam: values.notify_users_start_stops_webcam ? 1 : 0,
      disable_dig_sound: values.disable_dig_sound ? 1 : 0,
      enable_spelling_checker_pm: values.enable_spelling_checker_pm ? 1 : 0,
      enable_real_time_translator_pm: values.enable_real_time_translator_pm ? 1 : 0,
      show_typing_pm: values.show_typing_pm ? 1 : 0,
      reset_to_default_settings: values.reset_to_default_setting ? 1 : 0,
      pressing_enter_key: values.pressing_enter_key
        ? values.pressing_enter_key
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

  useEffect(() => {
    if (userSelector && userSelector.is_subscribed == null) {
      setIsSubscribed(false);
    } else {
      setIsSubscribed(true);
    }
  }, []);

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

  return (
    <React.Fragment>
      <div className="right-menu-details dark-box-inner inner_room">
        <h3> Room &amp; PM Preferences</h3>
        <form
          className="form-horizontal"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="row_left row">
            <div className="col-6">
              <h2>Room</h2>
              <div className="form-group">
                {/* <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="convert_text_to_emoticon_room"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="room-setting-4"
                        inputRef={ref}
                        label="Always convert text to Emoticons in rooms"
                        error={errors.convert_text_to_emoticon_room}
                      />
                    )}
                  />
                </div> */}
              </div>
              <div className="form-group">
                {/* <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="show_emoticon_room"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="room-setting-6"
                        inputRef={ref}
                        label="Always show the Emoticons in Rooms"
                        error={errors.show_emoticon_room}
                      />
                    )}
                  />
                </div> */}
              </div>

              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="show_room_notification"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="room-setting-8"
                        inputRef={ref}
                        label="Show rooms notifications"
                        error={errors.show_room_notification}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="show_timestamp_chat_room"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="room-setting-9"
                        inputRef={ref}
                        label="Show timestamp in chat rooms"
                        error={errors.show_timestamp_chat_room}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="form-group">
                {/* <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="chat_room_windows_top"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="room-setting-12"
                        inputRef={ref}
                        disabled={true}
                        label="Keep chat rooms windows on top"
                        error={errors.chat_room_windows_top}
                      />
                    )}
                  />
                </div> */}
              </div>

              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="notify_users_join_exit_room"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="room-setting-14"
                        inputRef={ref}
                        label="Notify me when users join and exit the room"
                        error={errors.notify_users_join_exit_room}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="notify_users_start_stops_webcam"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="room-setting-16"
                        inputRef={ref}
                        label="Notify me when users start and stops webcam"
                        error={errors.notify_users_start_stops_room}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="disable_dig_sound"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="room-setting-18"
                        inputRef={ref}
                        label="Disable Dig Sound"
                        error={errors.disable_dig_sound}
                      />
                    )}
                  />
                </div>
              </div>

            </div>
            <div className="col-6">
              <h2>PM</h2>
              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="popup_new_window_received_pm"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="popup-new-window-received-pm"
                        inputRef={ref}
                        disabled={true}
                        label="Pop up in a new window each received PM"
                        error={errors.popup_new_window_received_pm}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="form-group">
                {/* <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="convert_text_to_emoticon_pm"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="room-setting-5"
                        inputRef={ref}
                        label="Always convert text to Emoticons in PMs"
                        error={errors.convert_text_to_emoticon_pm}
                      />
                    )}
                  />
                </div> */}
              </div>

              <div className="form-group">
                {/* <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="show_emoticon_pm"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="room-setting-7"
                        inputRef={ref}
                        label="Always show the Emoticons in PMs"
                        error={errors.show_emoticon_pm}
                      />
                    )}
                  />
                </div> */}
              </div>

              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="show_timestamp_pm"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="room-setting-10"
                        inputRef={ref}
                        label="Show timestamp in PM"
                        error={errors.show_timestamp_pm}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="not_display_profile_pic_pm"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="room-setting-13"
                        inputRef={ref}
                        label="Do Not display Profile's pictures in PMs"
                        error={errors.not_display_profile_pic_pm}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="enable_spelling_checker_pm"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="room-setting-15"
                        inputRef={ref}
                        // disabled={!isSubscribed}
                        label="Enable Spelling Checker feature in PMs window"
                        error={errors.enable_spelling_checker_pm}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="enable_real_time_translator_pm"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="room-setting-16"
                        inputRef={ref}
                        // disabled={!isSubscribed}
                        label="Enable Real-Time Translator in PMs window"
                        error={errors.enable_real_time_translator_pm}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="form-group">
                {/* <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="pm_window_outrightalk_notifier_top"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="room-setting-11"
                        inputRef={ref}
                        disabled={true}
                        label="Keep PMs windows and OutrighTalk Notifier on top"
                        error={errors.pm_window_outrightalk_notifier_top}
                      />
                    )}
                  />
                </div> */}
              </div>

              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="show_typing_pm"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="room-setting-17"
                        inputRef={ref}
                        label="Show when typing in PMs"
                        error={errors.show_typing_pm}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="form-group mb-4">
            <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
              <Controller
                control={control}
                name="reset_to_default_setting"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <CheckboxInput
                    name={name}
                    onChange={onChange}
                    classname="custom-control-input"
                    onBlur={onBlur}
                    value={value}
                    id="reset-to-default-setting"
                    inputRef={ref}
                    label="Reset to default setting"
                    error={errors.reset_to_default_setting}
                  />
                )}
              />
            </div>
          </div>

          {preferenceSelector &&
          preferenceSelector.list &&
          preferenceSelector.list.length
            ? preferenceSelector.list.map((field: any, index: number) =>
                field.field_type_details === "radio" ? (
                  <div key={index} className="form-group">
                    <label>{field.field_label}</label>
                    <div className="d-flex">
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
            : null}
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
    </React.Fragment>
  );
}

export default RoomSetting;
