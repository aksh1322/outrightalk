import React, { useState, useEffect } from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import CheckboxInput from 'src/_common/components/form-elements/checkboxinput/checkboxInput'
import { useAppUserPreferencesSelector } from 'src/_common/hooks/selectors/userPreferenceSelector';
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";

// const FileSavingSettingSchema = yup.object().shape({

// })

function BannerAdsSetting() {

  const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<any>({
    // resolver: yupResolver(FileSavingSettingSchema),
    defaultValues: {
      show_banner_ads: false,
    },
  })
  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector()
  const toast = useToaster()

  const onSubmit = (values: any) => {
    let params = {
      show_banner_ads: values.show_banner_ads ? 1 : 0,
    }
    preference.callSaveUserPreference(params, (message: string, resp: any) => {
      toast.success(message)
    }, (message: string) => {
      toast.error(message)
    })
  }

  const userSelector = useAppUserDetailsSelector()
  const [isSubscribed,setIsSubscribed]= useState<boolean>(true)



  useEffect(() => { 
    if(userSelector && userSelector.is_subscribed == null){
      setIsSubscribed(false)
    }
    else{
      setIsSubscribed(true)  
    }
  },[])

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
        <h3>Banner Ads</h3>
        <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                        disabled={!isSubscribed}
                        id={field.key.replace(/_/g, '-')}
                        inputRef={ref}
                        label={field.field_label}
                        error={errors[field.key]}
                      />
                    )}
                  />
                </div>
              </div> :
              field.field_type_details === 'radio' ?
                <div key={index} className="form-group">
                  <label>{field.field_label}</label>
                  <div className="d-flex">
                    {
                      field && field.field_options && field.field_options.length ? field.field_options.map((op: any, ind: number) =>
                        <div key={ind} className="custom-control custom-radio custom-checkbox-outline theme-custom-checkbox mr-3">
                          <input type="radio" name={field.key} className="custom-control-input" id={field.key + '-' + op.key} value={op.key} ref={register} />
                          <label className="custom-control-label" htmlFor={field.key + '-' + op.key}>{op.val}</label>
                        </div>) : <span className="no-option">no option found</span>
                    }
                  </div>
                </div>
                : null
          ) : <span>No Setting Found</span>}
          <div className="setting-lower-msg">
            OutrighTalk Banner ads may interest you, feel free to check and discover how effective they can be.
          </div>
          <br />
          <div className="setting-lower-msg">
            {/* In case you want to hide them, we invite you to upgrade,paid subscribers are able to do that. */}
            You can upgrade if you want to hide them
          </div>
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

export default BannerAdsSetting
