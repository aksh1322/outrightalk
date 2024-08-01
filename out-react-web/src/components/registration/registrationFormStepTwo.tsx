import React, { useEffect, useState } from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useHistory } from 'react-router-dom';
import { Form } from 'react-bootstrap'
import FormTextInput from '../../_common/components/form-elements/textinput/formTextInput';
import SelectInput from '../../_common/components/form-elements/selectinput/selectInput';
import { useAppGlobalAction } from '../../_common/hooks/actions/common/appGlobalActionHook';
import { useUserApi } from '../../_common/hooks/actions/user/appUserApiHook';
import { useToaster } from '../../_common/hooks/actions/common/appToasterHook';
import { useAppRegistrationAction } from '../../_common/hooks/actions/registration/appRegistrationActionHook';
import { useAppRegistrationDataSelector } from '../../_common/hooks/selectors/registrationSelector';
import { OptionValue } from '../../_common/interfaces/common';
import { useCommonApi } from '../../_common/hooks/actions/commonApiCall/appCommonApiCallHook';
import { URLS } from '../../_config';

interface registrationStepTwoFormValues {
  secretQuestion: OptionValue | undefined;
  secretAnswer: string;
  acceptTermCondition: boolean;
}

const registrationStepTwoSchema = yup.object().shape({
  secretQuestion: yup
    .object()
    .shape({
      value: yup.string().required('secret question is required'),
    }).nullable()
    .required('secret question is required'),
  secretAnswer: yup.string().required('Secret answer is required'),
  // acceptTermCondition: yup.boolean().required('You have to select term & condition'),
  acceptTermCondition: yup.boolean()
    .oneOf([true], 'Must Accept Terms and Conditions'),

})

function RegistrationFormStepTwo() {
  /**
   * const
   */
  const { watch, register, control, setValue, getValues, handleSubmit, errors } = useForm<registrationStepTwoFormValues>({
    // mode: 'onBlur',
    resolver: yupResolver(registrationStepTwoSchema),
    defaultValues: {
      secretQuestion: undefined,
      secretAnswer: '',
      acceptTermCondition: false
    },
  })
  const [questionList, setQuestionList] = useState<any>();
  const globalActions = useAppGlobalAction()
  const history = useHistory()
  const commonApi = useCommonApi()
  const userApi = useUserApi()
  const toast = useToaster()
  const registrationAction = useAppRegistrationAction()
  const registrationDataSelector = useAppRegistrationDataSelector()


  useEffect(() => {
    getQuestionList()

    // returned function will be called on component unmount 
    return () => {
      registrationAction.registrationStepChange(1)
      registrationAction.registrationStepDataContainer(null)
    };

  }, [])



  const getQuestionList = () => {
    commonApi.callGetSecretQuestion((message: string, resp: any) => {
      if (resp && resp.list && resp.list.length) {
        setQuestionList(resp.list)
      }
    }, (message: string) => {
      // toast.error(message)
    })
  }

  const onSubmit = (values: registrationStepTwoFormValues) => {
    // registrationAction.registrationStepDataContainer(null)

    var parms = {
      extra: {
        step: 2,
        uid: registrationDataSelector.data.uid
      },
      apiParms: {
        question: values.secretQuestion && values.secretQuestion.value ? parseInt(values.secretQuestion.value) : 0,
        answer: values.secretAnswer
      }
    }
    userApi.callRegistation(parms, (message: string, resp: any) => {
      // toast.success(message)
      registrationAction.registrationStepDataContainer(null)
      // history.push(URLS.LOGIN)
      history.push(URLS.THANK_YOU, { status: "reg_success" })
    }, (message: string) => {
      toast.error(message)
    })
  }

  const prevStepRegistration = () => {
    registrationAction.registrationStepChange(1)
  }


  return (

    <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="pb-3">
        <div className="d-flex justify-content-between register-heading">
          <h2 className="white-text">Register</h2>
          <p className="mb-0">2 of 2</p>
        </div>
        <h3 className="white-text">Important</h3>
        <p className="reg-top-text">This Information will be treated as strictly confidential and It will be used by OutrighTalk only to assist you when you forget or you lose your password it should be an easy one to remember but perplexing to everyone else</p>
      </div>
      <div className="d-flex justify-content-between reg-fld-row reg-fld-col-1">
        <div className="reg-fld">
          <div className="form-group">
            <Controller
              control={control}
              name="secretQuestion"
              render={({ onChange, onBlur, value, name, ref }) => (
                <SelectInput
                  // name={name}
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  inputRef={ref}
                  dark={true}
                  options={questionList ? questionList.map((c: any) => ({
                    value: String(c.id),
                    label: c.question,
                  })) : []}
                  error={errors.secretQuestion}
                  placeholder="Choose Secret Question"
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-between reg-fld-row reg-fld-col-1">
        <div className="reg-fld">
          <div className="form-group">
            <Controller
              control={control}
              name="secretAnswer"
              render={({ onChange, onBlur, value, name, ref }) => (
                <FormTextInput
                  // name={name}
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  inputRef={ref}
                  type="text"
                  error={errors.secretAnswer}
                  placeholder="Secret Answer"
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="custom-control custom-checkbox">
        <input type="checkbox" className="custom-control-input" name="acceptTermCondition" id="customControlInline" ref={register} />
        <label className="custom-control-label" htmlFor="customControlInline">By checking the small box, you accept and you confirm to have read the <a href="#">Terms of Use for OutrighTalk's Services and Privacy Statement</a>.</label>
        {
          errors && errors.acceptTermCondition && errors.acceptTermCondition.message ? <>
            <Form.Control.Feedback type="invalid" >
              {errors.acceptTermCondition.message}
            </Form.Control.Feedback>
          </> : null
        }
      </div>
      <div className="reg-btn-panel d-flex justify-content-between mt-5">
        <button type="button" className="btn btn-primary" onClick={prevStepRegistration}>Previous</button>
        <div className="d-flex">
          <button type="button" className="btn btn-default mr-2">Cancel</button>
          <button type="submit" className="btn btn-success">Register</button>
        </div>
      </div>
    </form>
  )
}
export default RegistrationFormStepTwo
