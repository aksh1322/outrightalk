import { type } from 'os';
import { ActionExtended } from '../../../_common/interfaces/ActionExtended';
import { ACTIONS } from '../../../_config'

export interface GlobalReducer {
  loginModalShown: boolean;
}

const initialState: GlobalReducer = {
  loginModalShown: false,
};

const globalsReducer = (state = initialState, action: ActionExtended) => {
  switch (action.type) {
    case ACTIONS.GLOBAL.SET_LOGIN_MODAL:
      return {
        ...state,
        loginModalShown: action.payload,
      };
    default:
      return state;
  }
};

export default globalsReducer;
