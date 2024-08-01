import { ActionExtended } from "src/_common/interfaces/ActionExtended";
import {
  ACTIONS,
  LEFT_SIDEBAR_SOCKET_TYPE,
  ROOM_DETAILS_SOCKET_TYPE,
  sort_by,
  ADMIN_ROOM_MENU_SOCKET_TYPE,
} from "src/_config";
import {
  GroupCategory,
  RoomCategories,
  RoomGroups,
  RoomListCategoryWise,
  RoomTypes,
  ActiveRoom,
} from "src/_common/interfaces/models/groupCategory";
export interface GroupCategoryReducer {
  groupCategoryListing: GroupCategory | null;
  roomListCategoryWise: RoomListCategoryWise | null;
  getRoomTypes: RoomTypes | null;
  getRoomGroups: any;
  getRoomCategories: RoomCategories | null;
  getRoomDetails: any;
  isOpenMyActiveRoomPopDown: boolean;
  activeRoomList: ActiveRoom[] | null;
  fromRoute: any;
  groupRoomChat: any;
  leftSidebarItems: any;
  roomSettingModalShow: boolean;
  roomAdminControlModalShow: boolean;
  roomAdminControl: any;
  roomOtherMembersModalShow: boolean;
  kickedFromRoom: any;
  videoUrlUpdate: any;
  deleteRoomUsers: any[];
  closeRoomUsers: any[];
  roomMembersLargeViewStream: any[];
  normalUserMicHandleIsChanged: boolean;
  instanceInvitedUser: any[];
  chatDataSelectDeselect: any;
  roomChatTimestampToogle: boolean;
  autoSaveChatStatus: any;
  textEditorSelector: boolean;
}

const initialState: GroupCategoryReducer = {
  groupCategoryListing: null,
  roomListCategoryWise: null,
  getRoomTypes: null,
  getRoomGroups: null,
  getRoomCategories: null,
  getRoomDetails: null,
  isOpenMyActiveRoomPopDown: false,
  activeRoomList: null,
  fromRoute: null,
  groupRoomChat: [],
  leftSidebarItems: null,
  roomSettingModalShow: false,
  roomAdminControlModalShow: false,
  roomAdminControl: null,
  roomOtherMembersModalShow: false,
  kickedFromRoom: null,
  videoUrlUpdate: null,
  deleteRoomUsers: [],
  closeRoomUsers: [],
  roomMembersLargeViewStream: [],
  normalUserMicHandleIsChanged: false,
  instanceInvitedUser: [],
  chatDataSelectDeselect: null,
  roomChatTimestampToogle: false,
  autoSaveChatStatus: null,
  textEditorSelector: false,
};

const sortAlphabetically = (temp: any) => {
  if (
    temp &&
    temp.user &&
    temp.user.room_user_settings &&
    temp.user.room_user_settings.nickname_alphabetically
  ) {
    temp.members.sort((a: any, b: any) => {
      let fa =
          a.customize_nickname && a.customize_nickname.nickname
            ? a.customize_nickname.nickname
            : a.details.username.toLowerCase(),
        fb =
          b.customize_nickname && b.customize_nickname.nickname
            ? b.customize_nickname.nickname
            : b.details.username.toLowerCase();
      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });
    return temp;
  } else {
    return temp;
  }
};

const groupCategoryReducer = (state = initialState, action: ActionExtended) => {
  switch (action.type) {
    case ACTIONS.USER.GROUPS_CATEGORY.GROUP_CATEGORY_LIST:
      return {
        ...state,
        groupCategoryListing: action.payload,
      };
    case ACTIONS.USER.GROUPS_CATEGORY.ROOM_LIST_CATEGORYWISE:
      return {
        ...state,
        roomListCategoryWise: action.payload,
        kickedFromRoom: null,
        deleteRoomUsers: [],
        closeRoomUsers: [],
      };
    case ACTIONS.USER.GROUPS_CATEGORY.EMPTY_CLOSE_ROOM_VALUE:
      return {
        ...state,
        closeRoomUsers: [],
      };
    case ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_TYPES:
      return {
        ...state,
        getRoomTypes: action.payload,
      };
    case ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_GROUPS:
      return {
        ...state,
        getRoomGroups: action.payload,
      };
    case ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_CATEGORY:
      return {
        ...state,
        getRoomCategories: action.payload,
      };

    case ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_DETAILS:
      var temp = action.payload;
      // var tempsortData = sortAlphabetically(temp)
      var sortData = sortAlphabetically(temp);
      // var sortData = tempsortData&&tempsortData.members&&tempsortData.members.length?tempsortData.members.sort(sort_by('is_raise_hand', true, parseInt)):[]

      return {
        ...state,
        getRoomDetails: {
          ...sortData,
          members:
            sortData && sortData.members && sortData.members.length
              ? sortData.members.map((x: any) => Object.assign(x))
              : [],
        },
      };

    case ACTIONS.USER.GROUPS_CATEGORY.ROOM_MEMBERS_UPDATE:
      let updatedMembers = state.getRoomDetails.members.map((m: any) => {
        let elm = action.payload.filter((u: any) => u.user_id == m.user_id)[0];

        if (elm) {
          m.video_stream_id = elm.video_stream_id;
          m.is_cemera = elm.is_cemera;
        }

        return m;
      });

      updatedMembers.sort(sort_by("is_cemera", true, parseInt));
      return {
        ...state,
        getRoomDetails: {
          ...state.getRoomDetails,
          members: updatedMembers,
        },
      };

    //Instance Invited Users Data
    case ACTIONS.USER.GROUPS_CATEGORY.INSTANCE_INVITE_AT_ROOM:
      let invitedUsers = { ...state.instanceInvitedUser };
      var { socketData, userId } = action.payload;

      invitedUsers =
        socketData && socketData.user && socketData.user.length
          ? socketData.user.map((x: any) => x)
          : [];

      return {
        ...state,
        instanceInvitedUser: invitedUsers,
      };

    // Room Details Members Sidebar Remove Hand & Kick User Socket Action
    case ACTIONS.USER.MENU
      .GET_SOCKET_DATA_AND_PUSH_TO_ROOM_DETAILS_SIDEBAR_LIST:
      let roomDetailsMembersTemp = { ...state.getRoomDetails };
      let kickedUserData = { ...state.kickedFromRoom };
      let deleteRoomUsersData = { ...state.deleteRoomUsers };
      let closeRoomUsersData = { ...state.closeRoomUsers };
      var { socketData, userId } = action.payload;

      let roomDetailsMembers = sortAlphabetically(roomDetailsMembersTemp);

      let member_index: number =
        roomDetailsMembers &&
        roomDetailsMembers.members &&
        roomDetailsMembers.members.length
          ? roomDetailsMembers.members.findIndex(
              (x: any) => x.user_id == socketData.user_id
            )
          : -1;

      switch (socketData.type) {
        case ROOM_DETAILS_SOCKET_TYPE.REMOVE_USER_HAND:
          if (member_index >= 0) {
            roomDetailsMembers.members[member_index].is_raise_hand =
              socketData.is_raise_hand;
            roomDetailsMembers.members.sort(
              sort_by("is_raise_hand", true, parseInt)
            );
          } else {
            roomDetailsMembers.user.room_user_status.is_raise_hand =
              socketData.is_raise_hand;
            roomDetailsMembers.members.sort(
              sort_by("is_raise_hand", true, parseInt)
            );
          }
          if (socketData.user_id == userId) {
            roomDetailsMembers.user.room_user_status.is_raise_hand =
              socketData.is_raise_hand;
          }
          break;

        case ROOM_DETAILS_SOCKET_TYPE.RAISE_USER_HAND:
          if (member_index >= 0) {
            roomDetailsMembers.members[member_index].is_raise_hand =
              socketData.is_raise_hand;
            // roomDetailsMembers.members.sort((a: any, b: any) => b.is_raise_hand - a.is_raise_hand);
            roomDetailsMembers.members.sort(
              sort_by("is_raise_hand", true, parseInt)
            );
          }
          if (socketData.user_id == userId) {
            roomDetailsMembers.user.room_user_status.is_raise_hand =
              socketData.is_raise_hand;
          }

          break;

        case ROOM_DETAILS_SOCKET_TYPE.KICK_USER_FROM_ROOM:
          kickedUserData = socketData;

          let kicked_member_index: number =
            roomDetailsMembers.members.findIndex(
              (x: any) => x.user_id == (socketData && socketData.user_id)
            );
          if (typeof socketData == "object" && socketData !== null) {
            if (kicked_member_index >= 0) {
              roomDetailsMembers.members.splice(kicked_member_index, 1);
            }
          }

          break;

        case ROOM_DETAILS_SOCKET_TYPE.EXIT_ROOM:
          let exit_member_index: number;
          for (const [key] of Object.entries(socketData)) {
            // eslint-disable-next-line
            exit_member_index = roomDetailsMembers?.members.findIndex(
              (x: any) => x.user_id == socketData[key].user_id
            );
            if (
              typeof socketData[key] == "object" &&
              socketData[key] !== null
            ) {
              if (exit_member_index >= 0) {
                roomDetailsMembers.members.splice(exit_member_index, 1);
              }
            }
          }

          break;

        case ROOM_DETAILS_SOCKET_TYPE.JOIN_ROOM:
          if (
            roomDetailsMembers &&
            roomDetailsMembers.room &&
            member_index < 0 &&
            roomDetailsMembers.room.id == socketData.room_id
          ) {
            let temp = {
              ...roomDetailsMembers,
            };
            temp.members.unshift(socketData);
            roomDetailsMembers = sortAlphabetically(temp);
          }
          break;

        case ROOM_DETAILS_SOCKET_TYPE.REMOVE_ALL_HAND:
          delete socketData.type;
          if (socketData && Object.values(socketData).length) {
            let member_index: number;
            for (let [key, value] of Object.entries(socketData)) {
              member_index = roomDetailsMembers.members.findIndex(
                (x: any) => x.user_id == socketData[key].user_id
              );

              //Used for Raise hand & lower Hand button enable disable
              if (socketData[key].user_id == roomDetailsMembers.user.id) {
                if (
                  roomDetailsMembers &&
                  roomDetailsMembers.user &&
                  roomDetailsMembers.user.room_user_status &&
                  roomDetailsMembers.user.room_user_status.is_raise_hand
                ) {
                  roomDetailsMembers.user.room_user_status.is_raise_hand =
                    socketData[key].is_raise_hand;
                }
              }

              //Used for members array users remove hand
              if (member_index >= 0) {
                roomDetailsMembers.members[member_index].is_raise_hand =
                  socketData[key].is_raise_hand;
              }
            }
          }
          break;

        case ROOM_DETAILS_SOCKET_TYPE.DELETE_ROOM:
          deleteRoomUsersData =
            socketData && socketData.user.length
              ? socketData.user.map((x: any) => x)
              : [];
          let delete_member_index;
          deleteRoomUsersData.map((users: any) => {
            delete_member_index =
              roomDetailsMembers && roomDetailsMembers.members.length
                ? roomDetailsMembers.members.findIndex(
                    (x: any) =>
                      x.user_id == users.user_id && x.room_id == users.room_id
                  )
                : -1;

            if (delete_member_index >= 0) {
              roomDetailsMembers.members.splice(delete_member_index, 1);
            }
          });

          break;

        case ROOM_DETAILS_SOCKET_TYPE.ROOM_CLOSE:
          closeRoomUsersData =
            socketData && socketData.user && socketData.user.length
              ? socketData.user.map((x: any) => x)
              : [];
          let closeRoom_member_index;
          closeRoomUsersData.map((users: any) => {
            closeRoom_member_index =
              roomDetailsMembers && roomDetailsMembers.members.length
                ? roomDetailsMembers.members.findIndex(
                    (x: any) =>
                      x.user_id == users.user_id && x.room_id == users.room_id
                  )
                : -1;

            if (closeRoom_member_index >= 0) {
              roomDetailsMembers.members.splice(closeRoom_member_index, 1);
            }
          });
          break;

        default:
          break;
      }

      // var temproomDetailsMembers = sortAlphabetically(roomDetailsMembers)
      return {
        ...state,
        getRoomDetails: {
          ...roomDetailsMembers,
          members:
            roomDetailsMembers &&
            roomDetailsMembers?.members &&
            roomDetailsMembers?.members?.length
              ? roomDetailsMembers?.members?.map((x: any) => Object.assign(x))
              : [],
          user: Object.assign(roomDetailsMembers?.user),
        },
        kickedFromRoom: kickedUserData,
        deleteRoomUsers: deleteRoomUsersData,
        closeRoomUsers: closeRoomUsersData,
      };

    //Room Chat Topic Update
    case ACTIONS.USER.GROUPS_CATEGORY.CHAT.UPDATE_ROOM_CHAT_TOPIC:
      let roomDetailsTopic = { ...state.getRoomDetails || {} };
      var socketData = action.payload;

      if (roomDetailsTopic && roomDetailsTopic.room.id == socketData.room_id) {
        roomDetailsTopic.room.topic = socketData.topic;
      }

      return {
        ...state,
        getRoomDetails: {
          ...roomDetailsTopic,
          room: Object.assign(roomDetailsTopic.room),
        },
      };

    case ACTIONS.USER.GROUPS_CATEGORY.MY_ACTIVE_ROOMS_ISOPEN_HANDLER:
      return {
        ...state,
        isOpenMyActiveRoomPopDown: action.payload,
      };
    case ACTIONS.USER.GROUPS_CATEGORY.MY_ACTIVE_ROOMS_FROM_ROUTE:
      return {
        ...state,
        fromRoute: action.payload,
      };
    case ACTIONS.USER.GROUPS_CATEGORY.GET_MY_ACTIVE_ROOMS:
      return {
        ...state,
        activeRoomList:
          action.payload && action.payload.active_rooms
            ? action.payload.active_rooms
            : null,
      };

    //CHAT
    case ACTIONS.USER.GROUPS_CATEGORY.CHAT.SELECT_DESELECT_CHAT_DATA:
      return {
        ...state,
        chatDataSelectDeselect: action.payload,
      };

    case ACTIONS.USER.MENU.ROOM_CHAT_TIMESTAMP_TOOGLE:
      return {
        ...state,
        roomChatTimestampToogle: action.payload,
      };

    case ACTIONS.USER.GROUPS_CATEGORY.CHAT.GET_ALL_CHAT_FROM_ROOM:
      return {
        ...state,
        groupRoomChat: action.payload ? action.payload : [],
      };

    case ACTIONS.USER.GROUPS_CATEGORY.CHAT
      .GET_SOCKET_DATA_AND_PUSH_TO_CHAT_LIST:
      var room_Id = state.getRoomDetails?.room?.id;
      // eslint-disable-next-line
      var { socketData, userId } = action.payload;
      var prevChatData = state.groupRoomChat;
      var filterData = socketData.filter(
        (x: any) => x.view_user_id == userId && x.room_id == room_Id
      );
      if (filterData && filterData.length) {
        prevChatData.push(filterData[0]);
      }

      return {
        ...state,
        groupRoomChat: prevChatData.map((x: any) => Object.assign(x)),
      };
    case ACTIONS.USER.MENU.GET_LEFT_SIDEBAR_LIST:
      return {
        ...state,
        leftSidebarItems: action.payload,
      };

    case ACTIONS.USER.GROUPS_CATEGORY.CHAT.AUTOSAVE_STATUS:
      return {
        ...state,
        autoSaveChatStatus: action.payload,
      };

    case ACTIONS.USER.GROUPS_CATEGORY.CHAT.TEXT_EDITOR_STATUS:
      return {
        ...state,
        textEditorSelector: action.payload,
      };

    //Recent PMS List data update
    case ACTIONS.PM_WINDOW.RECENT_PMS_LIST:
      let tempRecentLeftSideItems = { ...state.leftSidebarItems };
      return {
        ...state,
        leftSidebarItems: {
          ...tempRecentLeftSideItems,
          recent_pms: action.payload,
        },
      };

    //Video Voice & Notebook count
    case ACTIONS.NOTEBOOK.VIDEO_VOICE_NOTEBOOK_COUNT:
      var { socketData, userId } = action.payload;
      let tempLeftSideItems = { ...state.leftSidebarItems };

      let foundIndex = socketData.user.findIndex((x: any) => x.id == userId);

      return {
        ...state,
        leftSidebarItems: {
          ...tempLeftSideItems,
          notebook_unread_count: socketData.user[foundIndex].unread_notbook_cnt,
          video_unread_message_cnt:
            socketData.user[foundIndex].unread_videomsg_cnt,
          voice_unread_message_cnt:
            socketData.user[foundIndex].unread_voicemail_cnt,
        },
      };
      break;

    //LEFT Menu Favourite contact, Online user, Offline user
    case ACTIONS.USER.MENU.GET_LEFT_SIDEBAR_SOCKET_DATA_AND_PUSH_TO_LIST:
      let leftItem: any = { ...state.leftSidebarItems };
      let roomMembers: any = { ...state.getRoomDetails };
      // eslint-disable-next-line
      var { socketData, userId } = action.payload;

      let online_index: number =
        leftItem && leftItem.online_users && leftItem.online_users.length
          ? leftItem.online_users.findIndex(
              (x: any) => x.contact_user_id == socketData.id
            )
          : -1;

      let offline_index: number =
        leftItem && leftItem.offline_users && leftItem.offline_users.length
          ? leftItem.offline_users.findIndex(
              (x: any) => x.contact_user_id == socketData.id
            )
          : -1;

      let favourite_contact_index: number =
        leftItem &&
        leftItem.favourite_contact &&
        leftItem.favourite_contact.length
          ? leftItem.favourite_contact.findIndex(
              (x: any) => x.contact_user_id == socketData.id
            )
          : -1;
      switch (socketData.type) {
        case LEFT_SIDEBAR_SOCKET_TYPE.CHANGE_STATUS:
          //Favourite contact Status update
          if (favourite_contact_index >= 0) {
            leftItem.favourite_contact[
              favourite_contact_index
            ].contact_user.visible_status = socketData.visible_status;
          }

          //Online & Offline User details
          if (online_index >= 0) {
            // console.log(
            //   "leftSidebarItems,online_index",
            //   leftItem.online_users.length
            // );
            localStorage.setItem(
              "online_users_length",
              leftItem.online_users.length
            );
            if (
              (socketData.visible_status == 1 ||
                socketData.visible_status == 2 ||
                socketData.visible_status == 3) &&
              socketData.is_loggedout == 0
            ) {
              leftItem.online_users[online_index].contact_user.visible_status =
                socketData.visible_status;
            } else {
              let found = leftItem.offline_users.filter(
                (user: any) => user.contact_user_id == socketData.id
              );

              if (found && found.length) {
                //Do Nothing
              } else {
                leftItem.offline_users.push(
                  leftItem.online_users[online_index]
                );

                leftItem.online_users.splice(online_index, 1);
              }
            }
          } else {
            if (offline_index >= 0) {
              leftItem.offline_users[
                offline_index
              ].contact_user.visible_status = socketData.visible_status;

              let found = leftItem.online_users.filter(
                (user: any) => user.contact_user_id == socketData.id
              );
              // console.log(
              //   "leftSidebarItems,offline_index",
              //   leftItem.online_users
              // );
              //offline -> visible 4  || islogout 1
              if (found && found.length) {
                //Do Nothing
              } else {
                if (
                  socketData.visible_status == 4 ||
                  socketData.is_loggedout == 1
                ) {
                  // leftItem.offline_users.push(leftItem.offline_users[offline_index])
                  //Do nothing
                } else {
                  leftItem.online_users.push(
                    leftItem.offline_users[offline_index]
                  );
                  leftItem.offline_users.splice(offline_index, 1);
                }
              }
            }
          }
          break;

        case LEFT_SIDEBAR_SOCKET_TYPE.ADD_CONTACT_LIST:
          if (socketData.contact_user.user_id == userId) {
            if (socketData.contact_user.is_favourite == 1) {
              leftItem.favourite_contact.push(socketData.contact_user);
            }

            if (
              online_index < 0 &&
              socketData.contact_user &&
              socketData.contact_user.contact_user &&
              (socketData.contact_user.contact_user.visible_status == 1 ||
                socketData.contact_user.contact_user.visible_status == 2 ||
                socketData.contact_user.contact_user.visible_status == 3) &&
              socketData.contact_user.contact_user.is_loggedout == 0
            ) {
              leftItem.online_users.push(socketData.contact_user);
            } else {
              leftItem.offline_users.push(socketData.contact_user);
            }
          }
          break;

        case LEFT_SIDEBAR_SOCKET_TYPE.REMOVE_CONTACT_LIST:
          let contact_index: number = leftItem.favourite_contact.findIndex(
            (x: any) =>
              x.contact_user_id == socketData.contact_user.contact_user_id
          );
          let removeContactOnlineIndex: number =
            leftItem.online_users.findIndex(
              (x: any) =>
                x.contact_user_id == socketData.contact_user.contact_user_id
            );
          let removeContactOfflineIndex: number =
            leftItem.offline_users.findIndex(
              (x: any) =>
                x.contact_user_id == socketData.contact_user.contact_user_id
            );

          if (socketData.contact_user.user_id == userId) {
            if (removeContactOnlineIndex >= 0) {
              leftItem.online_users.splice(removeContactOnlineIndex, 1);
            }

            if (removeContactOfflineIndex >= 0) {
              leftItem.offline_users.splice(removeContactOfflineIndex, 1);
            }

            if (contact_index >= 0) {
              leftItem.favourite_contact.splice(online_index, 1);
            }
          }
          break;

        case LEFT_SIDEBAR_SOCKET_TYPE.CUSTOMIZED_NICKNAME:
          let nicknameChangeOnlineIndex: number =
            leftItem.online_users.findIndex(
              (x: any) => x.contact_user_id == socketData.for_user_id
            );
          let nicknameChangeOfflineIndex: number =
            leftItem.offline_users.findIndex(
              (x: any) => x.contact_user_id == socketData.for_user_id
            );
          let nicknameChangeFavouriteContactIndex: number =
            leftItem.favourite_contact.findIndex(
              (x: any) => x.contact_user_id == socketData.for_user_id
            );

          if (socketData.user_id == userId) {
            if (nicknameChangeOnlineIndex >= 0) {
              typeof leftItem.online_users[nicknameChangeOnlineIndex]
                .customize_nickname == "object" &&
              leftItem.online_users[nicknameChangeOnlineIndex]
                .customize_nickname !== null
                ? (leftItem.online_users[
                    nicknameChangeOnlineIndex
                  ].customize_nickname.nickname = socketData.nickname)
                : (leftItem.online_users[
                    nicknameChangeOnlineIndex
                  ].customize_nickname = {
                    ...leftItem.online_users[nicknameChangeOnlineIndex]
                      .customize_nickname,
                    nickname: socketData.nickname,
                  });
            }
            if (nicknameChangeOfflineIndex >= 0) {
              typeof leftItem.offline_users[nicknameChangeOfflineIndex]
                .customize_nickname == "object" &&
              leftItem.offline_users[nicknameChangeOfflineIndex]
                .customize_nickname !== null
                ? (leftItem.offline_users[
                    nicknameChangeOfflineIndex
                  ].customize_nickname.nickname = socketData.nickname)
                : (leftItem.offline_users[
                    nicknameChangeOfflineIndex
                  ].customize_nickname = {
                    ...leftItem.offline_users[nicknameChangeOfflineIndex]
                      .customize_nickname,
                    nickname: socketData.nickname,
                  });
            }
            if (nicknameChangeFavouriteContactIndex >= 0) {
              typeof leftItem.favourite_contact[
                nicknameChangeFavouriteContactIndex
              ].customize_nickname == "object" &&
              leftItem.favourite_contact[nicknameChangeFavouriteContactIndex]
                .customize_nickname !== null
                ? (leftItem.favourite_contact[
                    nicknameChangeFavouriteContactIndex
                  ].customize_nickname.nickname = socketData.nickname)
                : (leftItem.favourite_contact[
                    nicknameChangeFavouriteContactIndex
                  ].customize_nickname = {
                    ...leftItem.favourite_contact[
                      nicknameChangeFavouriteContactIndex
                    ].customize_nickname,
                    nickname: socketData.nickname,
                  });
            }
          }
          break;

        case LEFT_SIDEBAR_SOCKET_TYPE.ADD_TO_BLOCK_LIST:
          let addBlocklistOnlineIndex: number = leftItem.online_users.findIndex(
            (x: any) => x.contact_user_id == socketData.block_user.block_user_id
          );
          let addBlocklistOfflineIndex: number =
            leftItem.offline_users.findIndex(
              (x: any) =>
                x.contact_user_id == socketData.block_user.block_user_id
            );
          let addBlocklistFavouriteContactIndex: number =
            leftItem.favourite_contact.findIndex(
              (x: any) =>
                x.contact_user_id == socketData.block_user.block_user_id
            );

          //roomMembers list is null if it is outside from room chat page
          let roomMemberIndexForAddBlock: number =
            roomMembers && roomMembers.members && roomMembers.members.length
              ? roomMembers.members.findIndex(
                  (x: any) => x.user_id == socketData.block_user.user_id
                )
              : -1;

          if (socketData.block_user.user_id == userId) {
            if (addBlocklistOnlineIndex >= 0) {
              leftItem.online_users[addBlocklistOnlineIndex].is_block = {
                ...leftItem.online_users[addBlocklistOnlineIndex].is_block,
                user_id: socketData.block_user.user_id,
                block_user_id: socketData.block_user.block_user_id,
              };
            }

            if (addBlocklistOfflineIndex >= 0) {
              leftItem.offline_users[addBlocklistOfflineIndex].is_block = {
                ...leftItem.offline_users[addBlocklistOfflineIndex].is_block,
                user_id: socketData.block_user.user_id,
                block_user_id: socketData.block_user.block_user_id,
              };
            }

            if (addBlocklistFavouriteContactIndex >= 0) {
              leftItem.favourite_contact[
                addBlocklistFavouriteContactIndex
              ].is_block = {
                ...leftItem.favourite_contact[addBlocklistFavouriteContactIndex]
                  .is_block,
                user_id: socketData.block_user.user_id,
                block_user_id: socketData.block_user.block_user_id,
              };
            }

            // if (roomMemberIndexForAddBlock >= 0) {
            //   console.log("roomMemberIndexForAddBlock", roomMemberIndexForAddBlock)
            //   roomMembers.members.splice(roomMemberIndexForAddBlock, 1)
            // }
          }

          break;

        case LEFT_SIDEBAR_SOCKET_TYPE.REMOVE_FROM_BLOCKLIST:
          let removeBlocklistOnlineIndex: number =
            leftItem.online_users.findIndex(
              (x: any) =>
                x.contact_user_id == socketData.block_user.block_user_id
            );
          let removeBlocklistOfflineIndex: number =
            leftItem.offline_users.findIndex(
              (x: any) =>
                x.contact_user_id == socketData.block_user.block_user_id
            );
          let removeBlocklistFavouriteContactIndex: number =
            leftItem.favourite_contact.findIndex(
              (x: any) =>
                x.contact_user_id == socketData.block_user.block_user_id
            );

          //roomMembers list is null if it is outside from room chat page
          let roomMemberIndexForRemoveBlock: number =
            roomMembers && roomMembers.members && roomMembers.members.length
              ? roomMembers.members.findIndex(
                  (x: any) => x.user_id == socketData.block_user.block_user_id
                )
              : -1;

          if (socketData.block_user.user_id == userId) {
            if (removeBlocklistOnlineIndex >= 0) {
              leftItem.online_users[removeBlocklistOnlineIndex].is_block = null;
            }

            if (removeBlocklistOfflineIndex >= 0) {
              leftItem.offline_users[removeBlocklistOfflineIndex].is_block =
                null;
            }

            if (removeBlocklistFavouriteContactIndex >= 0) {
              leftItem.favourite_contact[
                removeBlocklistFavouriteContactIndex
              ].is_block = null;
            }

            if (roomMemberIndexForRemoveBlock >= 0) {
              roomMembers.members[roomMemberIndexForRemoveBlock].is_block =
                null;
            }
          }
          break;

        case LEFT_SIDEBAR_SOCKET_TYPE.TOTAL_ONLINE_USERS:
          leftItem.total_online_user =
            socketData && socketData.total ? socketData.total : 0;

          break;

        case LEFT_SIDEBAR_SOCKET_TYPE.ADD_FAVOURITE_USER_FROM_CONTACT:
          //Added to favourite contact list
          if (socketData.contact_user.user_id == userId) {
            if (socketData.contact_user.is_favourite == 1) {
              leftItem.favourite_contact.push(socketData.contact_user);
            }

            //Check user is available under Online user or not, if avialble then update is_favourite key
            let onlineAvialbilityIndex: number =
              leftItem && leftItem.online_users && leftItem.online_users.length
                ? leftItem.online_users.findIndex(
                    (x: any) =>
                      x.contact_user_id ==
                      socketData.contact_user.contact_user_id
                  )
                : -1;

            if (onlineAvialbilityIndex >= 0) {
              leftItem.online_users[onlineAvialbilityIndex].is_favourite =
                socketData.contact_user.is_favourite;
            }

            //Check User is available under Offline user or not, if avialble then update is_favourite key
            let offlineAvialbilityIndex: number =
              leftItem &&
              leftItem.offline_users &&
              leftItem.offline_users.length
                ? leftItem.offline_users.findIndex(
                    (x: any) =>
                      x.contact_user_id ==
                      socketData.contact_user.contact_user_id
                  )
                : -1;

            if (offlineAvialbilityIndex >= 0) {
              leftItem.offline_users[offlineAvialbilityIndex].is_favourite =
                socketData.contact_user.is_favourite;
            }
          }

          break;

        case LEFT_SIDEBAR_SOCKET_TYPE.SHOW_PROFILE_PICTURE:
          socketData &&
            socketData.contact_list &&
            socketData.contact_list.length &&
            socketData.contact_list.map((user: any) => {
              //Favourite contact User index
              let fav_user_index: number =
                leftItem &&
                leftItem.favourite_contact &&
                leftItem.favourite_contact.length
                  ? leftItem.favourite_contact.findIndex(
                      (x: any) => x.contact_user_id == user.contact_user.id
                    )
                  : -1;

              //Online user contact index
              let online_user_index: number =
                leftItem &&
                leftItem.online_users &&
                leftItem.online_users.length
                  ? leftItem.online_users.findIndex(
                      (x: any) => x.contact_user_id == user.contact_user.id
                    )
                  : -1;

              //offline contact index
              let offline_user_index: number =
                leftItem &&
                leftItem.offline_users &&
                leftItem.offline_users.length
                  ? leftItem.offline_users.findIndex(
                      (x: any) => x.contact_user_id == user.contact_user.id
                    )
                  : -1;

              //Favourite contact user visibility on/off toggle
              if (fav_user_index >= 0) {
                leftItem.favourite_contact[fav_user_index].contact_user.avatar =
                  {
                    ...leftItem.favourite_contact[fav_user_index].contact_user
                      .avatar,
                    visible_avatar:
                      user.contact_user &&
                      user.contact_user.avatar &&
                      user.contact_user.avatar.visible_avatar
                        ? user.contact_user.avatar.visible_avatar
                        : 0,
                  };
              }

              //Online contact user visibility on/off toggle
              if (online_user_index >= 0) {
                leftItem.online_users[online_user_index].contact_user.avatar = {
                  ...leftItem.online_users[online_user_index].contact_user
                    .avatar,
                  visible_avatar:
                    user.contact_user &&
                    user.contact_user.avatar &&
                    user.contact_user.avatar.visible_avatar
                      ? user.contact_user.avatar.visible_avatar
                      : 0,
                };
              }

              //Offline contact user visibility on/off toggle
              if (offline_user_index >= 0) {
                leftItem.offline_users[offline_user_index].contact_user.avatar =
                  {
                    ...leftItem.offline_users[offline_user_index].contact_user
                      .avatar,
                    visible_avatar:
                      user.contact_user &&
                      user.contact_user.avatar &&
                      user.contact_user.avatar.visible_avatar
                        ? user.contact_user.avatar.visible_avatar
                        : 0,
                  };
              }
            });
          break;

        default:
          break;
      }

      return {
        ...state,
        leftSidebarItems: {
          ...leftItem,
          online_users:
            leftItem && leftItem.online_users && leftItem.online_users.length
              ? leftItem.online_users.map((x: any) => Object.assign(x))
              : [],
          offline_users:
            leftItem && leftItem.offline_users && leftItem.offline_users.length
              ? leftItem.offline_users.map((x: any) => Object.assign(x))
              : [],
          favourite_contact:
            leftItem &&
            leftItem.favourite_contact &&
            leftItem.favourite_contact.length
              ? leftItem.favourite_contact.map((x: any) => Object.assign(x))
              : [],
        },
        getRoomDetails: {
          ...roomMembers,
          //May be arise an issue will check later
          members:
            roomMembers && roomMembers.members && roomMembers.members.length
              ? roomMembers.members.map((x: any) => Object.assign(x))
              : [],
        },
      };
    case ACTIONS.USER.MENU.ROOM_SETTING_MENU:
      return {
        ...state,
        roomSettingModalShow: action.payload,
      };

    case ACTIONS.USER.MENU.ROOM_ADMIN_CONTROL_MENU:
      return {
        ...state,
        roomAdminControlModalShow: action.payload,
      };

    case ACTIONS.USER.GROUPS_CATEGORY.ROOM_OTHER_MEMBERS:
      return {
        ...state,
        roomOtherMembersModalShow: action.payload,
      };

    case ACTIONS.USER.GROUPS_CATEGORY.ROOM_ADMIN_CONTROL:
      return {
        ...state,
        roomAdminControl: action.payload,
      };

    case ACTIONS.USER.GROUPS_CATEGORY.ROOM_USER_VIDEO_URL_UPDATE:
      let videoData = action.payload;
      let roomData: any = { ...state.getRoomDetails };
      if (
        roomData &&
        roomData.room &&
        videoData &&
        roomData.room.id == videoData.room_id
      ) {
        let findMemberIn: number = roomData.members.findIndex(
          (x: any) => x.user_id == videoData.user_id
        );
        if (findMemberIn >= 0) {
          roomData.members[findMemberIn].is_uploadvideo = videoData;
        }
      }
      return {
        ...state,
        // videoUrlUpdate:
        getRoomDetails: {
          ...roomData,
          members: roomData.members.map((x: any) => Object.assign(x)),
        },
      };

    case ACTIONS.USER.GROUPS_CATEGORY.ROOM_USER_VIDEO_URL_EMPTY:
      let videoEmptyData = action.payload;
      let roomTempData: any = { ...state.getRoomDetails };
      if (
        roomTempData &&
        roomTempData.room &&
        videoEmptyData &&
        roomTempData.room.id == videoEmptyData.room_id
      ) {
        let findMemberIn: number = roomTempData.members.findIndex(
          (x: any) => x.user_id == videoEmptyData.user_id
        );
        if (findMemberIn >= 0) {
          roomTempData.members[findMemberIn].is_uploadvideo = null;
        }
      }
      return {
        ...state,
        getRoomDetails: {
          ...roomTempData,
          members: roomTempData.members.map((x: any) => Object.assign(x)),
        },
      };
    //update roomdetails user cam icon

    case ACTIONS.USER.GROUPS_CATEGORY
      .UPDATE_ROOM_MEMBER_CAM_STATUS_FROM_OPENTOK_STREAMS:
      let openTokStreams = action.payload;
      let roomDetails: any = { ...state.getRoomDetails };
      if (openTokStreams) {
        if (
          roomDetails &&
          roomDetails.room &&
          roomDetails.room.id == openTokStreams.roomId
        ) {
          let findMemberIndex: number = roomDetails.members.findIndex(
            (x: any) => x.user_id == openTokStreams.userId
          );
          if (findMemberIndex >= 0 && openTokStreams.changeType == "cam") {
            roomDetails.members[findMemberIndex].is_cemera =
              openTokStreams.newValue ? 1 : 0;
          }
          if (
            findMemberIndex >= 0 &&
            (openTokStreams.changeType == "camera_off" ||
              openTokStreams.changeType == "camera_on")
          ) {
            roomDetails.members[findMemberIndex].video_stream_id =
              openTokStreams.video_stream_id;
            roomDetails.members[findMemberIndex].is_cemera =
              openTokStreams.is_cemera;
          }
          if (findMemberIndex >= 0 && openTokStreams.changeType == "mic") {
            roomDetails.members[findMemberIndex].is_mic =
              openTokStreams.newValue ? 1 : 0;
          }
          if (findMemberIndex >= 0 && openTokStreams.changeType == "camMic") {
            roomDetails.members[findMemberIndex].is_cemera =
              openTokStreams.newValue ? 1 : 0;
            roomDetails.members[findMemberIndex].is_mic =
              openTokStreams.newValue ? 1 : 0;
          }
        }
      }
      return {
        ...state,
        getRoomDetails: {
          ...roomDetails,
          members:
            roomDetails && roomDetails.members && roomDetails.members.length
              ? roomDetails.members.map((x: any) => Object.assign(x))
              : [],
        },
      };

    case ACTIONS.USER.MENU.ADMIN_MIC_MENU_HANDLE_SOCKET:
      let micData = action.payload;
      let micRoomData: any = { ...state.getRoomDetails };
      if (micData) {
        if (
          micRoomData &&
          micRoomData.room &&
          micRoomData.room.id == micData.room_id
        ) {
          // switch (micData.type) {
          //   case ADMIN_ROOM_MENU_SOCKET_TYPE.GIVE_MIC_ALL:
          //     micRoomData.room_setting=micData.room_setting
          //     break;
          //   case ADMIN_ROOM_MENU_SOCKET_TYPE.REMOVE_ALL_MIC:

          //     break;
          //   case ADMIN_ROOM_MENU_SOCKET_TYPE.SIMULTANEOUS_MIC:

          //     break;
          // }
          micRoomData.room_setting = micData.room_setting;
          // micRoomData.user.room_user_status.is_mic = 0;

          // reset mic icon for all user
          // if (micRoomData && micRoomData.members && micRoomData.members.length) {
          //   for (let i = 0; i < micRoomData.members.length; i++) {
          //     if (!micRoomData.members[i].is_admin) {
          //       //only reset for normal room member
          //       micRoomData.members[i].is_mic = 0
          //     }
          //   }
          // }
        }
      }
      return {
        ...state,
        getRoomDetails: {
          ...micRoomData,
          room_setting: Object.assign(micRoomData.room_setting),
          user: Object.assign(micRoomData.user),
          members: micRoomData.members.map((x: any) => Object.assign(x)),
        },
        normalUserMicHandleIsChanged: false, //before was true
      };

    case ACTIONS.USER.MENU.NORMAL_USER_MIC_HANDLE_IS_CHANGED_RESET:
      return {
        ...state,
        normalUserMicHandleIsChanged: action.payload,
      };

    case ACTIONS.USER.MENU.NORMAL_USER_GRAB_MIC_ENABLE_MIC_OPTION:
      let grabData = action.payload;
      let grabRoomData: any = { ...state.getRoomDetails };

      // if (grabData) {
      if (
        grabRoomData &&
        grabRoomData.user &&
        grabRoomData.user.id == grabData.userId &&
        grabData.enable
      ) {
        grabRoomData.user.room_user_status.is_mic = 1;
      }
      if (
        grabRoomData &&
        grabRoomData.user &&
        grabRoomData.user.id == grabData.userId &&
        !grabData.enable
      ) {
        grabRoomData.user.room_user_status.is_mic = 0;
      }
      // }
      return {
        ...state,
        getRoomDetails: {
          ...grabRoomData,
          user: Object.assign(grabRoomData.user),
        },
      };

    case ACTIONS.USER.MENU.ADMIN_DISABLE_INVITATION_SOCKET:
      let disableInvitation = action.payload;
      let roomdata: any = { ...state.getRoomDetails };

      if (disableInvitation) {
        if (
          roomdata &&
          roomdata.room &&
          roomdata.room.id == disableInvitation.socketData.room_id
        ) {
          // let findMemberIndex: number = roomdata.members.findIndex((x: any) => x.user_id == openTokStreams.userId)

          // if (findMemberIndex >= 0) {
          //   roomdata.members[findMemberIndex].is_cemera = openTokStreams.newValue ? 1 : 0;
          // }
          if (roomdata && roomdata.room_setting) {
            roomdata.room_setting.disable_invitation =
              disableInvitation.socketData.disable_invitation;
          }
        }
      }
      return {
        ...state,
        getRoomDetails: {
          ...roomdata,
          room_setting: Object.assign(roomdata.room_setting),
        },
      };

    case ACTIONS.USER.GROUPS_CATEGORY.GRAB_AND_RELEASE_MIC:
      let grabMicData = action.payload;
      // console.log("grabMicData", grabMicData)
      let roomDetailsData: any = { ...state.getRoomDetails };
      let updatedMembers2 = [];

      if (
        grabMicData &&
        roomDetailsData &&
        roomDetailsData.room &&
        roomDetailsData.room.id == grabMicData.room_id
      ) {
        // roomDetailsData.allow_mic = grabMicData.allow_mic
        // roomDetailsData.allow_mic = 1
        if (action.payload.members) {
          updatedMembers2 = state.getRoomDetails.members.map((m: any) => {
            let elm = action.payload.members.filter(
              (u: any) => u.user_id == m.user_id
            )[0];
            if (elm) {
              m.is_mic = elm.is_mic;
            }
            return m;
          });
          updatedMembers2.sort(sort_by("is_mic", true, parseInt));
        }
      } else {
        updatedMembers2 = state.getRoomDetails.members;
      }

      return {
        ...state,
        getRoomDetails: {
          ...roomDetailsData,
          // allow_mic: roomDetailsData.allow_mic,
          ...(action.payload.members && { members: updatedMembers2 }),
        },
      };

    // return {
    //   ...state,
    //   getRoomDetails: {
    //     ...roomDetailsData,
    //     allow_mic: roomDetailsData.allow_mic
    //   }
    // }

    //play a video from room action menu
    case ACTIONS.USER.GROUPS_CATEGORY.ROOM_MENU_PLAY_VIDEO:
      let playVideoInfo = action.payload;
      let roomVideoInfo: any = { ...state.getRoomDetails };
      if (
        playVideoInfo.type == ROOM_DETAILS_SOCKET_TYPE.VIDEO_ACCEPTED &&
        playVideoInfo.video_info.room_id == roomVideoInfo.room.id
      ) {
        //when video accepted by admin ,owner
        if (roomVideoInfo.play_video && roomVideoInfo.play_video.length) {
          for (let i = 0; i < roomVideoInfo.play_video.length; i++) {
            if (roomVideoInfo.play_video[i].id == playVideoInfo.video_info.id) {
              roomVideoInfo.play_video[i] = playVideoInfo.video_info;
            }
          }
        }
      } else if (
        playVideoInfo.type == ROOM_DETAILS_SOCKET_TYPE.VIDEO_REJECTED &&
        playVideoInfo.video_info.room_id == roomVideoInfo.room.id
      ) {
        //when video rejected by admin ,owner
        if (roomVideoInfo.play_video && roomVideoInfo.play_video.length) {
          let videoIndex = roomVideoInfo.play_video.findIndex(
            (x: any) => x.id == playVideoInfo.video_info.id
          );
          if (videoIndex >= 0) {
            roomVideoInfo.play_video.splice(videoIndex, 1);
          }
        }
      } else if (
        playVideoInfo.type == ROOM_DETAILS_SOCKET_TYPE.VIDEO_REMOVED &&
        playVideoInfo.video_info.room_id == roomVideoInfo.room.id
      ) {
        //when some user remove video from list
        if (roomVideoInfo.play_video && roomVideoInfo.play_video.length) {
          let videoIndex = roomVideoInfo.play_video.findIndex(
            (x: any) => x.id == playVideoInfo.video_info.id
          );
          if (videoIndex >= 0) {
            roomVideoInfo.play_video.splice(videoIndex, 1);
          }
        }
      } else if (playVideoInfo.video_info.room_id == roomVideoInfo.room.id) {
        //when video upload push into play_video array
        roomVideoInfo.play_video.push(playVideoInfo.video_info);
      }
      return {
        ...state,
        getRoomDetails: {
          ...roomVideoInfo,
          play_video: roomVideoInfo.play_video.map((x: any) =>
            Object.assign(x)
          ),
        },
      };

    case ACTIONS.USER.MENU.RED_DOT_SOCKET_DATA_APPLY_TO_ALL:
      let redDotData = action.payload;
      let tempRoomRedDot = { ...state.getRoomDetails };

      if (
        tempRoomRedDot &&
        tempRoomRedDot.room &&
        tempRoomRedDot.room.id == parseInt(redDotData.room_id)
      ) {
        switch (redDotData.type) {
          case ADMIN_ROOM_MENU_SOCKET_TYPE.RED_DOT.RED_DOT_TO_ALL:
            //change red dot all users status to 1
            tempRoomRedDot.room_setting.red_dot_all_users = 1;
            //apply reddot for all user if user data exist into the socket data
            let isRedDotApplicable =
              redDotData.red_dot && redDotData.red_dot.length
                ? redDotData.red_dot.filter(
                    (x: any) => x.user_id == redDotData.userId
                  )
                : [];
            if (isRedDotApplicable && isRedDotApplicable.length) {
              if (
                tempRoomRedDot &&
                tempRoomRedDot.user &&
                tempRoomRedDot.user.room_user_status
              ) {
                let index = redDotData.red_dot.findIndex(
                  (z: any) => z.user_id == redDotData.userId
                );
                if (index >= 0) {
                  tempRoomRedDot.user.room_user_status =
                    redDotData.red_dot[index];
                }
              }
            }

            //members array redDot update code
            for (let i = 0; i < redDotData.red_dot.length; i++) {
              let index = tempRoomRedDot.members.findIndex(
                (z: any) => z.user_id == redDotData.red_dot[i].user_id
              );
              if (index >= 0) {
                tempRoomRedDot.members[index].red_dot_camera = 1;
                tempRoomRedDot.members[index].red_dot_mic = 1;
                tempRoomRedDot.members[index].red_dot_text = 1;
              }
            }

            break;
          case ADMIN_ROOM_MENU_SOCKET_TYPE.RED_DOT.REMOVE_RED_DOT_FROM_ALL:
            tempRoomRedDot.room_setting.red_dot_all_users = 0;
            let isRedDotApp =
              redDotData.red_dot && redDotData.red_dot.length
                ? redDotData.red_dot.filter(
                    (x: any) => x.user_id == redDotData.userId
                  )
                : [];
            if (isRedDotApp && isRedDotApp.length) {
              if (
                tempRoomRedDot &&
                tempRoomRedDot.user &&
                tempRoomRedDot.user.room_user_status
              ) {
                let index = redDotData.red_dot.findIndex(
                  (z: any) => z.user_id == redDotData.userId
                );
                if (index >= 0) {
                  tempRoomRedDot.user.room_user_status =
                    redDotData.red_dot[index];
                }
              }
            }
            //members array redDot update code
            for (let i = 0; i < redDotData.red_dot.length; i++) {
              let index = tempRoomRedDot.members.findIndex(
                (z: any) => z.user_id == redDotData.red_dot[i].user_id
              );
              if (index >= 0) {
                tempRoomRedDot.members[index].red_dot_camera = 0;
                tempRoomRedDot.members[index].red_dot_mic = 0;
                tempRoomRedDot.members[index].red_dot_text = 0;
              }
            }

            break;
          case ADMIN_ROOM_MENU_SOCKET_TYPE.RED_DOT
            .RED_DOT_UPDATE_FOR_INDIVIDUAL_USER:
            if (
              redDotData.red_dot_user &&
              redDotData.red_dot_user.user_id == redDotData.userId
            ) {
              if (
                tempRoomRedDot &&
                tempRoomRedDot.user &&
                tempRoomRedDot.user.room_user_status
              ) {
                tempRoomRedDot.user.room_user_status = redDotData.red_dot_user;
              }
            }

            //members array redDot update code
            if (
              redDotData &&
              redDotData.red_dot_user &&
              redDotData.red_dot_user.user_id
            ) {
              let index = tempRoomRedDot.members.findIndex(
                (z: any) => z.user_id == redDotData.red_dot_user.user_id
              );
              if (index >= 0) {
                tempRoomRedDot.members[index].red_dot_camera =
                  redDotData.red_dot_user.red_dot_camera;
                tempRoomRedDot.members[index].red_dot_mic =
                  redDotData.red_dot_user.red_dot_mic;
                tempRoomRedDot.members[index].red_dot_text =
                  redDotData.red_dot_user.red_dot_text;
              }
            }

            // //members array redDot update code
            // for (let i = 0; i < redDotData.red_dot.length; i++) {
            //   let index = tempRoomRedDot.members.findIndex((z: any) => z.user_id == redDotData.red_dot[i].user_id)
            //   if (index >= 0) {
            //     tempRoomRedDot.members[index].red_dot_camera = 1;
            //     tempRoomRedDot.members[index].red_dot_mic = 1;
            //     tempRoomRedDot.members[index].red_dot_text = 1;
            //   }
            // }

            break;

          default:
            break;
        }
      }

      return {
        ...state,
        getRoomDetails: {
          ...tempRoomRedDot,
          members: tempRoomRedDot.members.map((x: any) => Object.assign(x)),
          room_setting: Object.assign(tempRoomRedDot.room_setting),
          user: Object.assign(tempRoomRedDot.user),
        },
      };

    default:
      return state;
  }
};

export default groupCategoryReducer;
