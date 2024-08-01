import { call, put, all } from 'redux-saga/effects';
import { ACTIONS, API_URL, SAGA_ACTIONS, STORAGE } from '../_config';
import { CallApi } from './api/callApi';
import moment from 'moment';

export function* groupCategoryList(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.GROUP_CATEGORY_LIST, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.USER.GROUPS_CATEGORY.GROUP_CATEGORY_LIST,
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

export function* createRoom(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.CREATE_ROOM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

            // yield put({
            //     type: ACTIONS.USER.GROUPS_CATEGORY.ROOM_LIST_CATEGORYWISE,
            //     payload: resp.data.data
            // })

            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* createVipRoom(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.CREATE_VIP_ROOM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

            // yield put({
            //     type: ACTIONS.USER.GROUPS_CATEGORY.ROOM_LIST_CATEGORYWISE,
            //     payload: resp.data.data
            // })

            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}
export function* roomListCategoryWise(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ROOM_LIST_CATEGORYWISE, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.USER.GROUPS_CATEGORY.ROOM_LIST_CATEGORYWISE,
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

export function* getRoomTypes(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.GET, API_URL.USER.GROUPS_CATEGORY.GET_ROOM_TYPES, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_TYPES,
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

export function* getRoomGroups(action: any): any {
    try {
        // const data = action.payload;
        const categoryId = action.payload.category_id;
        var apiUrl = API_URL.USER.GROUPS_CATEGORY.GET_ROOM_GROUPS + '/' + categoryId;
        const resp = yield call(CallApi.GET, apiUrl, null, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_GROUPS,
                payload: resp.data.data.list
            })
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* getRoomCategory(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.GET, API_URL.USER.GROUPS_CATEGORY.GET_ROOM_CATEGORY, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_CATEGORY,
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

export function* getRoomLanguage(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.GET, API_URL.USER.GROUPS_CATEGORY.GET_ROOM_LANGUAGE, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* joinRoom(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.JOIN_ROOM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* exitFromRoom(action: any): any {
    try {
        const roomId = action.payload.room_id;
        var apiUrl = API_URL.USER.GROUPS_CATEGORY.EXIT_FROM_ROOM + '/' + roomId;
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


export function* verifyLockword(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.VERIFY_LOCKWORD, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* verifyAdminCode(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.VERIFY_ADMIN_CODE, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}
export function* verifyInviteCode(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.VERIFY_INVITE_CODE, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* getRoomDetails(action: any): any {
    try {
        const roomId = action.payload.room_id;
        var apiUrl = API_URL.USER.GROUPS_CATEGORY.GET_ROOM_DETAILS + '/' + roomId;
        const resp = yield call(CallApi.GET, apiUrl, null, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            var serverTime = moment.utc(resp.data.data.cur_server_time, 'YYYY-MM-DD HH:mm:ss').local().format("YYYY-MM-DD HH:mm:ss");
            var pcLocalTimeNow = moment().format("YYYY-MM-DD HH:mm:ss");

            var diff = moment(pcLocalTimeNow, "YYYY-MM-DD HH:mm:ss").diff(moment(serverTime, "YYYY-MM-DD HH:mm:ss"))
            var diffInMinutes = moment.duration(diff);
            yield put({
                type: ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_DETAILS,
                payload: {
                    ...resp.data.data,
                    diffBtwSerLcl: moment.duration(diff).asSeconds()
                }
            })
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* addAsFavourite(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ADD_AS_FAVOURITE, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* removeFavourite(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.REMOVE_FAVOURITE, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* likeRoom(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.LIKE_ROOM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* removeLikeRoom(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.REMOVE_LIKE_ROOM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}




export function* getMyActiveRooms(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.GET, API_URL.USER.GROUPS_CATEGORY.GET_MY_ACTIVE_ROOMS, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.USER.GROUPS_CATEGORY.GET_MY_ACTIVE_ROOMS,
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

export function* manageRoomTopic(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.MANAGE_TOPIC, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* updateRoom(action: any): any {
    try {
        const data = action.payload.apiParms;
        var apiUrl = '';
        apiUrl = API_URL.USER.GROUPS_CATEGORY.UPDATE_ROOM + '/' + action.payload.extra.id;

        const resp = yield call(CallApi.POST, apiUrl, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* verifyRoomPassword(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ROOM_VERIFY_ROOM_PASSWORD, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* deleteRoom(action: any): any {
    try {
        // const data = action.payload;
        let apiUrl = API_URL.USER.GROUPS_CATEGORY.DELETE_ROOM + '/' + action.payload.room_id
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

export function* removeAllHandFromRoom(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.MENU.ADMIN_REMOVE_ALL_HAND, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* disableInvitationForRoom(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.MENU.ADMIN_DISABLE_INVITATION, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* giveMicToAll(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.MENU.GIVE_MIC_TO_ALL, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* removeAllMic(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.MENU.REMOVE_ALL_MIC, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* simultaneousMic(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.MENU.SIMULTENIOUS_MIC, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* grabMic(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.MENU.GRAB_MIC, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}



export function* roomAdminLists(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ROOM_ADMIN_LISTS, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* addRoomAdmin(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ADD_ROOM_ADMIN, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* deleteRoomAdmins(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.DELETE_ROOM_ADMIN, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* viewMyWebCam(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.VIEW_MY_WEBCAM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* whoIsViewingMyWebCam(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.WHO_IS_VIEWING_MY_WEBCAM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

// ADMIN CONTROL
export function* getRoomAdminControl(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ROOM_ADMIN_CONTROL, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.USER.GROUPS_CATEGORY.ROOM_ADMIN_CONTROL,
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
export function* removeKickUsers(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ROOM_REMOVED_KICKED_USERS, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}
export function* removeBannedUsers(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ROOM_REMOVED_BANNED_USERS, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}
export function* sendUserToBannedList(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.APPLY_BANNED_TO_USER, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* saveAdminControlSetting(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.SAVE_ADMIN_CONTROL_SETTING, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}


//LEFT MENU SAGA
export function* getLeftMenuItemList(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.GET, API_URL.USER.MENU.LEFT_SIDEBAR_LIST, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            yield put({
                type: ACTIONS.USER.MENU.GET_LEFT_SIDEBAR_LIST,
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
// CHAT History
export function* getAllChatHistory(action: any): any {
    try {
        // const data = action.payload;
        let apiUrl = API_URL.USER.GROUPS_CATEGORY.CHAT.GET_ALL_CHAT_HISTORY
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
//CHAT SAGA
export function* getAllChatFromRoom(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.CHAT.GET_ALL_CHAT_FROM_ROOM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

            yield put({
                type: ACTIONS.USER.GROUPS_CATEGORY.CHAT.GET_ALL_CHAT_FROM_ROOM,
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

export function* postChatInRoom(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.CHAT.POST_CHAT_IN_ROOM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* saveTranslations(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.CHAT.SAVE_TRANSLATIONS, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}
export function* clearMyChat(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.CHAT.CLEAR_MY_CHAT, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

// room member saga

export function* customizedNickname(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.CUSTOMIZED_NICKNAME, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* addToContactList(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ADD_TO_CONTACT_LIST, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* removeFromContactList(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.REMOVE_FROM_CONTACT_LIST, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* addAsFavouriteContactList(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ADD_AS_FAVOURITE_CONTACT_LIST, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* addUserAsFavouriteFromContact(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ADD_USER_AS_FAVOURITE_FROM_CONTACT, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* removeFromFavouriteContactList(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.REMOVE_FROM_FAVOURITE_CONTACT_LIST, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* kickUserFromRoom(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.KICK_USER_FROM_ROOM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* raiseHandAtRoom(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.RAISE_HAND_AT_ROOM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* raiseHandRemoveAtRoom(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.RAISE_HAND_REMOVE_AT_ROOM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* removeHandFromRoom(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.REMOVE_HAND_FROM_ROOM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* addToBlockList(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ADD_TO_BLOCK_LIST, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* removeFromBlockList(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.REMOVE_FROM_BLOCK_LIST, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* uploadRoomVideo(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.UPLOAD_ROOM_VIDEO, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* addToIgnoreList(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ADD_TO_IGNORE_LIST, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* removeFromIgnoreList(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.REMOVE_FROM_IGNORE_LIST, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* webCameraOnOffToggle(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.WEB_CAMERA_ON_OFF_TOGGLE, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* instantInviteAtRoom(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.INSTANT_INVITE_AT_ROOM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            // yield put({
            //     type: ACTIONS.USER.GROUPS_CATEGORY.INSTANCE_INVITE_AT_ROOM,
            //     payload: resp.data.data
            // })
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* changeUserRoomSettings(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.MENU.CHANGE_USER_ROOM_SETTINGS, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}


export function* clearMyRoomChat(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.CLEAR_MY_ROOM_CHAT, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* roomMenuPlayVideo(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ROOM_MENU_PLAY_VIDEO, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}


export function* roomMenuPlayAcceptVideo(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ROOM_MENU_PLAY_ACCEPT_VIDEO, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* roomMenuPlayRejectVideo(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ROOM_MENU_PLAY_REJECT_VIDEO, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* roomMenuPlayRemoveVideo(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.ROOM_MENU_PLAY_REMOVE_VIDEO, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* roomSaveDefaultSetting(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.MENU.ROOM_SAVE_DEFAULT_SETTING, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* roomUserWiseSaveDefaultSetting(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.MENU.ROOM_USER_WISE_SAVE_DEFAULT_SETTING, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* roomResetDefaultSetting(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.MENU.ROOM_RESET_DEFAULT_SETTING, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* redDotForAllUsers(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.MENU.RED_DOT_FOR_ALL, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* redDotForIndividualUsers(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.MENU.RED_DOT_FOR_INDIVIDUAL_USER, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* closeRoom(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.CLOSE_ROOM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}


export function* joinRoomAsAdminRoomList(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.GET, API_URL.USER.GROUPS_CATEGORY.JOIN_ROOM_AS_ADMIN_ROOM_LIST, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* joinRoomAsAdminCodeVerify(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.JOIN_ROOM_ADMIN_CODE_VERIFY, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* joinSimultaneouslyRoom(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.JOIN_SIMULTANEOUS_ROOM, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* getSubscriptionRoomList(action: any): any {
    try {
        const data = action.payload;
        var apiUrl = '';
        apiUrl = API_URL.USER.GROUPS_CATEGORY.SUBSCRIPTION.SUBSCRIPTION_ROOM_LIST + '/' + action.payload.room_id;
        const resp = yield call(CallApi.GET, apiUrl, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* buyRoomSubscriptionPlan(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.SUBSCRIPTION.SUBSCRIPTION_ROOM_BUY_PLAN, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* roomSubscriptionSuccess(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.SUBSCRIPTION.SUBSCRIPTION_ROOM_SUCCESS, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* removeRoomSubscription(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.SUBSCRIPTION.REMOVE_ROOM_SUBSCRIPTION, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* getVirtualGiftCreditList(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.GET, API_URL.USER.GROUPS_CATEGORY.VIRTUAL_GIFT_CREDIT.VIRTUAL_GIFT_CREDIT_LIST, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* buyVirtualGiftCredit(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.VIRTUAL_GIFT_CREDIT.VIRTUAL_GIFT_CREDIT_BUY, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}

export function* virtualGiftCreditSuccess(action: any): any {
    try {
        const data = action.payload;
        const resp = yield call(CallApi.POST, API_URL.USER.GROUPS_CATEGORY.VIRTUAL_GIFT_CREDIT.VIRTUAL_GIFT_CREDIT_BUY_SUCCESS, data, true);
        if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
            action && action.callbackSuccess && action.callbackSuccess(resp.data);
        } else {
            action && action.callbackError && action.callbackError(resp.data);
        }
    } catch (e) {
        action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
}