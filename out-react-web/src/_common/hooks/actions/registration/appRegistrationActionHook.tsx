import { useDispatch } from 'react-redux'
import { ACTIONS } from '../../../../_config'

export function useAppRegistrationAction() {

  const dispatch = useDispatch()

  const registrationStepChange = (data:number) => {
    dispatch({
      type: ACTIONS.REGISTRATION.REGISTRATION_STEP,
      payload: data,
    })
  }

  const registrationStepDataContainer = (data:any) => {
    dispatch({
      type: ACTIONS.REGISTRATION.REGISTRATION_DATA,
      payload: data,
    })
  }

  const forgotPasswordStepChange = (data:number) => {
    dispatch({
      type: ACTIONS.FORGOT_PASSWORD.FORGOT_PASSWORD_STEP,
      payload: data,
    })
  }

  return {
    registrationStepChange,
    registrationStepDataContainer,
    forgotPasswordStepChange
  }
}