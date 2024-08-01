import { takeLatest, takeEvery, all } from 'redux-saga/effects';
import { SAGA_ACTIONS } from '../_config';

import {
  loginUser,
  getLoginModeUser,
  getUserProfile,
  logoutUser,
  registation,
  isAvailableNickName,
  forgotPasswordNickName,
  forgotPasswordQuestionAnswer,
  forgotPasswordOtp,
  forgotPasswordReset,
  updatePassword,
  updateProfileDetails,
  updateUserAvatar,
  updateVisibleStatus,
  updateShowHideProfilePicture,
  findAndAddUser,
  findNearbyUser,
  fetchUserDetails,
  updateCurrentLocation,
  findAndJoinRoom,
  inviteToRoom,
  loginCheckPassword,
  customizedPersonalMessage,
  clearAboutMessage,
  sendMultiRecipientMessage,
  getNicknameSubscriptionPlan,
  processNicknameSubscription,
  removeNicknameSubscription,
  inviteEmail,
} from './userSaga'

import {
  getGenderList,
  getCountryList,
  getSecretQuestion,
  getOnlineOfflineCOntactList,
  getStickerCategories,
  getAllStickerCategorywise,
  getBadegeDetails,
  getAwardedBadges,
  buySticker,
  myOwnSticker,
  sendStickerGift,
  cmsContent,
  getWalletDetails,
  redeemPoints,
  sharePointsNotify,
  acceptPoints,
  rejectPoints,
  saveRoomChat,
  getAutosaveStatus,
  buyPack,
  sendPackAsGift,
  getGiftedSubscription,
  switchNicknameSubscription,
  getUserCredits,
  deductUserCredits,
  switchRoomSubscription,
  getTranslationChars,
  purchaseTranslations,
  redeemTranslations,
  sendVirtualCredit,
  PostTranslationLanguage,
  getTranslationLanguages,
  createChannel
} from './commonSaga'

import {
  getAllPreferences,
  saveAllPreferences,
  getAutoReplyMessage,
  saveAutoReplyMessage,
  getAllAccount,
  deleteAccount,
  restoreAccount,
  getUserContactList,
  importContacts,
  importBlocked,
  getUserContactBlockList,
  removeAllContactFromList,
  removeAllBlockContactFromList,
  uploadGalleryImage,
  getAllGalleryImage,
  deleteGalleryImage,
  deleteAllGalleryImage,
  uploadCustomizedSound,
  getAllCustomizedSound,
  deleteCustomizedSound,
  getParentalControlInfo,
  saveParentalControlPassword,
  setParentalControlPassword,
  deleteParentalControl,
  parentalControlForgorPasswordOtp,
  resetParentalPreferencePassword,
  clearAllChatsForMe,
} from './userPreferenceSaga'

import {
  createRoom,
  getRoomGroups,
  getRoomCategory,
  getRoomTypes,
  groupCategoryList,
  roomListCategoryWise,
  getRoomLanguage,
  joinRoom,
  exitFromRoom,
  verifyLockword,
  verifyAdminCode,
  getRoomDetails,
  addAsFavourite,
  removeFavourite,
  likeRoom,
  removeLikeRoom,
  getMyActiveRooms,
  manageRoomTopic,
  updateRoom,
  verifyRoomPassword,
  deleteRoom,
  roomAdminLists,
  addRoomAdmin,
  deleteRoomAdmins,
  viewMyWebCam,
  whoIsViewingMyWebCam,
  // admincontrol
  getRoomAdminControl,
  removeKickUsers,
  removeBannedUsers,
  sendUserToBannedList,
  saveAdminControlSetting,
  webCameraOnOffToggle,
  instantInviteAtRoom,
  changeUserRoomSettings,
  // chat
  getAllChatFromRoom,
  postChatInRoom,
  clearMyChat,
  // room member 
  customizedNickname,
  addAsFavouriteContactList,
  addUserAsFavouriteFromContact,
  addToContactList,
  removeFromContactList,
  getLeftMenuItemList,
  kickUserFromRoom,
  removeFromFavouriteContactList,
  removeHandFromRoom,
  raiseHandAtRoom,
  raiseHandRemoveAtRoom,
  addToBlockList,
  addToIgnoreList,
  removeFromIgnoreList,
  removeFromBlockList,
  uploadRoomVideo,
  removeAllHandFromRoom,
  disableInvitationForRoom,
  giveMicToAll,
  removeAllMic,
  simultaneousMic,
  grabMic,
  clearMyRoomChat,
  roomMenuPlayVideo,
  roomMenuPlayAcceptVideo,
  roomMenuPlayRejectVideo,
  roomMenuPlayRemoveVideo,
  roomSaveDefaultSetting,
  roomUserWiseSaveDefaultSetting,
  roomResetDefaultSetting,
  redDotForAllUsers,
  redDotForIndividualUsers,
  closeRoom,
  joinRoomAsAdminRoomList,
  joinRoomAsAdminCodeVerify,
  joinSimultaneouslyRoom,
  getSubscriptionRoomList,
  buyRoomSubscriptionPlan,
  roomSubscriptionSuccess,
  removeRoomSubscription,
  getVirtualGiftCreditList,
  buyVirtualGiftCredit,
  virtualGiftCreditSuccess,
  getAllChatHistory,
  createVipRoom,
  saveTranslations,
  verifyInviteCode,
} from './groupCategorysaga'

import {
  isPagePasswordProtected,
  checkPassword,
  getContactList,
  sendMessage,
  getMessageList,
  deleteMessage,
  restoreMessage,
  viewMessage,
  checkAvailabilityUser,
} from './videoMessageSaga';

import {
  createNotebook,
  updateNotebook,
  shareNotebook,
  notebookDetails,
  deleteNotebook,
  removeNotebookShare,
  getNotebookList,
  notebookShareContactList,
} from './notebookSaga';

import {
  getMyRooms,
  getMyFavouriteRooms,
  getFavouriteFolders,
  createFavouriteFolder,
  assignRoomToFolder,
  renameRoomName,
  deleteFavouriteFolder,
  getFavouritesRoomList,
  getFavouritesFolderList,
} from './favouritesSaga';

import {
  sendPms,
  getPmsDetails,
  inviteInPmNotification,
  addMemberIntoPmWindow,
  getChatForPmWindow,
  sendChatForPmWindow,
  clearAllChatsInPm,
  getMyActivePmWindows,
  removeMemberFromPmWindow,
  pmCallInitiateAndDisconnect,
  showUsersLocation,
  pmCallAcceptReject,
  exitPmWindow,
  pmHeaderMenuSettingActionUpdate,
  pmHeaderMenuSaveDefaultSetting,
  pmHeaderMenuResetDefaultSetting,
  readPm,
  getDigSoundList,
  sendDigSound
} from './pmWindowSaga';

import {
  getAllNotifications,
  removeSingleNotification,
} from './notificationSaga';
import { MdImportContacts } from 'react-icons/md';

export function* sagas() {
  yield all([
    // user saga
    takeLatest(SAGA_ACTIONS.USER.LOGIN, loginUser),
    takeLatest(SAGA_ACTIONS.USER.GET_LOGIN_MODE, getLoginModeUser),
    takeLatest(SAGA_ACTIONS.USER.LOGIN_CHECK_PASSWORD, loginCheckPassword),
    takeLatest(SAGA_ACTIONS.USER.DETAILS, getUserProfile),
    takeLatest(SAGA_ACTIONS.USER.LOGOUT, logoutUser),
    takeLatest(SAGA_ACTIONS.USER.REGISTRATION, registation),
    takeLatest(SAGA_ACTIONS.USER.CHECK_NICKNAME_AVAILABLITY, isAvailableNickName),

    takeLatest(SAGA_ACTIONS.USER.FORGOT_PASSWORD_NICKNAME, forgotPasswordNickName),
    takeLatest(SAGA_ACTIONS.USER.FORGOT_PASSWORD_QUESTION_ANSWER, forgotPasswordQuestionAnswer),
    takeLatest(SAGA_ACTIONS.USER.FORGOT_PASSWORD_OTP, forgotPasswordOtp),
    takeLatest(SAGA_ACTIONS.USER.FORGOT_PASSWORD_RESET, forgotPasswordReset),
    takeLatest(SAGA_ACTIONS.USER.UPDATE_PASSWORD, updatePassword),
    takeLatest(SAGA_ACTIONS.USER.UPDATE_PROFILE_DETAILS, updateProfileDetails),
    takeLatest(SAGA_ACTIONS.USER.UPDATE_PROFILE_IMAGE, updateUserAvatar),
    takeLatest(SAGA_ACTIONS.USER.UPDATE_VISIBLE_STATUS, updateVisibleStatus),
    takeLatest(SAGA_ACTIONS.USER.SHOW_PROFILE_PICTURE, updateShowHideProfilePicture),
    takeLatest(SAGA_ACTIONS.USER.FIND_AND_ADD_USER, findAndAddUser),
    takeLatest(SAGA_ACTIONS.USER.NEAR_BY_USER, findNearbyUser),
    takeLatest(SAGA_ACTIONS.USER.FETCH_USER_DETAILS, fetchUserDetails),
    takeLatest(SAGA_ACTIONS.USER.UPDATE_CURRENT_LOCATION, updateCurrentLocation),

    takeLatest(SAGA_ACTIONS.USER.FIND_AND_JOIN_ROOM, findAndJoinRoom),
    takeLatest(SAGA_ACTIONS.USER.INVITE_TO_ROOM, inviteToRoom),
    takeLatest(SAGA_ACTIONS.USER.INVITE_EMAIL, inviteEmail),

    takeLatest(SAGA_ACTIONS.USER.CUSTOMIZED_PERSONAL_MESSAGE, customizedPersonalMessage),
    takeLatest(SAGA_ACTIONS.USER.CLEAR_ABOUT_MESSAGE, clearAboutMessage),
    takeLatest(SAGA_ACTIONS.USER.SEND_MULTIRECIPIENT_MESSAGE, sendMultiRecipientMessage),

    takeLatest(SAGA_ACTIONS.USER.SUBSCRIPTION.GET_NICKNAME_SUBSCRIPTION_PLAN, getNicknameSubscriptionPlan),
    takeLatest(SAGA_ACTIONS.USER.SUBSCRIPTION.PROCESS_NICKNAME_SUBSCRIPTION, processNicknameSubscription),
    takeLatest(SAGA_ACTIONS.USER.SUBSCRIPTION.REMOVE_NICKNAME_SUBSCRIPTION, removeNicknameSubscription),

    //Notification
    takeLatest(SAGA_ACTIONS.NOTIFICATION.GET_ALL_NOTIFICATION, getAllNotifications),
    takeLatest(SAGA_ACTIONS.NOTIFICATION.REMOVE_SINGLE_NOTIFICATION, removeSingleNotification),

    //common saga
    takeLatest(SAGA_ACTIONS.COMMON.GENDER_LIST, getGenderList),
    takeLatest(SAGA_ACTIONS.COMMON.COUNTRY_LIST, getCountryList),
    takeLatest(SAGA_ACTIONS.COMMON.SECRET_QUESTION_LIST, getSecretQuestion),
    takeLatest(SAGA_ACTIONS.COMMON.ONLINE_OFFLINE_CONTACT_LIST, getOnlineOfflineCOntactList),

    takeLatest(SAGA_ACTIONS.COMMON.CHAT_STICKER_CATEGORIES, getStickerCategories),
    takeLatest(SAGA_ACTIONS.COMMON.GET_CATEGORYWISE_ALL_STICKER, getAllStickerCategorywise),
    takeLatest(SAGA_ACTIONS.COMMON.GIFT_SUBSCRIPTION, getGiftedSubscription),
    takeLatest(SAGA_ACTIONS.COMMON.GIFT_VIRTUAL_CREDIT, sendVirtualCredit),
    takeLatest(SAGA_ACTIONS.COMMON.SWITCH_NICKNAME_SUBSCRIPTION, switchNicknameSubscription),
    takeLatest(SAGA_ACTIONS.COMMON.SWITCH_ROOM_SUBSCRIPTION, switchRoomSubscription),

    takeLatest(SAGA_ACTIONS.COMMON.GET_WALLET_DETAILS, getWalletDetails),
    takeLatest(SAGA_ACTIONS.COMMON.REDEEM_POINTS, redeemPoints),

    takeLatest(SAGA_ACTIONS.COMMON.GET_BADGE_DETAILS, getBadegeDetails),
    takeLatest(SAGA_ACTIONS.COMMON.GET_AWARDED_BADGES, getAwardedBadges),
    
    takeLatest(SAGA_ACTIONS.COMMON.ACCEPT_POINTS, acceptPoints),
    takeLatest(SAGA_ACTIONS.COMMON.REJECT_POINTS, rejectPoints),
    takeLatest(SAGA_ACTIONS.COMMON.SHARE_POINTS_NOTIFY, sharePointsNotify),



    takeLatest(SAGA_ACTIONS.COMMON.SAVE_ROOM_CHAT, saveRoomChat),
    takeLatest(SAGA_ACTIONS.COMMON.AUTOSAVE_STATUS, getAutosaveStatus),
    takeLatest(SAGA_ACTIONS.COMMON.GET_USER_CREDITS, getUserCredits),
    takeLatest(SAGA_ACTIONS.COMMON.DEDUCT_USER_CREDITS, deductUserCredits),
    takeLatest(SAGA_ACTIONS.COMMON.CREATE_CHANNEL, createChannel),
    takeLatest(SAGA_ACTIONS.COMMON.GET_USER_TRANSLATION, getTranslationChars),
    takeLatest(SAGA_ACTIONS.COMMON.GET_ALL_TRANSLATION, getTranslationLanguages),
    takeLatest(SAGA_ACTIONS.COMMON.SAVE_TRANSLATION, PostTranslationLanguage),

    takeLatest(SAGA_ACTIONS.COMMON.PURCHASE_TRANSLATION, purchaseTranslations),
    takeLatest(SAGA_ACTIONS.COMMON.REDEEM_TRANSLATION, redeemTranslations),


    takeLatest(SAGA_ACTIONS.COMMON.STICKER_BUY, buySticker),
    takeLatest(SAGA_ACTIONS.COMMON.PACK_BUY, buyPack),
    takeLatest(SAGA_ACTIONS.COMMON.STICKER_OWN, myOwnSticker),
    takeLatest(SAGA_ACTIONS.COMMON.STICKER_GIFT_PURCHASE, sendStickerGift),
    takeLatest(SAGA_ACTIONS.COMMON.SEND_PACK_AS_GIFT, sendPackAsGift),
    takeLatest(SAGA_ACTIONS.COMMON.CMS, cmsContent),

    // userPreferences saga
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.GET_USER_ALL_PREFERENCE, getAllPreferences),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.SAVE_USER_PREFERENCE, saveAllPreferences),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.GET_USER_AUTO_REPLY_MESSAGE, getAutoReplyMessage),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.SAVE_USER_AUTO_REPLY_MESSAGE, saveAutoReplyMessage),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.GET_ALL_ACCOUNT, getAllAccount),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.DELETE_ACCOUNT, deleteAccount),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.RESTORE_ACCOUNT, restoreAccount),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.GET_USER_CONTACT_LIST, getUserContactList),

    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.IMPORT_CONTACTS, importContacts),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.IMPORT_BLOCKED, importBlocked),
    
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.GET_CONTACT_BLOCK_LIST_USER, getUserContactBlockList),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.REMOVE_ALL_CONTACT_FROM_LIST, removeAllContactFromList),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.REMOVE_ALL_CONTACT_BLOCK_LIST, removeAllBlockContactFromList),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.UPLOAD_GALLERY_IMAGE, uploadGalleryImage),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.GET_ALL_GALLERY_IMAGE, getAllGalleryImage),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.DELETE_GALLERY_IMAGE, deleteGalleryImage),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.DELETE_ALL_GALLERY_IMAGE, deleteAllGalleryImage),

    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.CLEAR_ALL_CHATS_FOR_ME, clearAllChatsForMe),

    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.UPLOAD_CUSTOMIZED_SOUND, uploadCustomizedSound),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.DELETE_CUSTOMIZED_SOUND, deleteCustomizedSound),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.GET_ALL_CUSTOMIZED_SOUND, getAllCustomizedSound),

    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.GET_PARENTAL_CONTROL_INFORMATION, getParentalControlInfo),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.SAVE_PARENTAL_PREFERENCE_PASSWORD, saveParentalControlPassword),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.PARENTAL_SET_PASSWORD, setParentalControlPassword),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.DELETE_PARENTAL_PREFERENCE, deleteParentalControl),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.PARENTAL_FORGOT_PASSWORD_OTP, parentalControlForgorPasswordOtp),
    takeLatest(SAGA_ACTIONS.USER_PREFERENCE.RESET_PARENTAL_PREFERENCE_PASSWORD, resetParentalPreferencePassword),

    //group & category saga start
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.CREATE_ROOM, createRoom),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.CREATE_VIP_ROOM, createVipRoom),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_CATEGORY, getRoomCategory),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_GROUPS, getRoomGroups),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_TYPES, getRoomTypes),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.GROUP_CATEGORY_LIST, groupCategoryList),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_LIST_CATEGORYWISE, roomListCategoryWise),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_LANGUAGE, getRoomLanguage),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.JOIN_ROOM, joinRoom),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.EXIT_FROM_ROOM, exitFromRoom),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.VERIFY_LOCKWORD, verifyLockword),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.VERIFY_ADMIN_CODE, verifyAdminCode),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.VERIFY_INVITE_CODE, verifyInviteCode),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.GET_ROOM_DETAILS, getRoomDetails),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ADD_AS_FAVOURITE, addAsFavourite),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.REMOVE_FAVOURITE, removeFavourite),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.GET_MY_ACTIVE_ROOMS, getMyActiveRooms),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.MANAGE_TOPIC, manageRoomTopic),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.UPLOAD_ROOM_VIDEO, uploadRoomVideo),

    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.LIKE_ROOM, likeRoom),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.REMOVE_LIKE_ROOM, removeLikeRoom),




    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.UPDATE_ROOM, updateRoom),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_VERIFY_ROOM_PASSWORD, verifyRoomPassword),

    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.DELETE_ROOM, deleteRoom),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.CLOSE_ROOM, closeRoom),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.CLEAR_MY_ROOM_CHAT, clearMyRoomChat),

    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_MENU_PLAY_VIDEO, roomMenuPlayVideo),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_MENU_PLAY_ACCEPT_VIDEO, roomMenuPlayAcceptVideo),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_MENU_PLAY_REJECT_VIDEO, roomMenuPlayRejectVideo),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_MENU_PLAY_REMOVE_VIDEO, roomMenuPlayRemoveVideo),




    takeLatest(SAGA_ACTIONS.USER.MENU.ADMIN_REMOVE_ALL_HAND, removeAllHandFromRoom),
    takeLatest(SAGA_ACTIONS.USER.MENU.ADMIN_DISABLE_INVITATION, disableInvitationForRoom),
    takeLatest(SAGA_ACTIONS.USER.MENU.GIVE_MIC_TO_ALL, giveMicToAll),
    takeLatest(SAGA_ACTIONS.USER.MENU.REMOVE_ALL_MIC, removeAllMic),
    takeLatest(SAGA_ACTIONS.USER.MENU.SIMULTENIOUS_MIC, simultaneousMic),
    takeEvery(SAGA_ACTIONS.USER.MENU.GRAB_MIC, grabMic),
    takeLatest(SAGA_ACTIONS.USER.MENU.ROOM_SAVE_DEFAULT_SETTING, roomSaveDefaultSetting),
    takeLatest(SAGA_ACTIONS.USER.MENU.ROOM_USER_WISE_SAVE_DEFAULT_SETTING, roomUserWiseSaveDefaultSetting),
    takeEvery(SAGA_ACTIONS.USER.MENU.ROOM_RESET_DEFAULT_SETTING, roomResetDefaultSetting),
    takeEvery(SAGA_ACTIONS.USER.MENU.RED_DOT_FOR_ALL, redDotForAllUsers),
    takeEvery(SAGA_ACTIONS.USER.MENU.RED_DOT_FOR_INDIVIDUAL_USER, redDotForIndividualUsers),



    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_ADMIN_LISTS, roomAdminLists),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ADD_ROOM_ADMIN, addRoomAdmin),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.DELETE_ROOM_ADMIN, deleteRoomAdmins),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.VIEW_MY_WEBCAM, viewMyWebCam),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.WHO_IS_VIEWING_MY_WEBCAM, whoIsViewingMyWebCam),


    //joinRoomAsAdmin
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.JOIN_ROOM_AS_ADMIN_ROOM_LIST, joinRoomAsAdminRoomList),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.JOIN_ROOM_ADMIN_CODE_VERIFY, joinRoomAsAdminCodeVerify),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.JOIN_SIMULTANEOUS_ROOM, joinSimultaneouslyRoom),

    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.SUBSCRIPTION.SUBSCRIPTION_ROOM_LIST, getSubscriptionRoomList),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.SUBSCRIPTION.SUBSCRIPTION_ROOM_BUY_PLAN, buyRoomSubscriptionPlan),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.SUBSCRIPTION.SUBSCRIPTION_ROOM_SUCCESS, roomSubscriptionSuccess),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.SUBSCRIPTION.REMOVE_ROOM_SUBSCRIPTION, removeRoomSubscription),

    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.VIRTUAL_GIFT_CREDIT.VIRTUAL_GIFT_CREDIT_LIST, getVirtualGiftCreditList),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.VIRTUAL_GIFT_CREDIT.VIRTUAL_GIFT_CREDIT_BUY, buyVirtualGiftCredit),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.VIRTUAL_GIFT_CREDIT.VIRTUAL_GIFT_CREDIT_BUY_SUCCESS, virtualGiftCreditSuccess),


    // adminControl
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_ADMIN_CONTROL, getRoomAdminControl),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_REMOVED_KICKED_USERS, removeKickUsers),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ROOM_REMOVED_BANNED_USERS, removeBannedUsers),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.APPLY_BANNED_TO_USER, sendUserToBannedList),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.SAVE_ADMIN_CONTROL_SETTING, saveAdminControlSetting),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.WEB_CAMERA_ON_OFF_TOGGLE, webCameraOnOffToggle),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.INSTANT_INVITE_AT_ROOM, instantInviteAtRoom),
    takeLatest(SAGA_ACTIONS.USER.MENU.CHANGE_USER_ROOM_SETTINGS, changeUserRoomSettings),



    //Room member Details Right Side Bar  
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.CUSTOMIZED_NICKNAME, customizedNickname),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ADD_TO_CONTACT_LIST, addToContactList),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.REMOVE_FROM_CONTACT_LIST, removeFromContactList),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ADD_AS_FAVOURITE_CONTACT_LIST, addAsFavouriteContactList),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ADD_USER_AS_FAVOURITE_FROM_CONTACT, addUserAsFavouriteFromContact),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.REMOVE_FROM_FAVOURITE_CONTACT_LIST, removeFromFavouriteContactList),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.REMOVE_HAND_FROM_ROOM, removeHandFromRoom),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.RAISE_HAND_AT_ROOM, raiseHandAtRoom),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.RAISE_HAND_REMOVE_AT_ROOM, raiseHandRemoveAtRoom),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.KICK_USER_FROM_ROOM, kickUserFromRoom),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ADD_TO_BLOCK_LIST, addToBlockList),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.REMOVE_FROM_BLOCK_LIST, removeFromBlockList),

    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.ADD_TO_IGNORE_LIST, addToIgnoreList),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.REMOVE_FROM_IGNORE_LIST, removeFromIgnoreList),

    //chat
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.CHAT.GET_ALL_CHAT_FROM_ROOM, getAllChatFromRoom),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.CHAT.POST_CHAT_IN_ROOM, postChatInRoom),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.CHAT.CLEAR_MY_CHAT, clearMyChat),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.CHAT.GET_ALL_CHAT_HISTORY, getAllChatHistory),
    takeLatest(SAGA_ACTIONS.USER.GROUPS_CATEGORY.CHAT.SAVE_TRANSLATIONS, saveTranslations),

    //group & category saga end

    //Left Menu
    takeLatest(SAGA_ACTIONS.USER.MENU.LEFT_SIDEBAR_LIST, getLeftMenuItemList),

    //Video & Voice message saga
    takeLatest(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.IS_PAGE_PASSWORD_PROTECTED, isPagePasswordProtected),
    takeLatest(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.CHECK_PASSWORD, checkPassword),
    takeLatest(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.GET_CONTACT_LIST, getContactList),
    takeLatest(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.SEND_MESSAGE, sendMessage),
    takeLatest(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.GET_MESSAGE_LIST, getMessageList),
    takeLatest(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.DELETE_MESSAGE, deleteMessage),
    takeLatest(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.RESTORE_MESSAGE, restoreMessage),
    takeLatest(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.VIEW_MESSAGE, viewMessage),
    takeLatest(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.CHECK_AVAILABILITY_USER, checkAvailabilityUser),


    //Notebook Saga
    takeLatest(SAGA_ACTIONS.NOTEBOOK.CREATE_NOTEBOOK, createNotebook),
    takeLatest(SAGA_ACTIONS.NOTEBOOK.UPDATE_NOTEBOOK, updateNotebook),
    takeLatest(SAGA_ACTIONS.NOTEBOOK.DELETE_NOTEBOOK, deleteNotebook),
    takeLatest(SAGA_ACTIONS.NOTEBOOK.NOTEBOOK_CONTACT_LIST, notebookShareContactList),
    takeLatest(SAGA_ACTIONS.NOTEBOOK.NOTEBOOK_DETAILS, notebookDetails),
    takeLatest(SAGA_ACTIONS.NOTEBOOK.SHARE_NOTEBOOK, shareNotebook),
    takeLatest(SAGA_ACTIONS.NOTEBOOK.REMOVE_NOTEBOOK_SHARE, removeNotebookShare),
    takeLatest(SAGA_ACTIONS.NOTEBOOK.NOTEBOOK_LIST, getNotebookList),

    //Favourites Menu Saga
    takeLatest(SAGA_ACTIONS.FAVOURITE_MENU.MY_ROOM, getMyRooms),
    takeLatest(SAGA_ACTIONS.FAVOURITE_MENU.MY_FAVOURITE_ROOM, getMyFavouriteRooms),
    takeLatest(SAGA_ACTIONS.FAVOURITE_MENU.FAVOURITE_FOLDER_LIST, getFavouriteFolders),
    takeLatest(SAGA_ACTIONS.FAVOURITE_MENU.CREATE_FAVOURITE_FOLDER, createFavouriteFolder),
    takeLatest(SAGA_ACTIONS.FAVOURITE_MENU.ASSIGN_ROOM_TO_FOLDER, assignRoomToFolder),
    takeLatest(SAGA_ACTIONS.FAVOURITE_MENU.RENAME_ROOM_NAME, renameRoomName),
    takeLatest(SAGA_ACTIONS.FAVOURITE_MENU.DELETE_FAVOURITE_FOLDER, deleteFavouriteFolder),
    takeLatest(SAGA_ACTIONS.FAVOURITE_MENU.LIST_OF_FAVOURITES_ROOM, getFavouritesRoomList),
    takeLatest(SAGA_ACTIONS.FAVOURITE_MENU.ROOM_FAVOURITES_FOLDER_LIST, getFavouritesFolderList),


    //PM Window
    takeLatest(SAGA_ACTIONS.PM_WINDOW.SEND_PM, sendPms),
    takeLatest(SAGA_ACTIONS.PM_WINDOW.PM_WINDOW_DETAILS, getPmsDetails),
    takeLatest(SAGA_ACTIONS.PM_WINDOW.INVITE_IN_PM_NOTIFICATION, inviteInPmNotification),
    takeLatest(SAGA_ACTIONS.PM_WINDOW.ADD_MEMBER_INTO_PM_WINDOW, addMemberIntoPmWindow),
    takeLatest(SAGA_ACTIONS.PM_WINDOW.REMOVE_MEMBER_FROM_PM_WINDOW, removeMemberFromPmWindow),
    takeLatest(SAGA_ACTIONS.PM_WINDOW.PM_CALL_INITIATE_AND_DISCONNECT, pmCallInitiateAndDisconnect),
    takeLatest(SAGA_ACTIONS.PM_WINDOW.SHOW_USERS_LOCATION, showUsersLocation),
    takeLatest(SAGA_ACTIONS.PM_WINDOW.PM_CALL_ACCEPT_REJECT, pmCallAcceptReject),
    takeLatest(SAGA_ACTIONS.PM_WINDOW.EXIT_PM_WINDOW, exitPmWindow),
    takeLatest(SAGA_ACTIONS.PM_WINDOW.PM_WINDOW_HEADER_MENU_SETTING_ACTION_UPDATE, pmHeaderMenuSettingActionUpdate),
    takeLatest(SAGA_ACTIONS.PM_WINDOW.PM_WINDOW_HEADER_MENU_SAVE_DEFAULT_SETTING, pmHeaderMenuSaveDefaultSetting),
    takeLatest(SAGA_ACTIONS.PM_WINDOW.PM_WINDOW_HEADER_MENU_RESET_DEFAULT_SETTING, pmHeaderMenuResetDefaultSetting),

    takeLatest(SAGA_ACTIONS.PM_WINDOW.GET_CHAT, getChatForPmWindow),
    takeLatest(SAGA_ACTIONS.PM_WINDOW.SEND_CHAT, sendChatForPmWindow),
    takeLatest(SAGA_ACTIONS.PM_WINDOW.CLEAR_ALL_CHATS_IN_PM, clearAllChatsInPm),
    takeLatest(SAGA_ACTIONS.PM_WINDOW.ACTIVE_PM_WINDOW, getMyActivePmWindows),

    takeLatest(SAGA_ACTIONS.PM_WINDOW.PM_READ, readPm),

    takeLatest(SAGA_ACTIONS.PM_WINDOW.GET_DIG_SOUND_LIST, getDigSoundList),
    takeLatest(SAGA_ACTIONS.PM_WINDOW.SEND_DIG_SOUND, sendDigSound),

  ]);
}