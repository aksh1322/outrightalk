import { call, put, all } from 'redux-saga/effects';
import { ACTIONS, API_URL, SAGA_ACTIONS, STORAGE } from '../_config';
import { CallApi } from './api/callApi';
import moment from 'moment';

export function* sendPms(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.SEND_PM, data, true);
                if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.PM_WINDOW.SEND_PM,
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

export function* getPmsDetails(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.PM_WINDOW_DETAILS, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.PM_WINDOW.SEND_PM,
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


export function* addMemberIntoPmWindow(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.ADD_MEMBER_INTO_PM_WINDOW, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* inviteInPmNotification(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.INVITE_IN_PM_NOTIFICATION, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* removeMemberFromPmWindow(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.REMOVE_MEMBER_FROM_PM_WINDOW, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* sendChatForPmWindow(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.SEND_CHAT, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* clearAllChatsInPm(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.CLEAR_ALL_CHATS_IN_PM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* getChatForPmWindow(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.GET_CHAT, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.PM_WINDOW.GET_CHAT,
                payload: resp.data.data.chatfile
            })
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* getMyActivePmWindows(action: any): any { //PM I'm in
    try {
        const data = action.payload;
        const resp = yield call(CallApi.GET, API_URL.PM_WINDOW.ACTIVE_PM_WINDOW, data, true);
        console.log("resssssppp>>>>>>>>>>>>>>>", resp);
        
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.PM_WINDOW.GET_MY_ACTIVE_PM_WINDOWS,
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

export function* pmCallInitiateAndDisconnect(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.PM_CALL_INITIATE_AND_DISCONNECT, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* pmCallAcceptReject(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.PM_CALL_ACCEPT_REJECT, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* pmHeaderMenuSettingActionUpdate(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.PM_WINDOW_HEADER_MENU_SETTING_ACTION_UPDATE, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* pmHeaderMenuSaveDefaultSetting(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.PM_WINDOW_HEADER_MENU_SAVE_DEFAULT_SETTING, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* pmHeaderMenuResetDefaultSetting(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.PM_WINDOW_HEADER_MENU_RESET_DEFAULT_SETTING, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* showUsersLocation(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.SHOW_USERS_LOCATION, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* exitPmWindow(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.EXIT_PM_WINDOW, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* readPm(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.PM_READ, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* getDigSoundList(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.GET, API_URL.PM_WINDOW.GET_DIG_SOUND_LIST, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
           
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* sendDigSound(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.PM_WINDOW.SEND_DIG_SOUND, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}