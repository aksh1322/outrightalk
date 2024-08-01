import { useDispatch } from 'react-redux'
import { ACTIONS } from 'src/_config'

export function useAppGroupCategoryAction() {

  const dispatch = useDispatch()


  const emptyRoomDetails = () => {
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_DETAILS,
      payload: null,
    })
  }

  const emptyRoomListCategoryWise = () => {
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.ROOM_LIST_CATEGORYWISE,
      payload: null,
    })
  }


  const activeRoomsPopDownHandler = (isOpen: boolean) => {
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.MY_ACTIVE_ROOMS_ISOPEN_HANDLER,
      payload: isOpen,
    })
  }

  const fromRouteHandler = (formRoute: any) => {
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.MY_ACTIVE_ROOMS_FROM_ROUTE,
      payload: formRoute,
    })
  }

  const pushSocketDataToRoomChat = (socketData: any, userId: number) => {
    var params = {
      socketData: socketData,
      userId: userId,
    }
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.CHAT.GET_SOCKET_DATA_AND_PUSH_TO_CHAT_LIST,
      payload: params
    })
  }

  const pushSocketDataToLeftMenuItemList = (socketData: any, userId: number) => {
    var params = {
      socketData: socketData,
      userId: userId,
    }
    dispatch({
      type: ACTIONS.USER.MENU.GET_LEFT_SIDEBAR_SOCKET_DATA_AND_PUSH_TO_LIST,
      payload: params
    })
  }

  const showRoomSettingModal = (isOpen: boolean) => {
    dispatch({
      type: ACTIONS.USER.MENU.ROOM_SETTING_MENU,
      payload: isOpen,
    })
  }

  const showRoomAdminControlModal = (isOpen: boolean) => {
    dispatch({
      type: ACTIONS.USER.MENU.ROOM_ADMIN_CONTROL_MENU,
      payload: isOpen,
    })
  }

  const showRoomOtherMembersModal = (isOpen: boolean) => {
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.ROOM_OTHER_MEMBERS,
      payload: isOpen,
    })
  }

  const pushSocketDataToRoomDetailsMemberSidebar = (socketData: any, userId: number) => {
    var params = {
      socketData: socketData,
      userId: userId,
    }
    dispatch({
      type: ACTIONS.USER.MENU.GET_SOCKET_DATA_AND_PUSH_TO_ROOM_DETAILS_SIDEBAR_LIST,
      payload: params
    })
  }

  //Instance invited Users data
  const pushDataAtInstanceInvitedUsers = (socketData: any, userId: number) => {
    var params = {
      socketData,
      userId
    }
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.INSTANCE_INVITE_AT_ROOM,
      payload: params
    })
  }

  //Chat data Select Deselect
  const chatDataSelectDeselect = (category: string | null) => {
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.CHAT.SELECT_DESELECT_CHAT_DATA,
      payload: category,
    })
  }

  // Below  used for nullify the kickuser reducer data - others no functionality
  const roomListCategoryWise = () => {
    const params = {}
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.ROOM_LIST_CATEGORYWISE,
      payload: params
    })
  }
  //---- END ----

  const pushSocketDataToRoomUserVideoUrl = (videoData: any) => {
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.ROOM_USER_VIDEO_URL_UPDATE,
      payload: videoData
    })
  }

  const roomMemberCamStatusUpdateFromOpentokStream = (data: any) => {
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.UPDATE_ROOM_MEMBER_CAM_STATUS_FROM_OPENTOK_STREAMS,
      payload: data
    })
  }

  const roomMembersVideoUrlEmpty = (data: any) => {
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.ROOM_USER_VIDEO_URL_EMPTY,
      payload: data
    })
  }

  const roomChatTopicUpdate = (data: any) => {
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.CHAT.UPDATE_ROOM_CHAT_TOPIC,
      payload: data
    })
  }

  const adminDisableInvitation = (data: any, userId: number) => {
    var params = {
      socketData: data,
      userId: userId,
    }
    dispatch({
      type: ACTIONS.USER.MENU.ADMIN_DISABLE_INVITATION_SOCKET,
      payload: params
    })
  }

  const roomAdminMicHandle = (data: any) => {
    dispatch({
      type: ACTIONS.USER.MENU.ADMIN_MIC_MENU_HANDLE_SOCKET,
      payload: data
    })
  }

  const normalUserEnableMic = (data: any) => {
    dispatch({
      type: ACTIONS.USER.MENU.NORMAL_USER_GRAB_MIC_ENABLE_MIC_OPTION,
      payload: data
    })
  }

  const resetNormalUserMicHandleIsChanged = (data: any) => {
    dispatch({
      type: ACTIONS.USER.MENU.NORMAL_USER_MIC_HANDLE_IS_CHANGED_RESET,
      payload: data
    })
  }

  const grabAndReleaseMicrophoneChange = (data: any) => {
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.GRAB_AND_RELEASE_MIC,
      payload: data
    })
  }

  const roomChatTimestampToogle = (data: any) => {
    dispatch({
      type: ACTIONS.USER.MENU.ROOM_CHAT_TIMESTAMP_TOOGLE,
      payload: data
    })
  }
 
  const roomPlayVideo = (data: any) => {
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.ROOM_MENU_PLAY_VIDEO,
      payload: data
    })
  }

  const redDotSocketDataApply = (data: any) => {
    dispatch({
      type: ACTIONS.USER.MENU.RED_DOT_SOCKET_DATA_APPLY_TO_ALL,
      payload: data
    })
  }


  const emptyCloseRoomValues = (data: any[]) => {
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.EMPTY_CLOSE_ROOM_VALUE,
      payload: data
    })
  }

  const pushSocketDataToUpdateMember = (data: any[]) => {
    dispatch({
      type: ACTIONS.USER.GROUPS_CATEGORY.ROOM_MEMBERS_UPDATE,
      payload: data
    })
  }

  return {
    emptyRoomDetails,
    emptyRoomListCategoryWise,
    activeRoomsPopDownHandler,
    fromRouteHandler,
    pushSocketDataToRoomChat,
    pushSocketDataToLeftMenuItemList,
    showRoomSettingModal,
    showRoomAdminControlModal,
    showRoomOtherMembersModal,
    pushDataAtInstanceInvitedUsers,
    chatDataSelectDeselect,
    pushSocketDataToRoomDetailsMemberSidebar,
    roomListCategoryWise,
    pushSocketDataToRoomUserVideoUrl,
    roomMemberCamStatusUpdateFromOpentokStream,
    roomMembersVideoUrlEmpty,
    roomChatTopicUpdate,
    adminDisableInvitation,
    roomAdminMicHandle,
    normalUserEnableMic,
    resetNormalUserMicHandleIsChanged,
    grabAndReleaseMicrophoneChange,
    roomChatTimestampToogle,
    roomPlayVideo,
    redDotSocketDataApply,
    emptyCloseRoomValues,
    pushSocketDataToUpdateMember
  }
}