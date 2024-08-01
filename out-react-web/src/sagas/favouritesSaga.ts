import { call, put } from 'redux-saga/effects';
import { ACTIONS, API_URL, SAGA_ACTIONS, STORAGE } from '../_config';
import { CallApi } from './api/callApi';

export function* getMyRooms(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.FAVOURITE_MENU.MY_ROOM, null, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {

      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getMyFavouriteRooms(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.FAVOURITE_MENU.MY_FAVOURITE_ROOM, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      yield put({
        type: ACTIONS.FAVOURITE_MENU.GET_ROOM_LIST,
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

export function* getFavouriteFolders(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.FAVOURITE_MENU.FAVOURITE_FOLDER_LIST, null, true);

    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      yield put({
        type: ACTIONS.FAVOURITE_MENU.GET_FAVOURITE_FOLDER_LIST,
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

export function* createFavouriteFolder(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.FAVOURITE_MENU.CREATE_FAVOURITE_FOLDER, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* assignRoomToFolder(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.FAVOURITE_MENU.ASSIGN_ROOM_TO_FOLDER, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* renameRoomName(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.FAVOURITE_MENU.RENAME_ROOM_NAME, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* deleteFavouriteFolder(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.POST, API_URL.FAVOURITE_MENU.DELETE_FAVOURITE_FOLDER, data, true);
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      action && action.callbackSuccess && action.callbackSuccess(resp.data);
    } else {
      action && action.callbackError && action.callbackError(resp.data);
    }
  } catch (e) {
    action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
  }
}

export function* getFavouritesRoomList(action: any): any {
  try {
    const data = action.payload;
    const resp = yield call(CallApi.GET, API_URL.FAVOURITE_MENU.LIST_OF_FAVOURITES_ROOM, null, true);
    
    if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
      yield put({
        type: ACTIONS.FAVOURITE_MENU.LIST_OF_FAVOURITES_ROOM,
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
  export function* getFavouritesFolderList(action: any): any {
    try {
      const data = action.payload;
      const resp = yield call(CallApi.GET, API_URL.FAVOURITE_MENU.ROOM_FAVOURITES_FOLDER_LIST, null, true); 
      if (resp.status >= 200 && resp.status < 300 && resp.data && resp.data) {
        yield put({
          type: ACTIONS.FAVOURITE_MENU.ROOM_FAVOURITES_FOLDER_LIST,
          payload: resp.data.data.folders
        })
  
        action && action.callbackSuccess && action.callbackSuccess(resp.data);
      } else {
        action && action.callbackError && action.callbackError(resp.data);
      }
    } catch (e) {
      action && action.callbackError && action.callbackError(e && e.data ? e.data : e);
    }
  }
