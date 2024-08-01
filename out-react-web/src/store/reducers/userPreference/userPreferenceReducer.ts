import { type } from 'os';
import { ActionExtended } from '../../../_common/interfaces/ActionExtended';
import { ACTIONS } from '../../../_config'

export interface UserPreferencesReducer {
  userPreferences: any;
}

const initialState: UserPreferencesReducer = {
  userPreferences: null,
};

const userPreferencesReducer = (state = initialState, action: ActionExtended) => {
  switch (action.type) {
    case ACTIONS.USER_PREFERENCE.GET_USER_ALL_PREFERENCE:
      return {
        ...state,
        userPreferences: action.payload
      };
    default:
      return state;
  }
};

export default userPreferencesReducer;
