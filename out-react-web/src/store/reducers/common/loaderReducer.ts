import { type } from 'os';
import { ActionExtended } from '../../../_common/interfaces/ActionExtended';
import { ACTIONS } from '../../../_config'

export interface LoaderReducer {
  fpLoaderShown: boolean;
}

const initialState: LoaderReducer = {
  fpLoaderShown: false,
};

const loaderReducer = (state = initialState, action: ActionExtended) => {
  switch (action.type) {
    case ACTIONS.LOADER.SET_FP_STATUS:
      return {
        ...state,
        fpLoaderShown: action.payload,
      };
    default:
      return state;
  }
};

export default loaderReducer;
