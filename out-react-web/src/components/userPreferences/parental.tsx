import React, { useState, useEffect } from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Form } from 'react-bootstrap';
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import CheckboxInput from 'src/_common/components/form-elements/checkboxinput/checkboxInput'
import { useAppUserPreferencesSelector } from 'src/_common/hooks/selectors/userPreferenceSelector';
import SelectInput from 'src/_common/components/form-elements/selectinput/selectInput';
import { GetParentalControlInfo, SaveParentalControlPassword } from 'src/_common/interfaces/ApiReqRes';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import ParentalControlOtpAcceptModal from './modal/parentalControlOtpAcceptModal';
import ParentalControlSetNewPasswordModal from './modal/parentalControlSetNewPasswordModal';
import ParentalControlPasswordConfirmationModal from '../commonModals/parentalControlPasswordConfirmationModal/parentalControlPasswordConfirmationModal';

const parentalControlSchema = yup.object().shape({
  password: yup.string()
    .when("hidden_password", (hp: any) => {
      if (hp)
        return yup.string().required("Password is required")
          .min(8, "Minimum 8 characters required")
    })
})

function ParentalSetting() {

  const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<any>({
    resolver: yupResolver(parentalControlSchema),
    defaultValues: {
      searchItem: '',
      join_only_g_rated_rooms: false,
      activity_only_contact_list: false,
      disable_parental_ctrl_start_new_session: false,
      password: '',
      hidden_password: null,
    },
  })
  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector()
  const toast = useToaster()
  const [alert, setAlert] = useState<any>(null);
  const [showPasswordConfirmationModal, setShowPasswordConfirmationModal] = useState<boolean>(false)
  const [showOtpAcceptModal, setShowOtpAcceptModal] = useState<boolean>(false);
  const [showNewPasswordSetModal, setShowNewPasswordSetModal] = useState<boolean>(false);
  const [allAccounts, setAllAccounts] = useState<any>([])
  const [selectedAccountId, setSelectedAccountId] = useState<any>(null)
  const [parentalControlInfo, setParentalControlInfo] = useState<any[]>([])
  const [ispasswordAvailable, setIsPasswordAvailable] = useState<any>(null)
  const [passwordTextToggle, setPasswordTextToggle] = useState('password')
  const [selectedAccountPassword, setSelectedAccountPassword] = useState<any>(null)

  const hideAlert = () => {
    setAlert(null);
  }

  const handleShowRemovePasswordConfirmAlert = () => {
    // e.preventDefault()
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes"
        cancelBtnText="No"
        cancelBtnBsStyle="danger"
        confirmBtnBsStyle="success"
        allowEscape={false}
        closeOnClickOutside={false}
        title="Delete Password"
        onConfirm={() => handleDeleteParentalControlPassword(selectedAccountId)}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        Are you sure want to delete parental control password?
      </SweetAlert>
    );
  }

  const handleDeleteParentalControlPassword = (useId: number) => {
    const params = {
      user_id: useId
    }
    preference.callDeleteParentalControl(params, (message: string, resp: any) => {
      if (resp) {
        toast.success(message)
        hideAlert()
        setValue('searchItem', null)
        setIsPasswordAvailable(null)
      }
    }, (message: string) => {
      toast.error(message)
    })
  }

  const otpAcceptModalOpen = () => {
    setShowOtpAcceptModal(true)
  }
  const otpAcceptModalClose = () => {
    if (showOtpAcceptModal) setShowOtpAcceptModal(false)
  }

  const passwordConfirmationModalOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowPasswordConfirmationModal(true)
  }
  const passwordConfirmationModalClose = () => {
    if (showPasswordConfirmationModal) setShowPasswordConfirmationModal(false)
  }

  const newPasswordSetModalOpen = () => {
    setShowNewPasswordSetModal(true)
  }
  const newPasswordSetModalClose = () => {
    if (showNewPasswordSetModal) setShowNewPasswordSetModal(false)
  }

  const handleResetPassword = () => {
    const params = {
      user_id: selectedAccountId
    }
    preference.callResetParentalControlPassword(params, (message: string, resp: any) => {
      if (resp) {
        toast.success(message)
        otpAcceptModalOpen()
      }
    }, (message: string) => {
      toast.error(message)
    })
  }

  const onSubmit = (values: any) => {
    let params = {
      join_only_g_rated_rooms: values.join_only_g_rated_rooms ? 1 : 0,
      activity_only_contact_list: values.activity_only_contact_list ? 1 : 0,
      disable_parental_ctrl_start_new_session: values.disable_parental_ctrl_start_new_session ? 1 : 0,
    }
    preference.callSaveUserPreference(params, (message: string, resp: any) => {
      toast.success(message)
    }, (message: string) => {
      toast.error(message)
    })
  }

  const getAllAccounts = () => {
    preference.callGetAllAccount((message: string, resp: any) => {
      if (resp && resp.list && resp.list.length) {
        setAllAccounts(resp.list)
      }
    }, (message: string) => {
      toast.error(message)
    })
  }

  const handleChangeAccount = (e: any) => {
    if (e && e.value) {
      setSelectedAccountId(e.value)
      const params: GetParentalControlInfo = {
        user_id: e.value
      }
      preference.callGetParentalControlInfo(params, (message: string, resp: any) => {
        if (resp && resp.list && resp.list.length) {
          setParentalControlInfo(resp.list)
          let findIndex = resp.list.findIndex((z: any) => z.key == 'parental_password')
          if (findIndex >= 0) {
            let value = resp.list[findIndex]

            if (value.val) {
              setIsPasswordAvailable(true)
              setValue('hidden_password', null)
              setSelectedAccountPassword(value.val) //set user current password at state
            } else {
              setIsPasswordAvailable(false)
              setValue('hidden_password', 'available')
              setSelectedAccountPassword(null) //if no password available set state to null
            }
          }
        }
      }, (message: string) => {
        toast.error(message)
      })
    } else {
      setIsPasswordAvailable(null)
    }
  }

  const handleSavePassword = (values: any) => {
    const params: SaveParentalControlPassword = {
      user_id: selectedAccountId,
      parental_password: values.password
    }
    preference.callSaveParentalControlPassword(params, (message: string, resp: any) => {
      if (resp) {
        toast.success(message)
        setValue('searchItem', null)
        setIsPasswordAvailable(null)
      } else {
        setIsPasswordAvailable(null)
      }
    }, (message: string) => {
      toast.error(message)
    })
  }

  const isOtpCorrect = (status: boolean) => {
    if (status) {
      newPasswordSetModalOpen()
      setValue('searchItem', null)
      setIsPasswordAvailable(null)
    }
  }

  const isSetPasswordApplySuccessfully = (status: boolean) => {
    if (status) {
      setValue('searchItem', null)
      setIsPasswordAvailable(null)
    }
  }

  const isParentalPasswordConfirmationIsCorrect = (status: boolean) => {
    if (status) {
      passwordConfirmationModalClose()
      handleShowRemovePasswordConfirmAlert()
    } else {
      passwordConfirmationModalClose()
      toast.error("Invalid Password")
    }
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


  useEffect(() => {
    getAllAccounts()
  }, [])

  const handlePasswordTextToggle = () => {
    if (passwordTextToggle == 'password') {
      setPasswordTextToggle('text')
    }
    else {
      setPasswordTextToggle('password')
    }
  }

  return (
    <React.Fragment>
      {alert}
      <div className="right-menu-details dark-box-inner inner_parental_sec">
        <h3>Parental Control</h3>
        <form className="form-horizontal" noValidate>
          {/* {
            preferenceSelector && preferenceSelector.list && preferenceSelector.list.length ? preferenceSelector.list.map((field: any, index: number) =>
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
            ) : null
          } */}

          <div className="row">
            <div className="col-md-12">
              <div className="form-group">
                <Controller
                  control={control}
                  name="searchItem"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <SelectInput
                      onChange={
                        (e) => {
                          onChange(e)
                          handleChangeAccount(e)
                        }
                      }
                      onBlur={onBlur}
                      value={value}
                      inputRef={ref}
                      dark={true}
                      options={allAccounts.length ? allAccounts.map((all: any) => ({
                        value: all.id,
                        label: all.username,
                      })) : []}
                      error={errors.searchItem}
                      placeholder="Select.."
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {
            ispasswordAvailable == false ?
              <div className="row">
                <div className="col-md-4">
                  <div className="help-text">Parental Password</div>
                </div>
                <div className="col-md-8">
                  <div className="form-group">
                    <Controller
                      control={control}
                      name="password"
                      render={({ onChange, onBlur, value, name, ref }) => (
                        <FormTextInput
                          // name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          inputRef={ref}
                          type={passwordTextToggle}
                          // error={errors.password}
                          placeholder="Enter Password"
                        />
                      )}
                    />
                    <span className="eye-password-text" onClick={handlePasswordTextToggle}>
                      {passwordTextToggle == 'password' ?
                        <i className="fa fa-eye" aria-hidden="true"></i> :
                        <i className="fa fa-eye-slash" aria-hidden="true"></i>}
                    </span>
                    <input type="hidden" name="hidden_password" ref={register} />
                  </div>
                  {
                    errors && errors.password && errors.password.message ? <>
                      <Form.Control.Feedback type="invalid" >
                        {errors.password.message}
                      </Form.Control.Feedback>
                    </> : null
                  }
                </div>
                {/* <div className="col-md-6">
                  <div className="form-group">
                    <button
                      type="button"
                      className="btn theme-btn btn-primary mr-2 waves-effect"
                      onClick={handleSubmit(handleSavePassword)}
                    >
                      Save Password
                    </button>
                  </div>
                </div> */}

              </div>
              : null
          }
          <br />

          {
            preferenceSelector && preferenceSelector.list && preferenceSelector.list.length ? preferenceSelector.list.map((field: any, index: number) =>
              field.field_type_details === 'checkbox' ?
                <div className="form-group" key={index}>
                  <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                    {/* <Controller
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
                    /> */}
                    <span>
                      <img src="images/login/thankyou-icon.png" width="20px" alt="check" />
                    </span>
                    <label style={{ marginLeft: '20px' }}>
                      {field.field_label}
                    </label>
                  </div>
                </div>
                : null
            ) : null
          }

          <br />
          <div className="row">
            <div className="setting-lower-msg">
              Remember this feature can be enabled and disabled by using Parental control password to start a different session.
            </div>
          </div>

          {
            ispasswordAvailable == true ?
              <>
                <div className="parental-reset">  Forgot parental control password?
                  <button
                    type="button"
                    style={{ paddingLeft: '6px' }}
                    className="btn theme-btn btn-primary mr-2 waves-effect"
                    onClick={handleResetPassword}>
                    Reset
                  </button>
                </div>

                <span>
                  <a href="#" onClick={(e) => passwordConfirmationModalOpen(e)}>
                    Delete parental control completly from this computer
                  </a>
                </span>
              </>
              : null
          }


          <div className="form-group">
            <div className="d-flex mt-5">
              {
                ispasswordAvailable == false ?
                  <button type="button" className="btn theme-btn btn-primary mr-2 waves-effect" onClick={handleSubmit(handleSavePassword)}>Apply</button> : null
              }
              {/* <button type="button" className="btn theme-btn btn-default waves-effect">Cancel</button> */}
            </div>
          </div>
        </form>
      </div>

      {
        showOtpAcceptModal ?
          <ParentalControlOtpAcceptModal
            onClose={otpAcceptModalClose}
            onSuccess={isOtpCorrect}
            shouldShow={showOtpAcceptModal}
            userId={selectedAccountId}
          /> : null
      }
      {
        showNewPasswordSetModal ?
          <ParentalControlSetNewPasswordModal
            onClose={newPasswordSetModalClose}
            onSuccess={isSetPasswordApplySuccessfully}
            shouldShow={showNewPasswordSetModal}
            userId={selectedAccountId}
          /> : null
      }

      {
        showPasswordConfirmationModal ?
          <ParentalControlPasswordConfirmationModal
            onClose={passwordConfirmationModalClose}
            onSuccess={isParentalPasswordConfirmationIsCorrect}
            shouldShow={showPasswordConfirmationModal}
            setPassword={selectedAccountPassword}
          /> : null
      }

    </React.Fragment >
  )
}

export default ParentalSetting
