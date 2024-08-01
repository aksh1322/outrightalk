import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useUserPreferenceApi } from "src/_common/hooks/actions/userPreference/appUserPreferenceApiHook";
import { useToaster } from "src/_common/hooks/actions/common/appToasterHook";
import CheckboxInput from "src/_common/components/form-elements/checkboxinput/checkboxInput";
import { useAppUserPreferencesSelector } from "src/_common/hooks/selectors/userPreferenceSelector";
import AlertSoundModal from "./modal/alertAndSoundModal";

function AlertSetting() {
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
      contact_comes_online_alert: false,
      contact_goes_offline_alert: false,
      receive_private_message_alert: false,
      receive_call_alert: false,
      always_play_sound: false,
      disable_sounds: false,
      not_play_sound_on_mic_chat_room: false,
      not_play_sound_on_call_pm: false,
      customize_sound_incoming_pm: false,
      customize_sound_incoming_call: false,
      customize_sound_contact_online: false,
      customize_sound_contact_offline: false,
      customize_sound_receive_invitations: false,
      incoming_pm_sound_file: "",
      incoming_call_sound_file: "",
      contact_online_sound_file: "",
      contact_offline_sound_file: "",
      receive_invitations_sound_file: "",
    },
  });
  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector();
  const toast = useToaster();
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [soundType, setSoundType] = useState<string>("");
  const [isApply, setIsApply] = useState<boolean>(false);

  const alertSoundModalOpen = (e: any, type: string) => {
    e.preventDefault();
    setSoundType(type);
    setShowAlertModal(true);
  };

  const alertSoundCloseModal = () => {
    if (showAlertModal) setShowAlertModal(false);
  };

  const onSubmit = (values: any) => {
    let fd = new FormData();
    let params = {
      contact_comes_online_alert: values.contact_comes_online_alert ? 1 : 0,
      contact_goes_offline_alert: values.contact_goes_offline_alert ? 1 : 0,
      receive_private_message_alert: values.receive_private_message_alert
        ? 1
        : 0,
      receive_call_alert: values.receive_call_alert ? 1 : 0,
      always_play_sound: values.always_play_sound ? 1 : 0,
      disable_sounds: values.disable_sounds ? 1 : 0,
      not_play_sound_on_mic_chat_room: values.not_play_sound_on_mic_chat_room
        ? 1
        : 0,
      not_play_sound_on_call_pm: values.not_play_sound_on_call_pm ? 1 : 0,
      customize_sound_incoming_pm: values.customize_sound_incoming_pm ? 1 : 0,
      customize_sound_incoming_call: values.customize_sound_incoming_call
        ? 1
        : 0,
      customize_sound_contact_online: values.customize_sound_contact_online
        ? 1
        : 0,
      customize_sound_contact_offline: values.customize_sound_contact_offline
        ? 1
        : 0,
      customize_sound_receive_invitations:
        values.customize_sound_receive_invitations ? 1 : 0,
      incoming_pm_sound_file:
        values &&
        values.incoming_pm_sound_file &&
        values.incoming_pm_sound_file.length
          ? values.incoming_pm_sound_file[0]
          : "",
      incoming_call_sound_file:
        values &&
        values.incoming_call_sound_file &&
        values.incoming_call_sound_file.length
          ? values.incoming_call_sound_file[0]
          : "",
      contact_online_sound_file:
        values &&
        values.contact_online_sound_file &&
        values.contact_online_sound_file.length
          ? values.contact_online_sound_file[0]
          : "",
      contact_offline_sound_file:
        values &&
        values.contact_offline_sound_file &&
        values.contact_offline_sound_file.length
          ? values.contact_offline_sound_file[0]
          : "",
      receive_invitations_sound_file:
        values &&
        values.receive_invitations_sound_file &&
        values.receive_invitations_sound_file.length
          ? values.receive_invitations_sound_file[0]
          : "",
    };
    for (const [key, value] of Object.entries(params)) {
      fd.append(key, value);
    }
    preference.callSaveUserPreference(
      fd,
      (message: string, resp: any) => {
        toast.success(message);
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const getAlertSettings = () => {
    let params = {
      tab: "alert",
    };
    preference.callGetUserPreference(
      params,
      (message: string, resp: any) => {
        // toast.success(message)
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const applyCustomizedSetting = (isApply: boolean) => {
    if (isApply) {
      setIsApply(isApply);
    }
  };

  useEffect(() => {
    getAlertSettings();
  }, [isApply]);

  useEffect(() => {
    if (preferenceSelector && preferenceSelector.list) {
      for (let i = 0; i < preferenceSelector.list.length; i++) {
        if (preferenceSelector.list[i].field_type_details == "checkbox") {
          let val = parseInt(preferenceSelector.list[i].val) ? true : false;
          setValue(preferenceSelector.list[i].key, val);
        }
      }
    }
  }, [preferenceSelector]);

  const watchFields = watch(["always_play_sound", "disable_sounds"]);

  const handleCheckboxChange = (name: any, value: any) => {
    setValue("always_play_sound", false);
    setValue("disable_sounds", false);
    setValue(name, value);
  };

  return (
    <React.Fragment>
      <div className="right-menu-details dark-box-inner inner_alerts_sec">
        <h3>Alerts &amp; sounds</h3>
        <form
          className="form-horizontal"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="section-alert">
            <span className="mb-3 d-block">Alerts</span>
            <span className="mb-3 d-block" style={{ marginLeft: "10px" }}>
              Send alerts in the following events:
            </span>

            <div className="form-group">
              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                <Controller
                  control={control}
                  name="contact_comes_online_alert"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={onChange}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      id="alert-1"
                      inputRef={ref}
                      label="When a contact comes online"
                      error={errors.contact_comes_online_alert}
                    />
                  )}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                <Controller
                  control={control}
                  name="contact_goes_offline_alert"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={onChange}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      id="alert-2"
                      inputRef={ref}
                      label="When a contact goes offline"
                      error={errors.contact_goes_offline_alert}
                    />
                  )}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                <Controller
                  control={control}
                  name="receive_private_message_alert"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={onChange}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      id="alert-3"
                      inputRef={ref}
                      label="When I receive private message"
                      error={errors.receive_private_message_alert}
                    />
                  )}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                <Controller
                  control={control}
                  name="receive_call_alert"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={onChange}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      id="alert-4"
                      inputRef={ref}
                      label="When I receive a call"
                      error={errors.receive_call_alert}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="section-alert">
            <span className="mb-3 d-block">Sounds</span>
            <div className="form-group">
              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                <Controller
                  control={control}
                  name="always_play_sound"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={() => handleCheckboxChange(name, !value)}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      id="sound-1"
                      inputRef={ref}
                      label="Always play sounds"
                      error={errors.always_play_sound}
                    />
                  )}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                <Controller
                  control={control}
                  name="disable_sounds"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={() => handleCheckboxChange(name, !value)}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      id="sound-2"
                      inputRef={ref}
                      label="Disable all sounds"
                      error={errors.disable_sounds}
                    />
                  )}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                <Controller
                  control={control}
                  name="not_play_sound_on_mic_chat_room"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={onChange}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      id="sound-3"
                      inputRef={ref}
                      label="Do not play sounds when i am on the mic in a Chat Room"
                      error={errors.not_play_sound_on_mic_chat_room}
                    />
                  )}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                <Controller
                  control={control}
                  name="not_play_sound_on_call_pm"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={onChange}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      id="sound-4"
                      inputRef={ref}
                      label="Do not play sounds when i am on a call in Private Message"
                      error={errors.not_play_sound_on_call_pm}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">Customize sounds</div>
            <div className="col-md-6 text-right">
              <button className="clear-chat">Explore</button>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="customize_sound_incoming_pm"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="customize-sound-1"
                        inputRef={ref}
                        label="For incoming PM"
                        error={errors.customize_sound_incoming_pm}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/*
                Upload File Button start from here
              */}

            <div className="col-md-6 dt_btn">
              <div className="form-group">
                <div className="form-group">
                  {/* <span>Choose Incoming Pm Sound File</span>
                  <input className="" type="file"
                    name="incoming_pm_sound_file"
                    placeholder="Select File"
                    capture
                    accept="audio/*"
                    ref={register}
                  /> */}
                  <button
                    type="button"
                    className="btn theme-btn btn-primary mr-2 waves-effect"
                    onClick={(e) =>
                      alertSoundModalOpen(
                        e,
                        "customize_sound_incoming_pm_file_id"
                      )
                    }
                  >
                    ....
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="customize_sound_incoming_call"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="customize-sound-2"
                        inputRef={ref}
                        label="For incoming call"
                        error={errors.customize_sound_incoming_call}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6 dt_btn">
              <div className="form-group">
                <div className="form-group">
                  {/* <span>Choose Incoming Call Sound File</span>
                  <input className="" type="file"
                    name="incoming_call_sound_file"
                    placeholder="Select File"
                    capture
                    accept="audio/*"
                    ref={register}
                  /> */}
                  <button
                    type="button"
                    className="btn theme-btn btn-primary mr-2 waves-effect"
                    onClick={(e) =>
                      alertSoundModalOpen(
                        e,
                        "customize_sound_incoming_call_file_id"
                      )
                    }
                  >
                    ....
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="customize_sound_contact_online"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="customize-sound-3"
                        inputRef={ref}
                        label="When a contact comes online"
                        error={errors.customize_sound_contact_online}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6 dt_btn">
              <div className="form-group">
                <div className="form-group">
                  {/* <span>Choose Contact Online Sound File</span>
                  <input className="" type="file"
                    name="contact_online_sound_file"
                    placeholder="Select File"
                    capture
                    accept="audio/*"
                    ref={register}
                  /> */}
                  <button
                    type="button"
                    className="btn theme-btn btn-primary mr-2 waves-effect"
                    onClick={(e) =>
                      alertSoundModalOpen(
                        e,
                        "customize_sound_contact_online_file_id"
                      )
                    }
                  >
                    ....
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="customize_sound_contact_offline"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="customize-sound-4"
                        inputRef={ref}
                        label="When a contact goes offline"
                        error={errors.customize_sound_contact_offline}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6 dt_btn">
              <div className="form-group">
                <div className="form-group">
                  {/* <span>Choose Contact Offline Sound File</span>
                  <input className="" type="file"
                    name="contact_offline_sound_file"
                    placeholder="Select File"
                    capture
                    accept="audio/*"
                    ref={register}
                  /> */}
                  <button
                    type="button"
                    className="btn theme-btn btn-primary mr-2 waves-effect"
                    onClick={(e) =>
                      alertSoundModalOpen(
                        e,
                        "customize_sound_contact_offline_file_id"
                      )
                    }
                  >
                    ....
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="customize_sound_receive_invitations"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="customize-sound-5"
                        inputRef={ref}
                        label="When i receive invitations"
                        error={errors.customize_sound_receive_invitations}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6 dt_btn">
              <div className="form-group">
                <div className="form-group">
                  {/* <span>Choose Receive Invitations Sound File</span> */}
                  {/* <input className="" type="file"
                    name="receive_invitations_sound_file"
                    placeholder="Select File"
                    capture
                    accept="audio/*"
                    ref={register}
                  /> */}
                  <button
                    type="button"
                    className="btn theme-btn btn-primary mr-2 waves-effect"
                    onClick={(e) =>
                      alertSoundModalOpen(
                        e,
                        "customize_sound_receive_invitations_file_id"
                      )
                    }
                  >
                    ....
                  </button>
                </div>
              </div>
            </div>
          </div>

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

      {showAlertModal ? (
        <AlertSoundModal
          onClose={alertSoundCloseModal}
          shouldShow={showAlertModal}
          type={soundType}
          applySetting={applyCustomizedSetting}
          selectedPreference={
            preferenceSelector &&
            preferenceSelector.list &&
            preferenceSelector.list.length
              ? preferenceSelector.list
              : []
          }
        />
      ) : null}
    </React.Fragment>
  );
}

export default AlertSetting;
