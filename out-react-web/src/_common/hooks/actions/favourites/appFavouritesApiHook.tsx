import { SAGA_ACTIONS } from 'src/_config'
import { } from 'src/_common/interfaces/ApiReqRes'
import { useApiCall } from '../common/appApiCallHook'

export function useFavouritesApi() {

  const callApi = useApiCall()

  const getMyRooms = (onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.FAVOURITE_MENU.MY_ROOM, null, onSuccess, onError);
  }

  const getMyFavouriteRooms = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.FAVOURITE_MENU.MY_FAVOURITE_ROOM, data, onSuccess, onError);
  }

  const getFavouriteFolders = (onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.FAVOURITE_MENU.FAVOURITE_FOLDER_LIST, null, onSuccess, onError);
  }

  const createFavouriteFolder = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.FAVOURITE_MENU.CREATE_FAVOURITE_FOLDER, data, onSuccess, onError);
  }

  const assignRoomToFolder = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.FAVOURITE_MENU.ASSIGN_ROOM_TO_FOLDER, data, onSuccess, onError);
  }

  const renameRoomName = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.FAVOURITE_MENU.RENAME_ROOM_NAME, data, onSuccess, onError);
  }

  const deleteFavouriteFolder = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.FAVOURITE_MENU.DELETE_FAVOURITE_FOLDER, data, onSuccess, onError);
  }

  const getFavouriteRoomsList = (onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.FAVOURITE_MENU.LIST_OF_FAVOURITES_ROOM, null, onSuccess, onError);
  }

  const getRoomFavouriteFoldersList = (onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.FAVOURITE_MENU.ROOM_FAVOURITES_FOLDER_LIST, null, onSuccess, onError);
  }
  return {
    callGetMyRooms: getMyRooms,
    callGetMyFavouriteRooms: getMyFavouriteRooms,
    callGetFavouriteFolders: getFavouriteFolders,
    callCreateFavouriteFolder: createFavouriteFolder,
    callAssignRoomToFolder: assignRoomToFolder,
    callRenameRoomName: renameRoomName,
    callDeleteFavouriteFolder: deleteFavouriteFolder,
    callGetFavouriteRoomsList: getFavouriteRoomsList,
    callGetRommFavouriteFoldersList:getRoomFavouriteFoldersList
  }
}