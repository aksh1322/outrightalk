import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { GroupCategory, RoomCategories, RoomGroups, RoomListCategoryWise, RoomTypes, RoomDetails } from '../../interfaces/models/groupCategory'
import { StateExtended } from '../../interfaces/StateExtended'

export const useAppGroupCategorySelector = () => {
    const groupCategoryData = useSelector((state: StateExtended) => state.groupCategory.groupCategoryListing)

    return groupCategoryData
}

// room

export const useAppRoomCategorySelector = () => {
    const roomCategoryData = useSelector((state: StateExtended) => state.groupCategory.getRoomCategories)

    return roomCategoryData
}

export const useRoomAutoSaveSelector = () => {
    const autoSaveSelector = useSelector((state: StateExtended) => state.groupCategory.autoSaveChatStatus)
    return autoSaveSelector
}

export const useTextEditorSelector = () => {
    const textEditorSelector = useSelector((state: StateExtended) => state.groupCategory.textEditorSelector)
    return textEditorSelector
}

export const useAppRoomGroupsSelector = () => {
    const roomGroupData = useSelector((state: StateExtended) => state.groupCategory.getRoomGroups)

    return roomGroupData
}

export const useAppRoomListCategoryWiseSelector = () => {
    const roomListCategoryWiseData = useSelector((state: StateExtended) => state.groupCategory.roomListCategoryWise)

    return roomListCategoryWiseData
}

export const useAppRoomTypesSelector = () => {
    const roomTypesData = useSelector((state: StateExtended) => state.groupCategory.getRoomTypes)
    return roomTypesData;
}

export const useAppRoomDetailsSelector = () => {
    const roomDetailsData = useSelector((state: StateExtended) => state.groupCategory.getRoomDetails)
    return roomDetailsData;
}

export const useAppNormalUserMicHandleSelector = () => {
    const micHandleData = useSelector((state: StateExtended) => state.groupCategory.normalUserMicHandleIsChanged)
    return micHandleData;
}

export const useAppIsOpenActiveRoomSelector = () => {
    const activeRoomIsOpen = useSelector((state: StateExtended) => state.groupCategory.isOpenMyActiveRoomPopDown)
    return activeRoomIsOpen;
}

export const useAppActiveRoomsListSelector = () => {
    const activeRoomList = useSelector((state: StateExtended) => state.groupCategory.activeRoomList)
    return activeRoomList;
}

export const useAppRoomAdminControlSelector = () => {
    const roomAdminControlData = useSelector((state: StateExtended) => state.groupCategory.roomAdminControl)
    return roomAdminControlData;
}

export const useAppActiveRouteSelector = () => {
    const activeRoute = useSelector((state: StateExtended) => state.groupCategory.fromRoute)
    return activeRoute;
}

export const useAppKickedUserFromRoom = () => {
    const isKickedUser = useSelector((state: StateExtended) => state.groupCategory.kickedFromRoom)
    return isKickedUser;
}

export const useAppInstanceInvitedUsers = () => {
    const users = useSelector((state: StateExtended) => state.groupCategory.instanceInvitedUser)
    return users;
}

export const useAppDeleteRoomUsers = () => {
    const deleteRoomUsers = useSelector((state: StateExtended) => state.groupCategory.deleteRoomUsers)
    return deleteRoomUsers;
}

export const useAppCloseRoomUsers = () => {
    const closeRoomUsers = useSelector((state: StateExtended) => state.groupCategory.closeRoomUsers)
    return closeRoomUsers;
}

export const useAppUpdateRoomUserVideoUrl = () => {
    const videoUrl = useSelector((state: StateExtended) => state.groupCategory.videoUrlUpdate)
    return videoUrl;
}

export const useAppRoomMembersLargeViewSelector = () => {
    const memberLargeView = useSelector((state: StateExtended) => state.groupCategory.roomMembersLargeViewStream)
    return memberLargeView;
}

// chat

export const useAppChatDataSelectDeselect = () => {
    const chatData = useSelector((state: StateExtended) => state.groupCategory.chatDataSelectDeselect)
    return chatData;
}

export const useAppRoomChatDetailsSelector = () => {
    const roomChat = useSelector((state: StateExtended) => state.groupCategory.groupRoomChat)
    return roomChat;
}

export const useRoomChatTimestampToogleSelector = () => {
    const roomChatTimestamp = useSelector((state: StateExtended) => state.groupCategory.roomChatTimestampToogle)
    return roomChatTimestamp;
}

//Left menu item
export const useAppLeftMenuItemListSelector = () => {
    const menuItems = useSelector((state: StateExtended) => state.groupCategory.leftSidebarItems)
    return menuItems;
}

export const useAppRoomSettingModalOpen = () => {
    const roomSettingModal = useSelector((state: StateExtended) => state.groupCategory.roomSettingModalShow)
    return roomSettingModal;
}

export const useAppRoomAdminControlModalOpen = () => {
    const roomAdminControlPanelModal = useSelector((state: StateExtended) => state.groupCategory.roomAdminControlModalShow)
    return roomAdminControlPanelModal;
}

export const useAppRoomOthersMemberModalOpen = () => {
    const roomOthersMemberModal = useSelector((state: StateExtended) => state.groupCategory.roomOtherMembersModalShow)
    return roomOthersMemberModal;
}

export const useAppAmountSelector = () => {
    const amount = useSelector((state: StateExtended) => state.amount)
    return amount;
}