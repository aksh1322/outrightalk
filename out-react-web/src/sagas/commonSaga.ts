import { call,put } from 'redux-saga/effects';
import { ACTIONS,API_URL } from '../_config';
import { CallApi } from './api/callApi';

export function* getGenderList(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.COMMON.GENDER_LIST, data, false);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getCountryList(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.COMMON.COUNTRY_LIST, data, false);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getSecretQuestion(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.COMMON.SECRET_QUESTION_LIST, data, false);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getOnlineOfflineCOntactList(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.ONLINE_OFFLINE_CONTACT_LIST, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getStickerCategories(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.CHAT_STICKER_CATEGORIES, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getAllStickerCategorywise(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.GET_CATEGORYWISE_ALL_STICKER, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getGiftedSubscription(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.GIFT_SUBSCRIPTION, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}
export function* sendVirtualCredit(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.GIFT_VIRTUAL_CREDIT, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* switchNicknameSubscription(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.SWITCH_NICKNAME_SUBSCRIPTION, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* switchRoomSubscription(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.SWITCH_ROOM_SUBSCRIPTION, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getBadegeDetails(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.COMMON.GET_BADGE_DETAILS, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getAwardedBadges(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.COMMON.GET_AWARDED_BADGES, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* acceptPoints(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.ACCEPT_POINTS, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* rejectPoints(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.REJECT_POINTS, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* sharePointsNotify(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.SHARE_POINTS_NOTIFY, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}


export function* getWalletDetails(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.COMMON.GET_WALLET_DETAILS, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* redeemPoints(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.REDEEM_POINTS, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}



export function* buySticker(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.STICKER_BUY, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* buyPack(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.PACK_BUY, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* myOwnSticker(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.COMMON.STICKER_OWN, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* sendStickerGift(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.STICKER_GIFT_PURCHASE, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}


export function* sendPackAsGift(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.SEND_PACK_AS_GIFT, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* cmsContent(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.CMS, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* saveRoomChat(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.SAVE_ROOM_CHAT, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      yield put({
        type: ACTIONS.USER.GROUPS_CATEGORY.CHAT.AUTOSAVE_STATUS,
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

export function* getAutosaveStatus(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.AUTOSAVE_STATUS, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      yield put({
        type: ACTIONS.USER.GROUPS_CATEGORY.CHAT.AUTOSAVE_STATUS,
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

export function* getUserCredits(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.COMMON.GET_USER_CREDITS, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}
export function* getTranslationChars(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.COMMON.GET_USER_TRANSLATION, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getTranslationLanguages(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.COMMON.GET_TRANSLATION, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* deductUserCredits(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.DEDUCT_USER_CREDITS, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* createChannel(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.CREATE_CHANNEL, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}



// CREATE_CHANNEL
export function* PostTranslationLanguage(action: any): any {
  console.log("post api called for translation language");
  
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.SAVE_TRANSLATION, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}
export function* purchaseTranslations(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.PURCHASE_TRANSLATION, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}
export function* redeemTranslations(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.COMMON.REDEEM_TRANSLATION, data, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}