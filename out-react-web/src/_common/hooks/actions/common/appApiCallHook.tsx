import { useDispatch } from 'react-redux'
import { extractErrorMessage } from '../../../../_config'
import { useAppLoader } from './appLoaderHook'

export function useApiCall() {

  const dispatch = useDispatch()
  const { showLoader, hideLoader } = useAppLoader()

  const callApi = (sagaAction: string, dataOrParams: any = {}, callbackSuccess: Function, callbackError: Function, isLoader: boolean = true) => {

    if (isLoader) showLoader()
    dispatch({
      type: sagaAction,
      payload: dataOrParams,
      callbackSuccess: (data: any) => {
        let message = data && data.message ? data.message : 'Request processed successfully'
        let resp = data && data.data ? data.data : null
        if (isLoader) hideLoader()
        callbackSuccess && callbackSuccess(message, resp)
      },
      callbackError: (error: any) => {
        let message = extractErrorMessage(error && error.data && error.data.errors ? error : (error.message ? error.message : null), 'Unable to process request, please try again')
        let resp = error && error.data ? error.data : null
        if (isLoader) hideLoader()
        // callbackError && callbackError({
        //   message: message,
        //   resp: resp
        // })
        callbackError && callbackError(message, resp)
      }
    })
  }
  return callApi
}