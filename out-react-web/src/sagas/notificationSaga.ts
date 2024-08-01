import { call, put, all } from 'redux-saga/effects';
import { ACTIONS, API_URL, SAGA_ACTIONS, STORAGE } from 'src/_config';
import { CallApi } from './api/callApi';


export function* getAllNotifications(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.GET, API_URL.NOTIFICATION.GET_ALL_NOTIFICATION, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.NOTIFICATION.GET_ALL_NOTIFICATION,
                payload: resp.data.data
            })
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* removeSingleNotification(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.NOTIFICATION.REMOVE_SINGLE_NOTIFICATION, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}
