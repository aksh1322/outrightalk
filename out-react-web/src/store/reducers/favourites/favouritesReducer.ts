import { ActionExtended } from 'src/_common/interfaces/ActionExtended';
import { ACTIONS, LEFT_SIDEBAR_SOCKET_TYPE, ROOM_DETAILS_SOCKET_TYPE, sort_by } from 'src/_config'


export interface FavouritesReducer {
  roomList: any;
  favouriteFolderList: any;
  favouriteRoomList: any[];
  roomFavouriteFolderList:any[];
}

const initialState: FavouritesReducer = {
  roomList: null,
  favouriteFolderList: null,
  favouriteRoomList: [],
  roomFavouriteFolderList:[]
};

const favouritesReducer = (state = initialState, action: ActionExtended) => {

  switch (action.type) {
    case ACTIONS.FAVOURITE_MENU.GET_ROOM_LIST:
      return {
        ...state,
        roomList: action.payload
      };
    case ACTIONS.FAVOURITE_MENU.GET_FAVOURITE_FOLDER_LIST:
      return {
        ...state,
        favouriteFolderList: action.payload
      };

    case ACTIONS.FAVOURITE_MENU.LIST_OF_FAVOURITES_ROOM:
      return {
        ...state,
        favouriteRoomList: action.payload
      }
    case ACTIONS.FAVOURITE_MENU.ROOM_FAVOURITES_FOLDER_LIST:
      return {
        ...state,
        roomFavouriteFolderList: action.payload
      }
    default:
      return state;
  }
};

export default favouritesReducer;
