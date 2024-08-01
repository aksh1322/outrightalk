import { SAGA_ACTIONS } from 'src/_config'
import {
    RemoveSingleNotification,
} from 'src/_common/interfaces/ApiReqRes'
import { useApiCall } from '../common/appApiCallHook'
import { call } from 'redux-saga/effects'

export function useNotificationApi() {

    const callApi = useApiCall()

    const getAllNotifications = (onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.NOTIFICATION.GET_ALL_NOTIFICATION, null, onSuccess, onError);
    }

    const removeSingleNotification = (data: RemoveSingleNotification, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.NOTIFICATION.REMOVE_SINGLE_NOTIFICATION, data, onSuccess, onError, false);
    }

    return {
        callGetAllNotifications: getAllNotifications,
        callRemoveSingleNotification: removeSingleNotification,
    }
}