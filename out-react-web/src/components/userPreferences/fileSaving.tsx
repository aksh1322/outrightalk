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

function FileSavingSetting() {

  const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<any>({
    // resolver: yupResolver(FileSavingSettingSchema),
    defaultValues: {
      receive_file_open_automatically: false,
    },
  })
  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector()
  const toast = useToaster()

  const onSubmit = (values: any) => {
    let params = {
      receive_file_open_automatically: values.receive_file_open_automatically ? 1 : 0,
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
      <div className="right-menu-details dark-box-inner all_file_save">
        <h3>File Saving</h3>
        <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>

          <div className="form-group">

            <span>Default Folder Where received files will be saved:</span>

            <button type="button" className="btn-change">Change</button>
          </div>


          {preferenceSelector && preferenceSelector.list && preferenceSelector.list.length ? preferenceSelector.list.map((field: any, index: number) =>
            field.field_type_details === 'checkbox' ?
              <div className="form-group" key={index}>
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
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

          <div className="form-group">
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

export default FileSavingSetting
