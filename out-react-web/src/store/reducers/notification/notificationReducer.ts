import { ActionExtended } from "src/_common/interfaces/ActionExtended";
import { ACTIONS } from "src/_config";
// import { } from 'src/_common/interfaces/models/pmWindow';

export interface NotificationReducer {
  notificationList: any[];
}

const initialState: NotificationReducer = {
  notificationList: [],
}
console.log("reducerallnotification ========<<<<<<<<<<<<", ACTIONS);


const NotificationReducer = (state = initialState, action: ActionExtended) => {
  switch (action.type) {

    //Get all Notification
    case ACTIONS.NOTIFICATION.GET_ALL_NOTIFICATION:
      return {
        ...state,
        notificationList: action.payload
            }

    //Room invitation
    case ACTIONS.USER.GROUPS_CATEGORY.INSTANCE_INVITE_AT_ROOM:
      let invitedUsers = state.notificationList;
      var { socketData, userId } = action.payload;
           
      var filterData =
        socketData && socketData.user && socketData.user.length
          ? socketData.user.filter((x: any) => x.to_user_id === userId)
          : [];
      if (filterData && filterData.length) {
        invitedUsers.unshift(filterData[0]);
      }

      return {
        ...state,
        notificationList: invitedUsers.map((x: any) => Object.assign(x)),
      };

    //Remove single notification

    case ACTIONS.NOTIFICATION.REMOVE_NOTIFICATION_SINGLE:
      var { notificationId } = action.payload;
      let notificationListDetails = state.notificationList;

      let foundIndex =
        notificationListDetails && notificationListDetails.length
          ? notificationListDetails.findIndex(
              (x: any) => x.id == notificationId
            )
          : -1;

      if (foundIndex >= 0) {
        notificationListDetails.splice(foundIndex, 1);
      }

      return {
        ...state,
        notificationList: notificationListDetails.map((x: any) =>
          Object.assign(x)
        ),
      };

    default:
      return state;
  }
};

export default NotificationReducer;
