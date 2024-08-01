import { useDispatch } from 'react-redux'
import { ACTIONS } from '../../../../_config'

export function useAppFavouritesAction() {

  const dispatch = useDispatch()

  const getRoomList = (data:number) => {
    dispatch({
      type: ACTIONS.FAVOURITE_MENU.GET_ROOM_LIST,
      payload: data,
    })
  }

  const getFavouriteFolderList = (data:number) => {
    dispatch({
      type: ACTIONS.FAVOURITE_MENU.GET_FAVOURITE_FOLDER_LIST,
      payload: data,
    })
  }

  return {
    getRoomList,
    getFavouriteFolderList,
  }
}