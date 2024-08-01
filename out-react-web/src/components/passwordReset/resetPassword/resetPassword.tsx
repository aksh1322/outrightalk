import React, { useEffect, useState } from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormTextInput from '../../../_common/components/form-elements/textinput/formTextInput';
import { useAppGlobalAction } from '../../../_common/hooks/actions/common/appGlobalActionHook';
import { useHistory } from 'react-router-dom';
import { useUserApi } from '../../../_common/hooks/actions/user/appUserApiHook';
import { useToaster } from '../../../_common/hooks/actions/common/appToasterHook';
import { useAppForgotPasswordDataSelector } from '../../../_common/hooks/selectors/registrationSelector';
import { URLS } from '../../../_config'

interface ResetPasswordFormValues {
  password: string;
  confirmpassword: string;
}

const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password should have minimum 8 characters')
    .max(20, 'Max 20 characters are allowed'),
  confirmpassword: yup
    .string()
    .required('Password is required')
    .min(8, 'Password should have minimum 8 characters')
    .max(20, 'Max 20 characters are allowed')
})

function ResetPasswordForm() {
  /**
   * const
   */
  const { register, control, setValue, handleSubmit, errors } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmpassword: ''
    },
  })
  const history = useHistory()
  const userApi = useUserApi()
  const toast = useToaster()
  const forgotPasswordDataSelector = useAppForgotPasswordDataSelector()

  /**
   * effects
   */
  /**
   * functions
   */

  const onSubmit = (values: ResetPasswordFormValues) => {
    var parms = {
      token: forgotPasswordDataSelector && forgotPasswordDataSelector.data && forgotPasswordDataSelector.data.token ? forgotPasswordDataSelector.data.token : '',
      password: values.password,
      c_password: values.confirmpassword,
    }
    userApi.callForgotPasswordReset(parms, (message: string, resp: any) => {
      if (resp) {
        toast.success(message)
        history.push(URLS.LOGIN)
      } else {
        toast.error(message)
      }
    }, (message: string, resp: any) => {
      toast.error(message)
    })
  }

  //set value on mount

  useEffect(() => {

  }, [])


  return (
    <form className="reset-password" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="pb-3">
        <h2 className="white-text">Reset</h2>
        <h3 className="white-text">Your Password</h3>
      </div>

      <div className="form-group">
        <Controller
          control={control}
          name="password"
          render={({ onChange, onBlur, value, name, ref }) => (
            <FormTextInput
              name={name}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              inputRef={ref}
              type="password"
              error={errors.password}
              placeholder="New Password"
            />
          )}
        />
      </div>

      <div className="form-group">
        <Controller
          control={control}
          name="confirmpassword"
          render={({ onChange, onBlur, value, name, ref }) => (
            <FormTextInput
              name={name}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              inputRef={ref}
              type="password"
              error={errors.confirmpassword}
              placeholder="Confirm Password"
            />
          )}
        />
      </div>
      {/* <button type="submit" className="btn btn-primary btn-block enter-btn">Login</button> */}

      <div className="mt-3 d-flex align-items-center login-btn">
        <button className="btn btn-primary btn-block waves-effect waves-light w-auto mr-2" type="submit">Update</button>
      </div>
    </form>

  )
}

export default ResetPasswordForm
