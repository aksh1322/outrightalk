import React, { useState, useEffect } from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import CheckboxInput from 'src/_common/components/form-elements/checkboxinput/checkboxInput'
import { useAppUserPreferencesSelector } from 'src/_common/hooks/selectors/userPreferenceSelector';

// const FileSavingSettingSchema = yup.object().shape({

// })

function ConnectionSetting() {

  const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<any>({
    // resolver: yupResolver(FileSavingSettingSchema),
    defaultValues: {
      allow_automatic_configuration: false,

    },
  })
  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector()
  const toast = useToaster()

  const onSubmit = (values: any) => {
    let params = {
      allow_automatic_configuration: values.allow_automatic_configuration ? 1 : 0,

    }
    preference.callSaveUserPreference(params, (message: string, resp: any) => {
      toast.success(message)
    }, (message: string) => {
      toast.error(message)
    })

  }

  useEffect(() => {
    if (preferenceSelector && preferenceSelector.list) {
      for (let i = 0; i < preferenceSelector.list.length; i++) {
        if (preferenceSelector.list[i].field_type_details == "checkbox") {
          let val = parseInt(preferenceSelector.list[i].val) ? true : false;
          setValue(preferenceSelector.list[i].key, val)
        }
        if (preferenceSelector.list[i].field_type_details == "radio") {
          let val = parseInt(preferenceSelector.list[i].val) ? preferenceSelector.list[i].val : null;
          setValue(preferenceSelector.list[i].key, val)
        }
      }
    }
  }, [preferenceSelector])

  return (
    <React.Fragment>
      <div className="right-menu-details dark-box-inner inner_parental_sec">
        <h3>Connection</h3>
        <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>
          <span>
            it should contain PING test, and check how that could effect the quality of the sound
            Automatic configuration</span>
          <div className="form-group">
            <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
              <Controller
                control={control}
                name="allow_automatic_configuration"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <CheckboxInput
                    name={name}
                    onChange={onChange}
                    classname="custom-control-input"
                    onBlur={onBlur}
                    value={value}
                    id="connection-1"
                    inputRef={ref}
                    label="Allow OutrighTalk to configure your connection settings."
                    error={errors.allow_automatic_configuration}
                  />
                )}
              />
            </div>
          </div>
          <div className="setting-lower-msg">

            {/* Remember this feature can be enabled and disabled on the same computer by using Parental control password to start a different session. */}
          </div>

          <div className="form-group">
            <div className="d-flex mt-4">
              <button type="submit" className="btn theme-btn btn-primary mr-2 waves-effect">Apply</button>
              {/* <button type="button" className="btn theme-btn btn-default waves-effect">Cancel</button> */}
            </div>
          </div>
        </form>
      </div>
    </React.Fragment >
  )
}

export default ConnectionSetting
