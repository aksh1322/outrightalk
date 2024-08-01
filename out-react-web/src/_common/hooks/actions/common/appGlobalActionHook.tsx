import { useDispatch } from 'react-redux'
import { ACTIONS } from '../../../../_config'

export function useAppGlobalAction() {
  const dispatch = useDispatch()

  const showLoginModal = () => {
    dispatch({
      type: ACTIONS.GLOBAL.SET_LOGIN_MODAL,
      payload: true,
    })
  }

  const hideLoginModal = () => {
    dispatch({
      type: ACTIONS.GLOBAL.SET_LOGIN_MODAL,
      payload: false,
    })
  }

  return {
    showLoginModal,
    hideLoginModal,
  }
}