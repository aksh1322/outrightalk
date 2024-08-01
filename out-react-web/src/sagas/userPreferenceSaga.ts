import { call, put } from 'redux-saga/effects';
import { ACTIONS, API_URL } from 'src/_config';
import { CallApi } from './api/callApi';

export function* getAllPreferences(action: any): any {
  try {
    const data = action.payload.tab;
    var apiUrl;
    if (data) {
      apiUrl = API_URL.USER_PREFERENCE.GET_USER_ALL_PREFERENCE + '/' + data;
    }
    else {
      apiUrl = API_URL.USER_PREFERENCE.GET_USER_ALL_PREFERENCE;
    }

    const resp = yield call(CallApi.GET, apiUrl, null, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      yield put({
        type: ACTIONS.USER_PREFERENCE.GET_USER_ALL_PREFERENCE,
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

export function* saveAllPreferences(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.SAVE_USER_PREFERENCE, data, true); 

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getAutoReplyMessage(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.USER_PREFERENCE.GET_USER_AUTO_REPLY_MESSAGE, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* saveAutoReplyMessage(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.SAVE_USER_AUTO_REPLY_MESSAGE, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getAllAccount(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.USER_PREFERENCE.GET_ALL_ACCOUNT, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* deleteAccount(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.DELETE_ACCOUNT, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* restoreAccount(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.RESTORE_ACCOUNT, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getUserContactList(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.GET_USER_CONTACT_LIST, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* importContacts(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.IMPORT_CONTACTS, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}


export function* importBlocked(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.IMPORT_BLOCKED, data, true);

    console.log('blocked',resp)

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {  


      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getUserContactBlockList(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.GET_CONTACT_BLOCK_LIST_USER, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* removeAllContactFromList(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.REMOVE_ALL_CONTACT_FROM_LIST, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* removeAllBlockContactFromList(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.REMOVE_ALL_CONTACT_BLOCK_LIST, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

//#region PROFILE GALLERY
export function* uploadGalleryImage(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.UPLOAD_GALLERY_IMAGE, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getAllGalleryImage(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.USER_PREFERENCE.GET_ALL_GALLERY_IMAGE, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* deleteGalleryImage(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.DELETE_GALLERY_IMAGE, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* deleteAllGalleryImage(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.DELETE_ALL_GALLERY_IMAGE, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}


//#endregion

//Alert

export function* uploadCustomizedSound(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.UPLOAD_CUSTOMIZED_SOUND, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* deleteCustomizedSound(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.DELETE_CUSTOMIZED_SOUND, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getAllCustomizedSound(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.USER_PREFERENCE.GET_ALL_CUSTOMIZED_SOUND, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}


//Parental Control

export function* getParentalControlInfo(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.GET_PARENTAL_CONTROL_INFORMATION, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* saveParentalControlPassword(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.SAVE_PARENTAL_PREFERENCE_PASSWORD, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* deleteParentalControl(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.DELETE_PARENTAL_PREFERENCE, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* resetParentalPreferencePassword(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.RESET_PARENTAL_PREFERENCE_PASSWORD, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* parentalControlForgorPasswordOtp(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.PARENTAL_FORGOT_PASSWORD_OTP, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* setParentalControlPassword(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.PARENTAL_SET_PASSWORD, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

// Clear All Chat For Me in Preferences

export function* clearAllChatsForMe(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.USER_PREFERENCE.CLEAR_ALL_CHATS_FOR_ME, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}