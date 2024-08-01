import React, { useState, useEffect } from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import CheckboxInput from 'src/_common/components/form-elements/checkboxinput/checkboxInput'
import SelectInput from '../../_common/components/form-elements/selectinput/selectInput';
import { useAppUserPreferencesSelector } from 'src/_common/hooks/selectors/userPreferenceSelector';
import { Form } from 'react-bootstrap';
import UserPreferences from 'src/containers/userPreferences';

interface generalSettingFormValues {
  minutes_inactivity: number;
  windows_start_automatic_run_outrigh: boolean,
  outrigh_start_automatic_popup_group_window: boolean,
  sign_in_mode: boolean,
  keep_main_window_on_top: boolean,
  receive_links_private_messages: boolean,
  show_icon_system_tray: boolean,
  set_mode_idle: boolean
}

const GeneralSettingSchema = yup.object().shape({
  // minutes_inactivity: yup
  //   .object()
  //   .shape({
  //     value: yup.string().required('Minutes is required'),
  //   }).nullable()
  //   .required('Minutes is required'),

  minutes_inactivity: yup.number().
    when('set_mode_idle', {
      is: true,
      then: (fieldSchema: any) => fieldSchema.required('Minutes is required'),
    }).nullable()
    .min(1)
})

function GeneralSetting() {
  const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<generalSettingFormValues>({
    resolver: yupResolver(GeneralSettingSchema),
    defaultValues: {
      windows_start_automatic_run_outrigh: false,
      outrigh_start_automatic_popup_group_window: false,
      sign_in_mode: false,
      keep_main_window_on_top: false,
      receive_links_private_messages: false,
      show_icon_system_tray: false,
      set_mode_idle: false,
      minutes_inactivity: 10
    },
  })

  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector();

  console.log("userPreference ==========>>>>>>>>>>>", preferenceSelector);
  
  const toast = useToaster();

  const onSubmit = (values: any) => {
    let params = {
      windows_start_automatic_run_outrigh: values.windows_start_automatic_run_outrigh ? true : false,
      outrigh_start_automatic_popup_group_window: values.outrigh_start_automatic_popup_group_window ? true : false,
      sign_in_mode: values.sign_in_mode ? values.sign_in_mode : null,
      keep_main_window_on_top: values.keep_main_window_on_top ? true : false,
      receive_links_private_messages: values.receive_links_private_messages ? true : false,
      show_icon_system_tray: values.show_icon_system_tray ? true : false,
      set_mode_idle: values.set_mode_idle ? true : false,
      // minutes_inactivity: values.minutes_inactivity && values.minutes_inactivity.value ? parseInt(values.minutes_inactivity.value) : null
      minutes_inactivity: values.minutes_inactivity ? parseInt(values.minutes_inactivity) : null
    }

    preference.callSaveUserPreference(params, (message: string, resp: any) => {
      toast.success(message)
    }, (message: string) => {
      toast.error(message)
    })
  }

  useEffect(() => {
    if (preferenceSelector && preferenceSelector.list) {
      // windows_start_automatic_run_outrigh: false,
      // outrigh_start_automatic_popup_group_window: false,
      // sign_in_mode: false,
      // keep_main_window_on_top: false,
      // receive_links_private_messages: false,
      // show_icon_system_tray: false,
      // set_mode_idle: false,
      // minutes_inactivity: ''

      // var windowsStart = preferenceSelector.list && preferenceSelector.list && preferenceSelector.list.length ? preferenceSelector.list.filter((x: any) => x.key = 'windows_start_automatic_run_outrigh') : [];
      // if (windowsStart && windowsStart.length) {
      //   let value = windowsStart[0].val ? windowsStart[0].val : false
      //   setValue('windows_start_automatic_run_outrigh', value)
      // } else {
      //   setValue('windows_start_automatic_run_outrigh', false)
      // }

      for (let i = 0; i < preferenceSelector.list.length; i++) {

        if (preferenceSelector.list[i].field_type_details == "checkbox") {
          let val = parseInt(preferenceSelector.list[i].val) ? true : false;
          setValue(preferenceSelector.list[i].key, val)
        }

        if (preferenceSelector.list[i].field_type_details == "radio") {
          let val = parseInt(preferenceSelector.list[i].val) ? preferenceSelector.list[i].val : null;
          setValue(preferenceSelector.list[i].key, val)
        }

        if (preferenceSelector.list[i].field_type_details == "select") {
          // let val = parseInt(preferenceSelector.list[i].val) ? { label: preferenceSelector.list[i].val, value: preferenceSelector.list[i].val } : null;
          let val = parseInt(preferenceSelector.list[i].val) ? preferenceSelector.list[i].val : 10;
          setValue(preferenceSelector.list[i].key, val)
        }

      }

    }

  }, [preferenceSelector])


  return (

    <React.Fragment>
      <div className="right-menu-details dark-box-inner all_inner_gen">
        <h3>General Preferences</h3>
        <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* <div className="form-group">
            <label >When Windows starts</label>
            <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox"> */}
              {/* <input type="checkbox" className="custom-control-input" id="customCheck-outlinecolor2" />
              <label className="custom-control-label" htmlFor="customCheck-outlinecolor2">Automatically run OutrighTalk</label> */}
              {/* <Controller
                control={control}
                name="windows_start_automatic_run_outrigh"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <CheckboxInput
                    name={name}
                    onChange={onChange}
                    classname="custom-control-input"
                    onBlur={onBlur}
                    value={value}
                    id="windows-start-automatic-run-outrigh"
                    inputRef={ref}
                    label="Automatically run OutrighTalk"
                    error={errors.windows_start_automatic_run_outrigh}
                  />
                )}
              />
            </div>
          </div> */}
          {/* <div className="form-group">
            <label >When OutrighTalk starts</label>
            <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox"> */}
              {/* <input type="checkbox" className="custom-control-input" id="customCheck-outlinecolor3" />
              <label className="custom-control-label" htmlFor="customCheck-outlinecolor3">Automatically pop up Groups Window</label> */}
              {/* <Controller
                control={control}
                name="outrigh_start_automatic_popup_group_window"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <CheckboxInput
                    name={name}
                    onChange={onChange}
                    classname="custom-control-input"
                    onBlur={onBlur}
                    value={value}
                    id="outrigh-start-automatic-popup-group-window"
                    inputRef={ref}
                    disabled={true}
                    label="Automatically pop up Groups Window"
                    error={errors.outrigh_start_automatic_popup_group_window}
                  />
                )}
              />
            </div>
          </div> */}
          <div className="form-group">
            <div className="form-group">
              <label>Sign in using always this mode</label>
              <div className="d-flex">
                {preferenceSelector && preferenceSelector.list && preferenceSelector.list.length ? preferenceSelector.list.filter((x: any) => x.key == 'sign_in_mode' && x.field_type_details == 'radio').map(((field: any) =>
                  field && field.field_options && field.field_options.length ? field.field_options.map((op: any, index: number) =>
                    <div key={index} className="custom-control custom-radio custom-checkbox-outline theme-custom-checkbox mr-3">
                      <input type="radio" name={field.key} className="custom-control-input" id={field.key + '-' + op.key} value={op.key} ref={register} />
                      <label className="custom-control-label" htmlFor={field.key + '-' + op.key}>{op.val}</label>
                    </div>) : <span className="no-option">no option found</span>
                )) : null}
              </div>
            </div>
            {/* <hr className="light-hr" /> */}
            {/* <div className="form-group">
              <label>Main Window</label>
              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox"> */}
                {/* <input type="checkbox" className="custom-control-input" id="customCheck-outlinecolor6" defaultChecked />
                <label className="custom-control-label" htmlFor="customCheck-outlinecolor6">Keep main window always on top</label> */}
                {/* <Controller
                  control={control}
                  name="keep_main_window_on_top"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={onChange}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      id="keep-main-window-on-top"
                      inputRef={ref}
                      disabled={true}
                      label="Keep main window always on top"
                      error={errors.keep_main_window_on_top}
                    />
                  )}
                />
              </div>
            </div> */}
            <hr className="light-hr" />
            <div className="form-group">
              <label>Miscellaneous</label>
              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                {/* <input type="checkbox" className="custom-control-input" id="customCheck-outlinecolor7" />
                <label className="custom-control-label" htmlFor="customCheck-outlinecolor7">Permit to recieve links in my private messages</label> */}
                <Controller
                  control={control}
                  name="receive_links_private_messages"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={onChange}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      id="receive-links-private-messages"
                      inputRef={ref}
                      label="Permit to receive links in my private messages"
                      error={errors.receive_links_private_messages}
                    />
                  )}
                />
              </div>
            </div>
            {/* <div className="form-group">
              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox"> */}
                {/* <input type="checkbox" className="custom-control-input" id="customCheck-outlinecolor8" defaultChecked />
                <label className="custom-control-label" htmlFor="customCheck-outlinecolor8">Show my icon in the system tray</label> */}

                {/* <Controller
                  control={control}
                  name="show_icon_system_tray"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={onChange}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      id="show-icon-system-tray"
                      inputRef={ref}
                      label="Show my icon in the system tray"
                      error={errors.show_icon_system_tray}
                    />
                  )}
                />
              </div>
            </div> */}
            <div className="form-group d-flex justify-content-start align-items-center">
              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                {/* <input type="checkbox" className="custom-control-input" id="customCheck-outlinecolor9" />
                <label className="custom-control-label" htmlFor="customCheck-outlinecolor9">Set my mode to "idle" after</label> */}
                <Controller
                  control={control}
                  name="set_mode_idle"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={onChange}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      id="set-mode-idle"
                      inputRef={ref}
                      label='Set my mode to "idle" after'
                      error={errors.set_mode_idle}
                    />
                  )}
                />
              </div>
              <div className="col-md-2">
                {/* {preferenceSelector && preferenceSelector.list && preferenceSelector.list.length ? preferenceSelector.list.filter((x: any) => x.key == 'minutes_inactivity' && x.field_type_details == 'select').map(((field: any, index: number) =>
                  <React.Fragment key={index}>
                    <Controller
                      control={control}
                      name="minutes_inactivity"
                      render={({ onChange, onBlur, value, name, ref }) => (
                        <SelectInput
                          // name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          inputRef={ref}
                          dark={true}
                          options={field && field.field_options && field.field_options.length ? field.field_options.map((c: any) => ({
                            value: String(c.key),
                            label: c.val,
                          })) : []}
                          error={errors.minutes_inactivity}
                          placeholder="Min"
                        />
                      )}
                    />
                  </React.Fragment>)) : 'No type or key match'} */}
                <Controller
                  control={control}
                  name="minutes_inactivity"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <FormTextInput
                      // name={name}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      inputRef={ref}
                      type="text"
                      // error={errors.minutes_inactivity}
                      placeholder="Minutes Activity"
                    />
                  )}
                />
                {
                  errors && errors.minutes_inactivity && errors.minutes_inactivity.message ? <>
                    <Form.Control.Feedback type="invalid" >
                      {
                        errors.minutes_inactivity.type === "min" ?
                          "Minutes should be greater than 0" : "Minutes should be number"
                      }
                    </Form.Control.Feedback>
                  </> : null
                }
              </div>
              <div className="col-md-4">
                <span>
                  minutes of inactivity
                </span>
              </div>
            </div>
            <div className="d-flex mt-5">
              <button type="submit" className="btn theme-btn btn-primary mr-2 waves-effect">Apply</button>
              {/* <button type="button" className="btn theme-btn btn-default waves-effect">Cancel</button> */}
            </div>
          </div>
        </form>
      </div>
    </React.Fragment >
  )
}

export default GeneralSetting
