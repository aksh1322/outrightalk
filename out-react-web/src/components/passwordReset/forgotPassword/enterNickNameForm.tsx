import React, { useEffect, useState } from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormTextInput from '../../../_common/components/form-elements/textinput/formTextInput';
import SelectInput from '../../../_common/components/form-elements/selectinput/selectInput'
import { useAppGlobalAction } from '../../../_common/hooks/actions/common/appGlobalActionHook';
import { useHistory } from 'react-router-dom';
import { useUserApi } from '../../../_common/hooks/actions/user/appUserApiHook';
import { useToaster } from '../../../_common/hooks/actions/common/appToasterHook';
import { useAppRegistrationAction } from '../../../_common/hooks/actions/registration/appRegistrationActionHook';

interface NickNameFormValues {
  nickname: string;
}

const nickNameFormSchema = yup.object().shape({
  nickname: yup
    .string()
    .required('nickname is required')
})

function NickNameForm() {
  /**
   * const
   */
  const { register, control, setValue, handleSubmit, errors } = useForm<NickNameFormValues>({
    resolver: yupResolver(nickNameFormSchema),
    defaultValues: {
      nickname: ''
    },
  })
  const globalActions = useAppGlobalAction()
  const history = useHistory()
  const userApi = useUserApi()
  const toast = useToaster()
  const forgotPasswordAction = useAppRegistrationAction()
  /**
   * effects
   */
  /**
   * functions
   */

  const onSubmit = (values: NickNameFormValues) => {
    var parms = {
      nickname: values.nickname
    }

    userApi.callForgotPasswordnickName(parms, (message: string, resp: any) => {
      if (resp) {
        forgotPasswordAction.forgotPasswordStepChange(2)
        toast.success(message)
      } else {
        toast.error(message)
      }
    }, (message:string ) => {
      toast.error(message)
    })
  }

  //set value on mount

  useEffect(() => {

  }, [])

  // const nextStepForgotPassword=()=>{
  //   forgotPasswordAction.registrationStepChange(2)
  // }


  return (

    <form className="form-horizontal forgot-password" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="pb-3">
        <h2 className="white-text">Nickname</h2>
        <h3 className="white-text">Enter Your Nickname</h3>
      </div>
      <div className="form-group">
        <Controller
          control={control}
          name="nickname"
          render={({ onChange, onBlur, value, name, ref }) => (
            <FormTextInput
              name={name}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              inputRef={ref}
              type="text"
              error={errors.nickname}
              placeholder="Nickname"
            />
          )}
        />
      </div>
      {/* <button type="submit" className="btn btn-primary btn-block enter-btn">Login</button> */}
      <div className="mt-3 d-flex align-items-center login-btn">
        <button className="btn btn-primary btn-block waves-effect waves-light w-auto mr-2" type="submit">Send</button>
      </div>
    </form>

  )
}

export default NickNameForm
