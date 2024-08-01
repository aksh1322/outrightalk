import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { User } from '../../interfaces/models/user'
import { StateExtended } from '../../interfaces/StateExtended'


export function useAppUserDetailsSelector() {
  const user: User | null = useSelector((state: StateExtended) => state.user.user)

  return user
}

export function useAppUserTokenSelector() {
  const token: string | null = useSelector((state: StateExtended) => state.user.token)

  return token
}

export function useAppUserAuthSelector() {
  const isAuth: boolean = useSelector((state: StateExtended) => state.user.isAuthenticated)

  return isAuth
}

export const useAppChangePasswordModalOpen = () => {
  const changePasswordModal = useSelector((state: StateExtended) => state.user.changePasswordModalShow)
  return changePasswordModal;
}

export const useAppShareWithContactListModalOpen = () => {
  const contactListModal = useSelector((state: StateExtended) => state.user.shareWithOtherContactListModalShow)
  return contactListModal;
}

export const useAppFindAndAddUserModalOpen = () => {
  const findAndAddUserModal = useSelector((state: StateExtended) => state.user.findAndAddUserModalShow)
  return findAndAddUserModal;
}

export const useAppSocketInstanceContainer = () => {
  const socketInstance = useSelector((state: StateExtended) => state.user.socketContainer)
  return socketInstance;
}

export const useAppLoggedinFromOtherLocation = () => {
  const loggedInOtherLocation = useSelector((state: StateExtended) => state.user.loggedInFromOtherLocation)
  return loggedInOtherLocation;
}

export const useAppMultiRecipientMessageModalOpen = () => {
  const messageModal = useSelector((state: StateExtended) => state.user.multiRecipientMessageModalShow)
  return messageModal;
}

export const useAppUserCallDetails = () => {
  const callDetails = useSelector((state: StateExtended) => state.user.callDetails)
  return callDetails;
}


export const useAppUserSendGiftTypeSelector = () => {
  const callDetails = useSelector((state: StateExtended) => state.user.sendGiftType)
  return callDetails;
}

export const useAppUserPublicSubCategoriesSelector = () => {
  const publicSubCategories = useSelector((state: StateExtended) => state.user?.publicSubCategories)
  return publicSubCategories;
}
