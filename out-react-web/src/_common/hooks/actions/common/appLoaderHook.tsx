import { useDispatch } from 'react-redux'
import { ACTIONS } from '../../../../_config'

export function useAppLoader() {

  const dispatch = useDispatch()

  const show = (message: string = 'Please wait') => {
    dispatch({
      type: ACTIONS.LOADER.SET_FP_STATUS,
      payload: true
    })
  }

  const hide = () => {
    dispatch({
      type: ACTIONS.LOADER.SET_FP_STATUS,
      payload: false
    })
  }


  return { showLoader: show, hideLoader: hide }
}