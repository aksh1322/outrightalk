import { ActionExtended } from 'src/_common/interfaces/ActionExtended';
import { User } from 'src/_common/interfaces/models/user';
import { ACTIONS } from 'src/_config'

export interface UserReducer {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  changePasswordModalShow: boolean;
  multiRecipientMessageModalShow: boolean;
  shareWithOtherContactListModalShow: {
    isOpen: boolean,
    url: string,
    roomId: any,
  };
  findAndAddUserModalShow: {
    isOpen: boolean,
    type: string | null,
    user_id: number | null | undefined
  };
  socketContainer: null,
  loggedInFromOtherLocation: any,
  callDetails: any,
  sendGiftType: string | null,
  // publicSubCategories: any,
}

const initialState: UserReducer = {
  user: null,
  token: null,
  isAuthenticated: false,
  changePasswordModalShow: false,
  multiRecipientMessageModalShow: false,
  shareWithOtherContactListModalShow: {
    isOpen: false,
    url: '',
    roomId: null
  },
  findAndAddUserModalShow: {
    isOpen: false,
    type: null,
    user_id: null
  },
  socketContainer: null,
  loggedInFromOtherLocation: null,
  callDetails: null,
  sendGiftType: null,
  // publicSubCategories: []
  // publicSubCategories: [
  //   {
  //     id: "1",
  //     room_category: "General",
  //     group_name: "General Category",
  //     title: "General Category",
  //     color_code: "#66545e"
  //   },
  //   {
  //     id: "1",
  //     room_category: "General",
  //     group_name: "Business & Stocks",
  //     title: "Business & Stocks",
  //     color_code: "#66545e"
  //   },
  //   {
  //     id: "2",
  //     room_category: "General",
  //     group_name: "Social Affairs & Politics",
  //     title: "Social Affairs & Politics",
  //     color_code: "#EFC3D0    "
  //   },
  //   {
  //     id: "3",
  //     room_category: "General",
  //     group_name: "Religion & Spirituality",
  //     title: "Religion & Spirituality",
  //     color_code: "#a39193"
  //   },
  //   {
  //     id: "4",
  //     room_category: "General",
  //     group_name: "Sport",
  //     title: "Sport",
  //     color_code: "#aa6f73"
  //   },
  //   {
  //     id: "5",
  //     room_category: "General",
  //     group_name: "Events",
  //     title: "Events",
  //     color_code: "#eea990"
  //   },
  //   {
  //     id: "6",
  //     room_category: "General",
  //     group_name: "Leisure Activities",
  //     title: "Leisure Activities",
  //     color_code: "#6E6A9F"
  //   },
  //   {
  //     id: "7",
  //     room_category: "General",
  //     group_name: "Movies - TV shows & Radio",
  //     title: "Movies - TV shows & Radio",
  //     color_code: "#EFC3D0"
  //   },
  //   {
  //     id: "8",
  //     room_category: "General",
  //     group_name: "Health",
  //     title: "Health",
  //     color_code: "#a39193"
  //   },
  //   {
  //     id: "9",
  //     room_category: "General",
  //     group_name: "PC & Help Desk",
  //     title: "PC & Help Desk",
  //     color_code: "#6E6A9F"
  //   },
  //   {
  //     id: "10",
  //     room_category: "General",
  //     group_name: "Fashion",
  //     title: "Fashion",
  //     color_code: "#eea990"
  //   },
  //   {
  //     id: "11",
  //     room_category: "Adult",
  //     group_name: "Adult Rooms",
  //     title: "Adult Rooms",
  //     color_code: "#6E6A9F"
  //   },
  //   {
  //     id: "12",
  //     room_category: "Restricted",
  //     group_name: "Restricted Rooms",
  //     title: "Restricted Rooms",
  //     color_code: "#6E6A9F"
  //   },
  // ]
};

const userReducer = (state = initialState, action: ActionExtended) => {
  switch (action.type) {
    case ACTIONS.USER.LOGIN:
      // console.log("USER.LOGIN")
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case ACTIONS.USER.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case ACTIONS.USER.ME:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        isAuthenticated: true,
      };
    case ACTIONS.USER.ONLINE_STATUS_CHANGE:
      // console.log("USER.ONLINE_STATUS_CHANGE")

      let tempStatus = {
        onlineStatus: action.payload
      }
      var newUser = { ...state.user, ...tempStatus }
      return {
        ...state,
        user: newUser,
      };
    case ACTIONS.USER.PROFILE:
      // console.log("USER.PROFILE")

      return {
        ...state,
        user: { ...state.user, ...action.payload },
        isAuthenticated: true,
      }
    case ACTIONS.USER.MENU.CHANGE_PASSWORD_MENU:
      return {
        ...state,
        changePasswordModalShow: action.payload
      }

    case ACTIONS.USER.SHOW_MULTI_RECIPIENT_MESSAGE_MODAL:
      return {
        ...state,
        multiRecipientMessageModalShow: action.payload
      }

    case ACTIONS.USER.SHARE_WITH_OTHER_CONTACT:
      return {
        ...state,
        shareWithOtherContactListModalShow: {
          isOpen: action.payload.isOpen,
          url: action.payload.url,
          roomId: action.payload.roomId,
        }
      }

    case ACTIONS.USER_PREFERENCE.FIND_AND_ADD_USER:
      return {
        ...state,
        findAndAddUserModalShow: {
          isOpen: action.payload.isOpen,
          type: action.payload.type,
          user_id: action.payload.user_id
        }
      }
    case ACTIONS.USER.SOCKET_INSTANCE_CONTAINER:
      return {
        ...state,
        socketContainer: action.payload
      };

    case ACTIONS.USER.MANAGE_ABOUT_MESSAGE:
      var tempUser = { ...state.user }
      // console.log("USER.MANAGE_ABOUT_MESSAGE")

      return {
        ...state,
        user: {
          ...tempUser,
          about: action.payload
        }
      }
    case ACTIONS.USER.LOGGEDIN_FROM_OTHER_LOCATION:
      return {
        ...state,
        loggedInFromOtherLocation: action.payload
      }
      break;

    case ACTIONS.USER.UPDATE_CALL_DETAILS:
      return {
        ...state,
        callDetails: action.payload
      }

    case ACTIONS.USER.SEND_GIFT_TYPE:
      return {
        ...state,
        sendGiftType: action.payload
      }
    default:
      return state;
  }
};

export default userReducer;
