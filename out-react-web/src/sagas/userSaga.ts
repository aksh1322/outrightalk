import { call, put } from 'redux-saga/effects';
import { ACTIONS, API_URL, LOGIN_STORAGE, SAGA_ACTIONS, STORAGE } from '../_config';
import { CallApi } from './api/callApi';

export function* loginUser(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.LOGIN, data);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}


export function* loginCheckPassword(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.LOGIN_CHECK_PASSWORD, data,true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}


export function* getLoginModeUser(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.GET_LOGIN_MODE, data);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}


export function* registation(action: any): any {
  try {
    const data = action.payload.apiParms;
    var apiUrl = '';
    if (action.payload.extra.step === 1) {
      var apiUrl = API_URL.USER.REGISTRATION + '/' + action.payload.extra.step;
    }
    else {
      var apiUrl = API_URL.USER.REGISTRATION + '/' + action.payload.extra.step + '/' + action.payload.extra.uid;
    }
    const resp = yield call(CallApi.POST, apiUrl, data);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data.data) {
      yield put({
        type: ACTIONS.REGISTRATION.REGISTRATION_DATA,
        payload: resp.data,
      })
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* isAvailableNickName(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.CHECK_NICKNAME_AVAILABLITY, data);
    if (resp.status >= 200 && resp.status < 300 && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}


export function* getUserProfile(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.USER.DETAILS, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      yield put({
        type: ACTIONS.USER.ME,
        payload: resp.data.data.user
      })
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}



export function* logoutUser(action: any): any {
  try {
    console.log('action ====>', action);
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.LOGOUT, data, true);
    console.log('resp ===>', resp);
    if (resp.status >= 200 && resp.status < 300 && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}


export function* forgotPasswordNickName(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.FORGOT_PASSWORD_NICKNAME, data);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      yield put({
        type: ACTIONS.FORGOT_PASSWORD.FORGOT_PASSWORD_DATA,
        payload: resp.data
      })
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* forgotPasswordQuestionAnswer(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.FORGOT_PASSWORD_QUESTION_ANSWER, data);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      // yield put({
      //   type: ACTIONS.FORGOT_PASSWORD.FORGOT_PASSWORD_DATA,
      //   payload: resp.data
      // })
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* forgotPasswordOtp(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.FORGOT_PASSWORD_OTP, data);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      // yield put({
      //   type: ACTIONS.FORGOT_PASSWORD.FORGOT_PASSWORD_DATA,
      //   payload: resp.data
      // })
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* forgotPasswordReset(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.FORGOT_PASSWORD_RESET, data);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* updatePassword(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.UPDATE_PASSWORD, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* updateUserAvatar(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.UPDATE_PROFILE_IMAGE, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      yield put({
        type: ACTIONS.USER.ME,
        payload: resp.data.data.details.user
      })
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* updateProfileDetails(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.UPDATE_PROFILE_DETAILS, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      yield put({
        type: ACTIONS.USER.ME,
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

export function* updateVisibleStatus(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.UPDATE_VISIBLE_STATUS, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      yield put({
        type: ACTIONS.USER.ME,
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

export function* updateShowHideProfilePicture(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.SHOW_PROFILE_PICTURE, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      yield put({
        type: ACTIONS.USER.ME,
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

export function* findAndAddUser(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.FIND_AND_ADD_USER, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* findNearbyUser(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.NEAR_BY_USER, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* fetchUserDetails(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.FETCH_USER_DETAILS, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* updateCurrentLocation(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.UPDATE_CURRENT_LOCATION, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* findAndJoinRoom(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.FIND_AND_JOIN_ROOM, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      yield put({
        type: ACTIONS.USER.FIND_AND_JOIN_ROOM,
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

export function* inviteToRoom(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.INVITE_TO_ROOM, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* inviteEmail(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.INVITE_EMAIL, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* customizedPersonalMessage(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.CUSTOMIZED_PERSONAL_MESSAGE, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* clearAboutMessage(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.USER.CLEAR_ABOUT_MESSAGE, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* sendMultiRecipientMessage(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.SEND_MULTIRECIPIENT_MESSAGE, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

/** SUBSCRIPTION */
export function* getNicknameSubscriptionPlan(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.USER.SUBSCRIPTION.GET_NICKNAME_SUBSCRIPTION_PLAN, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* processNicknameSubscription(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER.SUBSCRIPTION.PROCESS_NICKNAME_SUBSCRIPTION, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* removeNicknameSubscription(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.USER.SUBSCRIPTION.REMOVE_NICKNAME_SUBSCRIPTION, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}