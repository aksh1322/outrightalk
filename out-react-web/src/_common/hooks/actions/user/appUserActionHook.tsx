import { useDispatch } from "react-redux";
import { ACTIONS } from "../../../../_config";

export function useAppUserAction() {
  const dispatch = useDispatch();

  const loggedIn = (userData: Object, userToken: string) => {
    console.log("dispatch loggedIn");
    dispatch({
      type: ACTIONS.USER.LOGIN,
      payload: {
        user: userData,
        token: userToken,
      },
    });
  };

  const logout = () => {
    console.log("dispatch");
    dispatch({
      type: ACTIONS.USER.LOGOUT,
    });
  };

  const updateCallDetailsAction = (body: any) => {
    dispatch({
      type: ACTIONS.USER.UPDATE_CALL_DETAILS,
      payload: body,
    });
  };

  const onlineStatusToggle = (status: any) => {
    dispatch({
      type: ACTIONS.USER.ONLINE_STATUS_CHANGE,
      payload: status,
    });
  };

  const showChangePasswordModal = (isOpen: boolean) => {
    dispatch({
      type: ACTIONS.USER.MENU.CHANGE_PASSWORD_MENU,
      payload: isOpen,
    });
  };

  const showShareWithOtherContactListModal = (
    isOpen: boolean,
    url: string,
    roomId: any
  ) => {
    dispatch({
      type: ACTIONS.USER.SHARE_WITH_OTHER_CONTACT,
      payload: {
        isOpen,
        url,
        roomId,
      },
    });
  };

  const showFindAndAddUserModal = (
    isOpen: boolean,
    type: string | null,
    user_id: number | null | undefined
  ) => {
    dispatch({
      type: ACTIONS.USER_PREFERENCE.FIND_AND_ADD_USER,
      payload: {
        isOpen,
        type,
        user_id,
      },
    });
  };

  const socketInstanceContainer = (socketInstance: any) => {
    dispatch({
      type: ACTIONS.USER.SOCKET_INSTANCE_CONTAINER,
      payload: socketInstance,
    });
  };

  const manageAboutMessage = (data: any) => {
    dispatch({
      type: ACTIONS.USER.MANAGE_ABOUT_MESSAGE,
      payload: data,
    });
  };

  const loggedInFromOtherLocation = (data: any) => {
    dispatch({
      type: ACTIONS.USER.LOGGEDIN_FROM_OTHER_LOCATION,
      payload: data,
    });
  };

  const showMultiRecipientMessageModal = (isOpen: boolean) => {
    dispatch({
      type: ACTIONS.USER.SHOW_MULTI_RECIPIENT_MESSAGE_MODAL,
      payload: isOpen,
    });
  };

  const updateSendGiftTypeAction = (data: any) => {
    dispatch({
      type: ACTIONS.USER.SEND_GIFT_TYPE,
      payload: data,
    });
  };

  return {
    loggedIn,
    logout,
    onlineStatusToggle,
    showChangePasswordModal,
    showShareWithOtherContactListModal,
    showFindAndAddUserModal,
    socketInstanceContainer,
    manageAboutMessage,
    loggedInFromOtherLocation,
    showMultiRecipientMessageModal,
    updateCallDetailsAction,
    updateSendGiftTypeAction,
  };
}
