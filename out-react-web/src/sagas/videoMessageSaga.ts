import { call, put, all } from 'redux-saga/effects';
import { ACTIONS, API_URL, SAGA_ACTIONS, STORAGE } from '../_config';
import { CallApi } from './api/callApi';

export function* isPagePasswordProtected(action: any): any {
    try {
        const type = action.payload.type;
        var apiUrl = API_URL.VIDEO_VOICE_MESSAGE.IS_PAGE_PASSWORD_PROTECTED + '/' + type;
        const resp = yield call(CallApi.GET, apiUrl, null, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* checkPassword(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.VIDEO_VOICE_MESSAGE.CHECK_PASSWORD, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* getContactList(action: any): any {
    try {
        const type = action.payload.type;
        if(type){
        var apiUrl = API_URL.VIDEO_VOICE_MESSAGE.GET_CONTACT_LIST + '/' + type;
        }
        else{
            var apiUrl = API_URL.VIDEO_VOICE_MESSAGE.GET_CONTACT_LIST
        }
        const resp = yield call(CallApi.GET, apiUrl, null, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.VIDEO_VOICE_MESSAGE.GET_CONTACT_LIST_USER,
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

export function* sendMessage(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.VIDEO_VOICE_MESSAGE.SEND_MESSAGE, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* getMessageList(action: any): any {
    try {
        const type = action.payload.type;
        var apiUrl = API_URL.VIDEO_VOICE_MESSAGE.GET_MESSAGE_LIST + '/' + type;
        const resp = yield call(CallApi.GET, apiUrl, null, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.VIDEO_VOICE_MESSAGE.GET_MESSAGE_LIST,
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

export function* deleteMessage(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.VIDEO_VOICE_MESSAGE.DELETE_MESSAGE, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* restoreMessage(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.VIDEO_VOICE_MESSAGE.RESTORE_MESSAGE, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* viewMessage(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.VIDEO_VOICE_MESSAGE.VIEW_MESSAGE, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* checkAvailabilityUser(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.VIDEO_VOICE_MESSAGE.CHECK_AVAILABILITY_USER, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}