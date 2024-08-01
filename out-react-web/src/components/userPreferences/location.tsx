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

function LocationSetting() {

  const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<any>({
    // resolver: yupResolver(FileSavingSettingSchema),
    defaultValues: {
      share_location: false,
    },
  })
  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector()
  const toast = useToaster()

  const onSubmit = (values: any) => {
    let params = {
      share_location: values.share_location ? 1 : 0,
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
      <div className="right-menu-details dark-box-inner">
        <h3>Location</h3>
        <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="setting-heading">
            Location feature will help you to find nearby users and make more friends.

          </div>
          {preferenceSelector && preferenceSelector.list && preferenceSelector.list.length ? preferenceSelector.list.map((field: any, index: number) =>
            field.field_type_details === 'checkbox' ?
              <div className="form-group" key={index}>
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox location_left">
                  <Controller
                    control={control}
                    name={field.key}
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id={field.key.replace(/_/g, '-')}
                        inputRef={ref}
                        label={field.field_label}
                        error={errors[field.key]}
                      />
                    )}
                  />
                </div>
              </div>
              : null
          ) : null}
          <div className="setting-lower-msg">
            By enabling your location you can find strangers nearby and at the same time you permit others to find you .You can keep it disabled if you don't want them to track your location.
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

export default LocationSetting
