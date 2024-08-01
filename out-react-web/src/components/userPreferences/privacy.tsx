import React, { useState, useEffect } from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import CheckboxInput from 'src/_common/components/form-elements/checkboxinput/checkboxInput'
import { useAppUserPreferencesSelector } from 'src/_common/hooks/selectors/userPreferenceSelector';
import { updateAmount } from 'src/_common/hooks/actions/common/appAmountHook';
import { useDispatch } from 'react-redux';
import { useAppAmountSelector } from "src/_common/hooks/selectors/groupCategorySelector";

function PrivacySetting() {
  const dispatch = useDispatch();
  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector()
  const toast = useToaster()
  const [iAmroomInto, setIAmroomInto] = useState<boolean>(false)
  const [iamRoomRadioDisabled, setIamRoomRadioDisabled] = useState<boolean>(true)
  const amountSelector = useAppAmountSelector();

  
  const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<any>({
    // resolver: yupResolver(FileSavingSettingSchema),
    defaultValues: {
      all_user_contact_me: false,
      pms_calls_othr_activity_frm_contact_list: false,
      show_dnd_when_share_screen: false,
      show_room_i_am_in: false,
      show_room_i_am_in_options: ''
    },
  })

  const onSubmit = (values: any) => {
    dispatch(updateAmount(values.show_room_i_am_in_options));
    let params = {
      all_user_contact_me: values.all_user_contact_me ? 1 : 0,
      pms_calls_othr_activity_frm_contact_list: values.pms_calls_othr_activity_frm_contact_list ? 1 : 0,
      show_dnd_when_share_screen: values.show_dnd_when_share_screen ? 1 : 0,
      show_room_i_am_in_options: values.show_room_i_am_in_options ? (iAmroomInto ? Number(values.show_room_i_am_in_options) : null) : null,
      show_room_i_am_in: iAmroomInto ? 1 : 0,
    }
    preference.callSaveUserPreference(params, (message: string, resp: any) => {
      toast.success(message)
    }, (message: string) => {
      toast.error(message)
    })
  }

  const handleOnChange = (e: any, inputType: string, onChange: any) => {
    if (inputType == "all_user_contact_me") {
      setValue("pms_calls_othr_activity_frm_contact_list", 0)
    }
    else {
      setValue("all_user_contact_me", 0)
    }
    onChange(e)
  }

  //Disable/Enabled based on user select checkbox on Show the room I am into
  const handleIamRoomInChange = (e: any) => {
    if (e) {
      setIamRoomRadioDisabled(false)
      setIAmroomInto(true)
    } else {
      setIamRoomRadioDisabled(true)
      setIAmroomInto(false)
    }
  }
  const amount: any = amountSelector.amount;
  
  useEffect(() => {
    if (preferenceSelector && preferenceSelector.list) {
      for (let i = 0; i < preferenceSelector.list.length; i++) {
        if (preferenceSelector.list[i].field_type_details == "checkbox") {
          let val = parseInt(preferenceSelector.list[i].val) ? true : false;
          setValue(preferenceSelector.list[i].key, val)
        }

        if (preferenceSelector.list[i].field_type_details == "radio") {
          let val = parseInt(preferenceSelector.list[i].val) ? preferenceSelector.list[i].val : null;
          setValue(preferenceSelector.list[i].key, String(amountSelector.amount))
        }
      }
    }
    // setValue()
  }, [preferenceSelector,amountSelector])

  useEffect(() => {
    console.log('==============================',preferenceSelector);
    if (preferenceSelector && preferenceSelector.list) {
      let findIndex = preferenceSelector.list.findIndex((z: any) => z.key == 'show_room_i_am_in')
      if (findIndex >= 0) {
        if (preferenceSelector.list[findIndex].val === "1") {
          setIamRoomRadioDisabled(false)
        } else {
          setIamRoomRadioDisabled(true)
        }
      }
    }
  }, [preferenceSelector])


  return (
    <React.Fragment>
      <div className="right-menu-details dark-box-inner inner_privacy">
        <h3>Privacy</h3>
        <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>

          <div className='row'>
            <h5>Privacy:</h5>
            <div className='all_priv'>
              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="all_user_contact_me"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={(e) => {
                          handleOnChange(e, name, onChange)
                        }}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="privacy-1"
                        inputRef={ref}
                        label="All users can contact me"
                        error={errors.all_user_contact_me}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="pms_calls_othr_activity_frm_contact_list"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={(e) => {
                          handleOnChange(e, name, onChange)
                        }}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="privacy-2"
                        inputRef={ref}
                        label="PMs, Calls and any other activity from contact list only"
                        error={errors.pms_calls_othr_activity_frm_contact_list}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

          </div>

          <div className='row'>
            <h5>Miscellaneous:</h5>
            <div className='all_priv'>
              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="show_dnd_when_share_screen"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="privacy-3"
                        inputRef={ref}
                        label="Show my status Do Not Disturb when i share my screen"
                        error={errors.show_dnd_when_share_screen}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                  <Controller
                    control={control}
                    name="show_room_i_am_in"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={
                          (e) => {
                            onChange(e)
                            handleIamRoomInChange(e)
                          }
                        }
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="privacy-4"
                        inputRef={ref}
                        label="Show the room I am into"
                        error={errors.show_room_i_am_in}
                      />
                    )}
                  />
                </div>
                {
                  preferenceSelector && preferenceSelector.list && preferenceSelector.list.length ? preferenceSelector.list.map((field: any, index: number) =>
                    field.field_type_details === 'radio' ?
                      <div key={index} className="form-group">
                        <label>{field.field_label}</label>
                        <div className="d-flex privacy-room-i-am-in-options">
                          {
                            field && field.field_options && field.field_options.length ? field.field_options.map((op: any, ind: number) =>
                              <div key={ind} className="custom-control custom-radio custom-checkbox-outline theme-custom-checkbox mr-3">
                                <input type="radio" name={field.key} className="custom-control-input" id={field.key + '-' + op.key} value={op.key} ref={register} disabled={iamRoomRadioDisabled} />
                                <label className="custom-control-label" htmlFor={field.key + '-' + op.key}>{op.val}</label>
                              </div>) : <span className="no-option">no option found</span>
                          }
                        </div>
                      </div>
                      : null
                  ) : null
                }

              </div>
            </div>
          </div>



          {/* {preferenceSelector && preferenceSelector.list && preferenceSelector.list.length ? preferenceSelector.list.map((field: any, index: number) =>
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
                : <span>No Setting Found</span>
          ) : <span>No Setting Found</span>} */}
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

export default PrivacySetting
