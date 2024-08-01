import { call, put, all } from 'redux-saga/effects';
import { ACTIONS, API_URL, SAGA_ACTIONS, STORAGE } from 'src/_config';
import { CallApi } from './api/callApi';

export function* createNotebook(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.NOTEBOOK.CREATE_NOTEBOOK, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* updateNotebook(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.NOTEBOOK.UPDATE_NOTEBOOK, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* shareNotebook(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.NOTEBOOK.SHARE_NOTEBOOK, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* notebookDetails(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.NOTEBOOK.NOTEBOOK_DETAILS, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.NOTEBOOK.GET_NOTEBOOK_DETAILS,
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

export function* deleteNotebook(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.NOTEBOOK.DELETE_NOTEBOOK, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* removeNotebookShare(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.NOTEBOOK.REMOVE_NOTEBOOK_SHARE, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* getNotebookList(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.GET, API_URL.NOTEBOOK.NOTEBOOK_LIST, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.NOTEBOOK.GET_NOTEBOOK_LIST,
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

export function* notebookShareContactList(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.NOTEBOOK.NOTEBOOK_CONTACT_LIST, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.NOTEBOOK.GET_NOTEBOOK_CONTACT_LIST,
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