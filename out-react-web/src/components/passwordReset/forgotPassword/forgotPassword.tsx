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
import { OptionValue } from '../../../_common/interfaces/common'
import { useAppForgotPasswordDataSelector } from '../../../_common/hooks/selectors/registrationSelector';
import { useCommonApi } from '../../../_common/hooks/actions/commonApiCall/appCommonApiCallHook';
import { URLS } from '../../../_config'
import { useAppRegistrationAction } from '../../../_common/hooks/actions/registration/appRegistrationActionHook';

interface ForgotPasswordValues {
  question: OptionValue | undefined | any;
  answer: string;
}

const forgotPasswordSchema = yup.object().shape({
  // question: yup
  //   .string()
  //   .required('security question is required'),
  answer: yup
    .string()
    .required('answer is required')
})

function ForgotPasswordForm() {
  /**
   * const
   */
  const { register, control, setValue, handleSubmit, errors } = useForm<ForgotPasswordValues>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      question: '',
      answer: ''
    },
  })
  const [question, setQuestion] = useState<any>();
  const globalActions = useAppGlobalAction()
  const history = useHistory()
  const userApi = useUserApi()
  const commonApi = useCommonApi()
  const forgotPasswordAction = useAppRegistrationAction()
  const toast = useToaster()
  const forgotPasswordDataSelector = useAppForgotPasswordDataSelector()

  /**
   * effects
   */
  /**
   * functions
   */

  const onSubmit = (values: ForgotPasswordValues) => {

    var parms = {
      token: forgotPasswordDataSelector && forgotPasswordDataSelector.data && forgotPasswordDataSelector.data.token ? forgotPasswordDataSelector.data.token : '',
      answer: values.answer
    }

    userApi.callForgotPasswordQuestionAnswer(parms, (message: string, resp: any) => {

      if (resp) {
        toast.success(message)
        history.push(URLS.FORGOT_PASSWORD_OTP)
      } else {
        toast.error(message)
      }
    }, (message: string, resp: any) => {
      toast.error(message)
    })
  }

  //reset value on unmount
  useEffect(() => {
    return () => {
      forgotPasswordAction.forgotPasswordStepChange(1)
    };
  }, [])

  const getSecurityQuestion = forgotPasswordDataSelector.data.question;

  // const getQuestionList = () => {
  //   commonApi.callGetSecretQuestion((message: string, resp: any) => {
  //     console.log('resp question', resp)
  //     if (resp && resp.list && resp.list.length) {
  //       setQuestionList(resp.list)
  //     }
  //   }, (message: string) => {
  //     // toast.error(message)
  //   })
  // }

  return (

    <form className="form-horizontal forgot-password-question-answer" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="pb-3">
        <h2 className="white-text">Answer</h2>
        <h3 className="white-text">Your Secret Question</h3>
      </div>
      <div className="form-group">
        <Controller
          control={control}
          name="question"
          render={({ onChange, onBlur, value, name, ref }) => (
            <FormTextInput
              name={name}
              onChange={onChange}
              onBlur={onBlur}
              value={getSecurityQuestion}
              inputRef={ref}
              type='text'
              disabled={true}
              error={errors.question}
              placeholder="Enter Secret Question"
            />
          )}
        />
      </div>
      <div className="form-group">
        <Controller
          control={control}
          name="answer"
          render={({ onChange, onBlur, value, name, ref }) => (
            <FormTextInput
              name={name}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              inputRef={ref}
              type="text"
              error={errors.answer}
              placeholder="Enter Your Answer"
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

export default ForgotPasswordForm
