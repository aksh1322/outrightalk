import { type } from 'os';
import { ActionExtended } from '../../../_common/interfaces/ActionExtended';
import { ACTIONS } from '../../../_config'

export enum ForgotPasswordStep {
  NICK_NAME = 1,
  ENTER_SECRET_ANSWER = 2
}


export interface RegistrationReducer {
  regStep: number;
  registrationData: any;
  forgotPasswordStep: ForgotPasswordStep;
  forgotPasswordData: any;
}

const initialState: RegistrationReducer = {
  regStep: 1,
  registrationData: null,
  forgotPasswordStep: ForgotPasswordStep.NICK_NAME,
  forgotPasswordData: null
};

const registrationReducer = (state = initialState, action: ActionExtended) => {
  switch (action.type) {
    case ACTIONS.REGISTRATION.REGISTRATION_STEP:
      return {
        ...state,
        regStep: action.payload
      };
    case ACTIONS.REGISTRATION.REGISTRATION_DATA:
      return {
        ...state,
        registrationData: action.payload
      };
    case ACTIONS.FORGOT_PASSWORD.FORGOT_PASSWORD_STEP:
      return {
        ...state,
        forgotPasswordStep: action.payload
      };
    case ACTIONS.FORGOT_PASSWORD.FORGOT_PASSWORD_DATA:
      return {
        ...state,
        forgotPasswordData: action.payload
      };
    default:
      return state;
  }
};

export default registrationReducer;
