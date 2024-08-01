import { SAGA_ACTIONS } from 'src/_config'
import {
  UploadGalleryImage,
  DeleteGalleryImage,
  DeleteAccount,
  RestoreAccount,
  GetContactListUser,
  GetContactBlockListUser,
  UploadCustomizedSound,
  DeleteCustomizedSound,
  GetParentalControlInfo,
  SaveParentalControlPassword,
  DeleteParentalControl,
  ResetParentalControlPassword,
  ParentalControlForgotPasswordOtp,
  ParentalControlSetPassword,
} from 'src/_common/interfaces/ApiReqRes'
import { useApiCall } from '../common/appApiCallHook'

export function useUserPreferenceApi() {

  const callApi = useApiCall()

  const getUserPreference = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.GET_USER_ALL_PREFERENCE, data, onSuccess, onError);
  }
  const saveUserPreference = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.SAVE_USER_PREFERENCE, data, onSuccess, onError); 
  }
  const getUserAutoReply = (onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.GET_USER_AUTO_REPLY_MESSAGE, null, onSuccess, onError);
  }
  const saveUserAutoReply = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.SAVE_USER_AUTO_REPLY_MESSAGE, data, onSuccess, onError);
  }
  const clearAllChatsForMe = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.CLEAR_ALL_CHATS_FOR_ME, data, onSuccess, onError); 
  }

  //My Account
  const getAllAccount = (onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.GET_ALL_ACCOUNT, null, onSuccess, onError);
  }
  const deleteAccount = (data: DeleteAccount, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.DELETE_ACCOUNT, data, onSuccess, onError);
  }
  const restoreAccount = (data: RestoreAccount, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.RESTORE_ACCOUNT, data, onSuccess, onError);
  }

  const getUserContactList = (data: GetContactListUser, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.GET_USER_CONTACT_LIST, data, onSuccess, onError);
  }

  const importContacts = (data: GetContactListUser, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.IMPORT_CONTACTS, data, onSuccess, onError);
  }

  const importBlocked = (data: GetContactListUser, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.IMPORT_BLOCKED, data, onSuccess, onError);
  }


  const getUserContactBlockList = (data: GetContactBlockListUser, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.GET_CONTACT_BLOCK_LIST_USER, data, onSuccess, onError);
  }

  const removeAllUserFromContactList = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.REMOVE_ALL_CONTACT_FROM_LIST, data, onSuccess, onError);
  }

  const removeAllBlockUserFromContactList = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.REMOVE_ALL_CONTACT_BLOCK_LIST, data, onSuccess, onError);
  }

  //Gallery
  const uploadGalleryImage = (data: UploadGalleryImage, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.UPLOAD_GALLERY_IMAGE, data, onSuccess, onError);
  }

  const getAllGalleryImage = (onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.GET_ALL_GALLERY_IMAGE, null, onSuccess, onError);
  }

  const deleteGalleryImage = (data: DeleteGalleryImage, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.DELETE_GALLERY_IMAGE, data, onSuccess, onError);
  }

  const deleteAllGalleryImage = (onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.DELETE_ALL_GALLERY_IMAGE, null, onSuccess, onError);
  }

  //alert
  const uploadCustomizedSound = (data: UploadCustomizedSound, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.UPLOAD_CUSTOMIZED_SOUND, data, onSuccess, onError);
  }

  const deleteCustomizedSound = (data: DeleteCustomizedSound, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.DELETE_CUSTOMIZED_SOUND, data, onSuccess, onError);
  }

  const getAllCustomizedSound = (onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.GET_ALL_CUSTOMIZED_SOUND, null, onSuccess, onError);
  }

  //parental control
  const getParentalControlInfo = (data: GetParentalControlInfo, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.GET_PARENTAL_CONTROL_INFORMATION, data, onSuccess, onError);
  }

  const saveParentalControlPassword = (data: SaveParentalControlPassword, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.SAVE_PARENTAL_PREFERENCE_PASSWORD, data, onSuccess, onError);
  }

  const deleteParentalPreference = (data: DeleteParentalControl, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.DELETE_PARENTAL_PREFERENCE, data, onSuccess, onError);
  }

  const resetParentalControlPassword = (data: ResetParentalControlPassword, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.RESET_PARENTAL_PREFERENCE_PASSWORD, data, onSuccess, onError);
  }

  const parentalControlForgotPasswordOtp = (data: ParentalControlForgotPasswordOtp, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.PARENTAL_FORGOT_PASSWORD_OTP, data, onSuccess, onError);
  }

  const parentalControlSetPassword = (data: ParentalControlSetPassword, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.PARENTAL_SET_PASSWORD, data, onSuccess, onError);
  }

  // const downloadPdf = (data: any, onSuccess: Function, onError: Function) => {
  //   callApi(SAGA_ACTIONS.USER_PREFERENCE.DOWNLOAD_PDF, data, onSuccess, onError);
  // }

  const getDownloadPdf = (onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER_PREFERENCE.DOWNLOAD_PDF, null, onSuccess, onError);
  }



  return {
    callGetUserPreference: getUserPreference,
    callDownloadPdf: getDownloadPdf,
    callSaveUserPreference: saveUserPreference,
    callGetUserAutoReply: getUserAutoReply,
    callSaveUserAutoReply: saveUserAutoReply,
    callGetAllAccount: getAllAccount,
    callDeleteAccount: deleteAccount,
    callRestoreAccount: restoreAccount,
    callGetUserContactList: getUserContactList,
    callImportContacts : importContacts,
    callImportBlocked : importBlocked,

    callGetUserContactBlockList: getUserContactBlockList,
    callRemoveAllUserFromContactList: removeAllUserFromContactList,
    callRemoveAllBlockUserFromContactList: removeAllBlockUserFromContactList,
    callUploadGalleryImage: uploadGalleryImage,
    callGetAllGalleryImage: getAllGalleryImage,
    callDeleteGalleryImage: deleteGalleryImage,
    callDeleteAllGalleryImage: deleteAllGalleryImage,

    callUploadCustomizedSound: uploadCustomizedSound,
    callDeleteCustomizedSound: deleteCustomizedSound,
    callGetAllCustomizedSound: getAllCustomizedSound,

    callGetParentalControlInfo: getParentalControlInfo,
    callSaveParentalControlPassword: saveParentalControlPassword,
    callDeleteParentalControl: deleteParentalPreference,
    callResetParentalControlPassword: resetParentalControlPassword,
    callParentalControlForgotPasswordOtp: parentalControlForgotPasswordOtp,
    callParentalControlSetPasword: parentalControlSetPassword,

    callClearAllChatsForMe: clearAllChatsForMe,
  }
}