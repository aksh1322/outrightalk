import { type } from 'os';
import { ActionExtended } from '../../../_common/interfaces/ActionExtended';
import { ACTIONS } from '../../../_config'

export interface AmountReducer {
  amount: Number;
}

const initialState: AmountReducer = {
  amount: 0,
};

const amountReducer = (state = initialState, action: ActionExtended) => {
//   switch (action.type) {
//     case ACTIONS.LOADER.SET_FP_STATUS:
//       return {
//         ...state,
//         fpLoaderShown: action.payload,
//       };
//     default:
//       return state;
//   }
    // return {
    //     ...state,
    //     amount: action.payload
    // }
    // return state;
    switch (action.type) {
    case ACTIONS.AMOUNT.UPDATE_AMOUNT:
      return {
        ...state,
        amount: action.payload,
      };
    default:
      return state;
  }
};

export default amountReducer;
