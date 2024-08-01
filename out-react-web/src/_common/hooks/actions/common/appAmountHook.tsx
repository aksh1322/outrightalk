import { useDispatch } from 'react-redux'
import { ACTIONS } from '../../../../_config'

export const updateAmount = (amount:any) => {
  return {
    type: ACTIONS.AMOUNT.UPDATE_AMOUNT,
    payload: amount,
  };
};