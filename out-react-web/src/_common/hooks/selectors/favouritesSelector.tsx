import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { StateExtended } from '../../interfaces/StateExtended'


export function useAppRoomListSelector() {
  const roomList: any | null = useSelector((state: StateExtended) => state.favourites.roomList)

  return roomList
}

export function useAppFavouriteFolderListSelector() {
  const favouriteFolderList: any | null = useSelector((state: StateExtended) => state.favourites.favouriteFolderList)
  return favouriteFolderList
}

export function useAppFavouriteRoomListSelector() {
  const favouriteRoomList: any | null = useSelector((state: StateExtended) => state.favourites.favouriteRoomList)
  return favouriteRoomList
}

export function useAppRoomFavouriteFolderListSelector() {
  const roomFavouriteFolderList: any | null = useSelector((state: StateExtended) => state.favourites.roomFavouriteFolderList)
  return roomFavouriteFolderList
}

