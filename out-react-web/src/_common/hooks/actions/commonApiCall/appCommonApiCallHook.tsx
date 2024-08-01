import { getAutosaveStatus } from 'src/sagas/commonSaga';
import { CmsContentDetails, ContactListOnlineOffline } from 'src/_common/interfaces/ApiReqRes';
import { SAGA_ACTIONS } from 'src/_config'
import { useApiCall } from '../common/appApiCallHook'

export function useCommonApi() {

  const callApi = useApiCall()

  const getGenderList = (onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.GENDER_LIST, null, onSuccess, onError);
  }
  const getCountryList = (onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.COUNTRY_LIST, null, onSuccess, onError);
  }
  const getSecretQuestion = (onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.SECRET_QUESTION_LIST, null, onSuccess, onError);
  }
  const getOnlineOfflineContactList = (data: ContactListOnlineOffline, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.ONLINE_OFFLINE_CONTACT_LIST, data, onSuccess, onError);
  }

  const getStickerCategories = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.CHAT_STICKER_CATEGORIES, data, onSuccess, onError);
  }

  const getBadgeDetails = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.GET_BADGE_DETAILS, data, onSuccess, onError);
  }

  const getAwardedBadges = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.GET_AWARDED_BADGES, data, onSuccess, onError);
  }

  const getAllStickerCategorywise = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.GET_CATEGORYWISE_ALL_STICKER, data, onSuccess, onError);
  }

  const stickerBuy = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.STICKER_BUY, data, onSuccess, onError);
  }

  const packBuy = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.PACK_BUY, data, onSuccess, onError);
  }

  const stickerOwn = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.STICKER_OWN, data, onSuccess, onError);
  }

  const stickerGiftpurchase = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.STICKER_GIFT_PURCHASE, data, onSuccess, onError);
  }

  const sendPackAsGift = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.SEND_PACK_AS_GIFT, data, onSuccess, onError);
  }

  const cmsContentDetails = (data: CmsContentDetails, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.CMS, data, onSuccess, onError);
  }

  const getWalletDetails = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.GET_WALLET_DETAILS, data, onSuccess, onError);
  }

  const redeemPoints = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.REDEEM_POINTS, data, onSuccess, onError);
  }

  const acceptPoints = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.ACCEPT_POINTS, data, onSuccess, onError);
  }

  const rejectPoints = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.REJECT_POINTS, data, onSuccess, onError);
  }

  const sharePointsNotify = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.SHARE_POINTS_NOTIFY, data, onSuccess, onError);
  }


  const saveRoomChat = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.SAVE_ROOM_CHAT, data, onSuccess, onError);
  }

  const getAutosaveStatus = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.AUTOSAVE_STATUS, data, onSuccess, onError);
  }

  const getGiftedSubscription = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.GIFT_SUBSCRIPTION, data, onSuccess, onError);
  }
  const GiftVirtualCredit = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.GIFT_VIRTUAL_CREDIT, data, onSuccess, onError);
  }

  const switchNicknameSubscription = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.SWITCH_NICKNAME_SUBSCRIPTION, data, onSuccess, onError);
  }

  const switchRoomSubscription = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.SWITCH_ROOM_SUBSCRIPTION, data, onSuccess, onError);
  }


  const getUserCredits = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.GET_USER_CREDITS, data, onSuccess, onError);
  }
  const getTranslationChars = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.GET_USER_TRANSLATION, data, onSuccess, onError);
  }

  const purchaseTranslationsChars = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.PURCHASE_TRANSLATION, data, onSuccess, onError);
  }
  const redeemTranslationsChars = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.REDEEM_TRANSLATION, data, onSuccess, onError);
  }
  const deductUserCredits = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.DEDUCT_USER_CREDITS, data, onSuccess, onError);
  }
  const createChannel = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.CREATE_CHANNEL, data, onSuccess, onError);
  }
  // CREATE_CHANNEL
  const SaveTranslationLanguage = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.SAVE_TRANSLATION, data, onSuccess, onError);
  }
  const getTranslation = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.COMMON.GET_ALL_TRANSLATION, data, onSuccess, onError);
  }
  return {
    callGetGenderList: getGenderList,
    callGetCountryList: getCountryList,
    callGetSecretQuestion: getSecretQuestion,
    callOnlineOfflineCOntactList: getOnlineOfflineContactList,
    callGetStickerCategories: getStickerCategories,
    callGetBadgeDetails: getBadgeDetails,
    callGetAwardedBadges: getAwardedBadges,
    callGetAllStickerCategorywise: getAllStickerCategorywise,
    callStickerBuy: stickerBuy,
    callPackBuy: packBuy,
    callStickerOwn: stickerOwn,
    callStickerGiftpurchase: stickerGiftpurchase,
    callSendPackAsGift: sendPackAsGift,
    callCmsContentDetails: cmsContentDetails,
    callGetWalletDetails: getWalletDetails,
    callRedeemPoints: redeemPoints,
    callSharePointsNotify: sharePointsNotify,
    callAcceptPoints: acceptPoints,
    callRejectPoints: rejectPoints,
    callSaveRoomChat: saveRoomChat,
    callGetAutoSaveStatus: getAutosaveStatus,
    callGetGiftedSubscription:getGiftedSubscription,
    callsendVirtualGift:GiftVirtualCredit,
    callSwitchNicknameSubscription:switchNicknameSubscription,
    callSwitchRoomSubscription:switchRoomSubscription,
    callGetUserCredits: getUserCredits,
    CallGetTranslationChars:getTranslationChars,
    callSaveTranslationLanguage:SaveTranslationLanguage,
    callGetAllTranslation:getTranslation,
    CallPurchaseTranslationChars:purchaseTranslationsChars,
    callRedeemTranslationChars:redeemTranslationsChars,
    callDeductUserCredits:deductUserCredits,
    callCreateChannel:createChannel
  }
}