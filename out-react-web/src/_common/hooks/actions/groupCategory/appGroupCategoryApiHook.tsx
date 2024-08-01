import { SAGA_ACTIONS } from "src/_config";
import {
  CreateRoom,
  GetGroupCategoryList,
  GetRoomListCategoryWise,
  GetRoomGroups,
  JoinRoomReq,
  ExitFromRoomReq,
  VerifyLockword,
  VerifyAdminCode,
  AddAsFavourite,
  RemoveFavourite,
  GetRoomDetails,
  ManageRoomTopic,
  VerifyRoomPasswordReq,
  RoomAdminListReq,
  AddRoomAdminReq,
  RemoveRoomAdminReq,
  ViewMyWebCamReq,
  // admin control
  GetAdminControlReq,
  RoomRemoveKickUserReq,
  RoomRemoveBanUserReq,
  ApplyBannedToUserReq,
  SaveAdminControlReq,
  // member
  CustomizeNickname,
  ADDToContactList,
  AddAsFavouriteContact,
  RemoveFromContactList,
  RemoveFromFavouriteContact,
  KickUserFromRoom,
  RemoveHandFromRoom,
  RaiseHandAtRoom,
  // chat
  GetChatRoomReq,
  PostChatInRoomReq,
  RaiseHandRemoveAtRoom,
  AddToBlockList,
  RemoveFromBlockList,
  UploadRoomVideo,
  AddToIgnoreList,
  RemoveFromIgnoreList,
  CameraOnOffToggle,
  RemoveAllHand,
  DisableInvitationReq,
  GiveMicToAllReq,
  RemoveAllMicReq,
  SimultaneousMicReq,
  GrabMicReq,
  LikeRoomReq,
  RemoveLikeRoomReq,
  AddUserAsFavouriteFromContact,
  InstantRoomInvite,
  ChangeuserRoomSettings,
  RoomPlayAcceptVideo,
  WhoIsViewingMyWebCam,
  RedDotForAll,
  RedDotForIndividual,
  SaveTranslationsReq,
  VerifyInviteCode,
} from "src/_common/interfaces/ApiReqRes";
import { useApiCall } from "../common/appApiCallHook";

export function useGroupCategoryApi() {
  const callApi = useApiCall();

  const getGroupCategoryList = (
    data: GetGroupCategoryList,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.GROUP_CATEGORY_LIST,
      data,
      onSuccess,
      onError
    );
  };
  //Room
  const createRoom = (
    data: CreateRoom,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.CREATE_ROOM,
      data,
      onSuccess,
      onError
    );
  };
  const createVipRoom = (
    data: CreateRoom,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.CREATE_VIP_ROOM,
      data,
      onSuccess,
      onError
    );
  };


  const getRoomListCategoryWise = (
    data: GetRoomListCategoryWise,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_LIST_CATEGORYWISE,
      data,
      onSuccess,
      onError
    );
  };

  const getRoomTypes = (onSuccess: Function, onError: Function) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_TYPES,
      null,
      onSuccess,
      onError
    );
  };

  const getRoomGroups = (
    data: GetRoomGroups,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_GROUPS,
      data,
      onSuccess,
      onError
    );
  };

  const getRoomCategory = (onSuccess: Function, onError: Function) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_CATEGORY,
      null,
      onSuccess,
      onError
    );
  };

  const getRoomLanguage = (onSuccess: Function, onError: Function) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_LANGUAGE,
      null,
      onSuccess,
      onError
    );
  };

  const joinRoom = (
    data: JoinRoomReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.JOIN_ROOM,
      data,
      onSuccess,
      onError
    );
  };

  const exitFromRoom = (
    data: ExitFromRoomReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.EXIT_FROM_ROOM,
      data,
      onSuccess,
      onError
    );
  };

  const verifyLockword = (
    data: VerifyLockword,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.VERIFY_LOCKWORD,
      data,
      onSuccess,
      onError
    );
  };

  const verifyAdminCode = (
    data: VerifyAdminCode,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.VERIFY_ADMIN_CODE,
      data,
      onSuccess,
      onError
    );
  };
  const verifyInviteCode = (
    data: VerifyInviteCode,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.VERIFY_INVITE_CODE,
      data,
      onSuccess,
      onError
    );
  };

  const getRoomDetails = (
    data: GetRoomDetails,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_DETAILS,
      data,
      onSuccess,
      onError
    );
  };

  const addAsFavourite = (
    data: AddAsFavourite,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ADD_AS_FAVOURITE,
      data,
      onSuccess,
      onError
    );
  };

  const removeFavourite = (
    data: RemoveFavourite,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.REMOVE_FAVOURITE,
      data,
      onSuccess,
      onError
    );
  };

  const likeRoom = (
    data: LikeRoomReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.LIKE_ROOM,
      data,
      onSuccess,
      onError
    );
  };
  const removeLikeRoom = (
    data: RemoveLikeRoomReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.REMOVE_LIKE_ROOM,
      data,
      onSuccess,
      onError
    );
  };

  const getMyActiveRooms = (onSuccess: Function, onError: Function) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.GET_MY_ACTIVE_ROOMS,
      null,
      onSuccess,
      onError
    );
  };

  const manageRoomTopic = (
    data: ManageRoomTopic,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.MANAGE_TOPIC,
      data,
      onSuccess,
      onError
    );
  };

  const uploadRoomVideo = (
    data: UploadRoomVideo,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.UPLOAD_ROOM_VIDEO,
      data,
      onSuccess,
      onError
    );
  };

  const roomMenuPlayVideo = (
    data: UploadRoomVideo,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_MENU_PLAY_VIDEO,
      data,
      onSuccess,
      onError
    );
  };

  const roomMenuPlayAcceptVideo = (
    data: RoomPlayAcceptVideo,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_MENU_PLAY_ACCEPT_VIDEO,
      data,
      onSuccess,
      onError
    );
  };

  const roomMenuPlayRejectVideo = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_MENU_PLAY_REJECT_VIDEO,
      data,
      onSuccess,
      onError
    );
  };

  const roomMenuPlayRemoveVideo = (
    data: RoomPlayAcceptVideo,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_MENU_PLAY_REMOVE_VIDEO,
      data,
      onSuccess,
      onError
    );
  };

  const updateRoom = (data: any, onSuccess: Function, onError: Function) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.UPDATE_ROOM,
      data,
      onSuccess,
      onError
    );
  };
  const verifyRoomPassword = (
    data: VerifyRoomPasswordReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_VERIFY_ROOM_PASSWORD,
      data,
      onSuccess,
      onError
    );
  };

  const removeAllHand = (
    data: RemoveAllHand,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.MENU.ADMIN_REMOVE_ALL_HAND,
      data,
      onSuccess,
      onError
    );
  };

  const disableInvitation = (
    data: DisableInvitationReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.MENU.ADMIN_DISABLE_INVITATION,
      data,
      onSuccess,
      onError
    );
  };

  const giveMicToAll = (
    data: GiveMicToAllReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.MENU.GIVE_MIC_TO_ALL, data, onSuccess, onError);
  };
  const removeAllMic = (
    data: RemoveAllMicReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.MENU.REMOVE_ALL_MIC, data, onSuccess, onError);
  };
  const simultaneousMic = (
    data: SimultaneousMicReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.MENU.SIMULTENIOUS_MIC, data, onSuccess, onError);
  };

  const grabMic = (
    data: GrabMicReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.MENU.GRAB_MIC, data, onSuccess, onError, false);
  };

  const roomSaveDefaultSetting = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.MENU.ROOM_SAVE_DEFAULT_SETTING,
      data,
      onSuccess,
      onError
    );
  };

  const roomUserWiseSaveDefaultSetting = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.MENU.ROOM_USER_WISE_SAVE_DEFAULT_SETTING,
      data,
      onSuccess,
      onError
    );
  };

  const roomResetDefaultSetting = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.MENU.ROOM_RESET_DEFAULT_SETTING,
      data,
      onSuccess,
      onError,
      false
    );
  };

  // new
  const deleteRoom = (data: any, onSuccess: Function, onError: Function) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.DELETE_ROOM,
      data,
      onSuccess,
      onError
    );
  };
  const roomAdminList = (
    data: RoomAdminListReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_ADMIN_LISTS,
      data,
      onSuccess,
      onError
    );
  };
  const addRoomAdmin = (
    data: AddRoomAdminReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ADD_ROOM_ADMIN,
      data,
      onSuccess,
      onError
    );
  };
  const removeRoomAdmin = (
    data: RemoveRoomAdminReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.DELETE_ROOM_ADMIN,
      data,
      onSuccess,
      onError
    );
  };

  const viewMyWebCam = (
    data: ViewMyWebCamReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.VIEW_MY_WEBCAM,
      data,
      onSuccess,
      onError,
      false
    );
  };

  const whoIsViewMyWebCam = (
    data: WhoIsViewingMyWebCam,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.WHO_IS_VIEWING_MY_WEBCAM,
      data,
      onSuccess,
      onError
    );
  };

  const redDotForAll = (
    data: RedDotForAll,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.MENU.RED_DOT_FOR_ALL, data, onSuccess, onError);
  };

  const redDotForIndividualUser = (
    data: RedDotForIndividual,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.MENU.RED_DOT_FOR_INDIVIDUAL_USER,
      data,
      onSuccess,
      onError
    );
  };

  const getAdminControl = (
    data: GetAdminControlReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_ADMIN_CONTROL,
      data,
      onSuccess,
      onError
    );
  };
  const removeUserFromKickList = (
    data: RoomRemoveKickUserReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_REMOVED_KICKED_USERS,
      data,
      onSuccess,
      onError
    );
  };
  const removeUserFromBanList = (
    data: RoomRemoveBanUserReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_REMOVED_BANNED_USERS,
      data,
      onSuccess,
      onError
    );
  };
  const applyBannedToUsers = (
    data: ApplyBannedToUserReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.APPLY_BANNED_TO_USER,
      data,
      onSuccess,
      onError
    );
  };

  const saveAdminControlSetting = (
    data: SaveAdminControlReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.SAVE_ADMIN_CONTROL_SETTING,
      data,
      onSuccess,
      onError
    );
  };

  const instantRoomInvite = (
    data: InstantRoomInvite,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.INSTANT_INVITE_AT_ROOM,
      data,
      onSuccess,
      onError
    );
  };

  const changeUserRoomSettings = (
    data: ChangeuserRoomSettings,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.MENU.CHANGE_USER_ROOM_SETTINGS,
      data,
      onSuccess,
      onError
    );
  };

  // room member
  const customizedNickname = (
    data: CustomizeNickname,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.CUSTOMIZED_NICKNAME,
      data,
      onSuccess,
      onError
    );
  };

  const addToContactList = (
    data: ADDToContactList,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ADD_TO_CONTACT_LIST,
      data,
      onSuccess,
      onError
    );
  };

  const removeFromContactList = (
    data: RemoveFromContactList,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.REMOVE_FROM_CONTACT_LIST,
      data,
      onSuccess,
      onError
    );
  };

  const addAsFavouriteContact = (
    data: AddAsFavouriteContact,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ADD_AS_FAVOURITE_CONTACT_LIST,
      data,
      onSuccess,
      onError
    );
  };

  const addUserAddFavouriteFromContact = (
    data: AddUserAsFavouriteFromContact,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ADD_USER_AS_FAVOURITE_FROM_CONTACT,
      data,
      onSuccess,
      onError
    );
  };

  const removeFavouriteContact = (
    data: RemoveFromFavouriteContact,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.REMOVE_FROM_FAVOURITE_CONTACT_LIST,
      data,
      onSuccess,
      onError
    );
  };

  const kickUserFromRoom = (
    data: KickUserFromRoom,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.KICK_USER_FROM_ROOM,
      data,
      onSuccess,
      onError
    );
  };

  const removeHandFromRoom = (
    data: RemoveHandFromRoom,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.REMOVE_HAND_FROM_ROOM,
      data,
      onSuccess,
      onError
    );
  };
  const raiseHandAtRoom = (
    data: RaiseHandAtRoom,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.RAISE_HAND_AT_ROOM,
      data,
      onSuccess,
      onError
    );
  };

  const raiseHandRemoveAtRoom = (
    data: RaiseHandRemoveAtRoom,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.RAISE_HAND_REMOVE_AT_ROOM,
      data,
      onSuccess,
      onError
    );
  };

  const addToBlockList = (
    data: AddToBlockList,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ADD_TO_BLOCK_LIST,
      data,
      onSuccess,
      onError
    );
  };

  const removeFromBlockList = (
    data: RemoveFromBlockList,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.REMOVE_FROM_BLOCK_LIST,
      data,
      onSuccess,
      onError
    );
  };

  const addToIgnoreList = (
    data: AddToIgnoreList,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.ADD_TO_IGNORE_LIST,
      data,
      onSuccess,
      onError
    );
  };

  const removeFromIgnoreList = (
    data: RemoveFromIgnoreList,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.REMOVE_FROM_IGNORE_LIST,
      data,
      onSuccess,
      onError
    );
  };

  const cameraonOffToggle = (
    data: CameraOnOffToggle,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.WEB_CAMERA_ON_OFF_TOGGLE,
      data,
      onSuccess,
      onError
    );
  };

  // Chat
  const getAllChatFromRoom = (
    data: GetChatRoomReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.CHAT.GET_ALL_CHAT_FROM_ROOM,
      data,
      onSuccess,
      onError
    );
  };
  const postChatInRoom = (
    data: PostChatInRoomReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.CHAT.POST_CHAT_IN_ROOM,
      data,
      onSuccess,
      onError
    );
  };
  const saveTranslations = (
    data: SaveTranslationsReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.CHAT.SAVE_TRANSLATIONS,
      data,
      onSuccess,
      onError
    );
  };
  const clearMyChat = (data: any, onSuccess: Function, onError: Function) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.CHAT.CLEAR_MY_CHAT,
      data,
      onSuccess,
      onError
    );
  };
  const getAllChatHistory = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.CHAT.GET_ALL_CHAT_HISTORY,
      data,
      onSuccess,
      onError
    );
  };

  //Left Menu
  const getLeftMenuItemList = (onSuccess: Function, onError: Function) => {
    callApi(
      SAGA_ACTIONS.USER.MENU.LEFT_SIDEBAR_LIST,
      null,
      onSuccess,
      onError,
      false
    );
  };

  const clearRoomChat = (data: any, onSuccess: Function, onError: Function) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.CLEAR_MY_ROOM_CHAT,
      data,
      onSuccess,
      onError
    );
  };

  const closeRoom = (data: any, onSuccess: Function, onError: Function) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.CLOSE_ROOM,
      data,
      onSuccess,
      onError
    );
  };

  const joinRoomAsAdminRoomList = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.JOIN_ROOM_AS_ADMIN_ROOM_LIST,
      data,
      onSuccess,
      onError
    );
  };

  const joinRoomAsAdminRoomVerify = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.JOIN_ROOM_ADMIN_CODE_VERIFY,
      data,
      onSuccess,
      onError
    );
  };

  const joinSimultaneouslyRoom = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.JOIN_SIMULTANEOUS_ROOM,
      data,
      onSuccess,
      onError
    );
  };

  const getRoomSubscriptionList = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.SUBSCRIPTION.SUBSCRIPTION_ROOM_LIST,
      data,
      onSuccess,
      onError
    );
  };
  const buySubscriptionRoomPlan = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.SUBSCRIPTION.SUBSCRIPTION_ROOM_BUY_PLAN,
      data,
      onSuccess,
      onError
    );
  };

  const roomSubscriptionSuccess = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.SUBSCRIPTION.SUBSCRIPTION_ROOM_SUCCESS,
      data,
      onSuccess,
      onError
    );
  };

  const removeRoomSubscription = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.SUBSCRIPTION.REMOVE_ROOM_SUBSCRIPTION,
      data,
      onSuccess,
      onError
    );
  };

  // virtual gift credit
  const getVirtualGiftCreditList = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.VIRTUAL_GIFT_CREDIT
        .VIRTUAL_GIFT_CREDIT_LIST,
      data,
      onSuccess,
      onError
    );
  };

  const buyVirtualGiftCredit = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.VIRTUAL_GIFT_CREDIT
        .VIRTUAL_GIFT_CREDIT_BUY,
      data,
      onSuccess,
      onError
    );
  };
  const buyVirtualGiftCreditSuccess = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.GROUPS_CATEGORY.VIRTUAL_GIFT_CREDIT
        .VIRTUAL_GIFT_CREDIT_BUY_SUCCESS,
      data,
      onSuccess,
      onError
    );
  };

  return {
    callGetGroupCategoryList: getGroupCategoryList,
    //room
    callCreateRoom: createRoom,
    callCreateVipRoom: createVipRoom,
    callGetRoomListCategoryWise: getRoomListCategoryWise,
    callGetRoomTypes: getRoomTypes,
    callGetRoomGroups: getRoomGroups,
    callGetRoomCategory: getRoomCategory,
    callGetRoomLanguage: getRoomLanguage,
    callJoinRoom: joinRoom,
    callExitFromRoom: exitFromRoom,
    callVerifyLockword: verifyLockword,
    callVerifyAdminCode: verifyAdminCode,
    callVerifyInviteCode: verifyInviteCode,
    callGetRoomDetails: getRoomDetails,
    callAddAsFavourite: addAsFavourite,
    callRemoveFavourite: removeFavourite,
    callLikeRoom: likeRoom,
    callRemoveLikeRoom: removeLikeRoom,
    callGetMyActiveRooms: getMyActiveRooms,
    callManageRoomTopic: manageRoomTopic,
    callUploadRoomVideo: uploadRoomVideo,
    callRoomMenuPlayVideo: roomMenuPlayVideo,
    callRoomMenuPlayAcceptVideo: roomMenuPlayAcceptVideo,

    callRoomMenuPlayRejectVideo: roomMenuPlayRejectVideo,
    callRoomMenuPlayRemoveVideo: roomMenuPlayRemoveVideo,

    callUpdateRoom: updateRoom,
    callVerifyRoomPassword: verifyRoomPassword,
    callRemoveAllHand: removeAllHand,
    callDisableInvitation: disableInvitation,
    callGiveMicToAll: giveMicToAll,
    callRemoveAllMic: removeAllMic,
    callSimultaneousMic: simultaneousMic,
    callGrabMic: grabMic,
    callRoomSaveDefaultSetting: roomSaveDefaultSetting,
    callRoomUserWiseSaveDefaultSetting: roomUserWiseSaveDefaultSetting,
    callRoomResetDefaultSetting: roomResetDefaultSetting,
    callDeleteRoom: deleteRoom,
    callRoomAdminList: roomAdminList,
    callAddRoomAdmin: addRoomAdmin,
    callRemoveRoomAdmin: removeRoomAdmin,
    callViewMyWebCam: viewMyWebCam,
    callWhoIsViewMyWebCam: whoIsViewMyWebCam,

    // adminControl
    callGetAdminControl: getAdminControl,
    callRemoveUserFromKickList: removeUserFromKickList,
    callRemoveUserFromBanList: removeUserFromBanList,
    callApplyBannedToUsers: applyBannedToUsers,
    callSaveAdminControlSetting: saveAdminControlSetting,
    callInstantRoomInvite: instantRoomInvite,
    callChangeUserRoomSettings: changeUserRoomSettings,
    callRedDotForAll: redDotForAll,
    callRedDotForIndividualUser: redDotForIndividualUser,
    // room member
    callCustomizedNickname: customizedNickname,
    callAddtoContactList: addToContactList,
    callRemoveFromContactList: removeFromContactList,
    callAddAsFavouriteContact: addAsFavouriteContact,
    callAddUserAsFavouriteFromContact: addUserAddFavouriteFromContact,
    callRemoveFavouriteContact: removeFavouriteContact,
    callKickUserFromRoom: kickUserFromRoom,
    callRemoveHandFromRoom: removeHandFromRoom,
    callRaiseHandAtRoom: raiseHandAtRoom,
    callRaiseHandRemoveAtRoom: raiseHandRemoveAtRoom,
    callAddToBlockList: addToBlockList,
    callRemoveFromBlockList: removeFromBlockList,
    callAddToIgnoreList: addToIgnoreList,
    callRemoveFromIgnoreList: removeFromIgnoreList,
    callCameraonOffToggle: cameraonOffToggle,

    // chat
    callGetAllChatFromRoom: getAllChatFromRoom,
    callPostChatInRoom: postChatInRoom,
    callClearMyChat: clearMyChat,
    callGetAllChatHistory: getAllChatHistory,
    callSaveTranslations: saveTranslations,
    //left menu
    callLeftMenuItemsList: getLeftMenuItemList,
    callClearRoomChat: clearRoomChat,
    callCloseRoom: closeRoom,
    callJoinRoomAsAdminRoomList: joinRoomAsAdminRoomList,
    callJoinRoomAsAdminRoomVerify: joinRoomAsAdminRoomVerify,

    callJoinSimultaneouslyRoom: joinSimultaneouslyRoom,
    callGetRoomSubscriptionList: getRoomSubscriptionList,
    callBuySubscriptionRoomPlan: buySubscriptionRoomPlan,
    callRoomSubscriptionSuccess: roomSubscriptionSuccess,
    callRemoveRoomSubscription: removeRoomSubscription,

    callGetVirtualGiftCreditList: getVirtualGiftCreditList,
    callBuyVirtualGiftCredit: buyVirtualGiftCredit,
    callBuyVirtualGiftCreditSuccess: buyVirtualGiftCreditSuccess,
  };
}
