import { SAGA_ACTIONS } from "src/_config";
import {
  LoginReq,
  RegistationReq,
  CheckNickNameReq,
  ForgotPasswordNickNameReq,
  ForgotPasswordQuestionAnswerReq,
  ForgotPasswordOtpReq,
  ForgotPasswordResetReq,
  UpdatePasswordReq,
  UpdateUserAvatar,
  UpdateUserProfile,
  UpdateVisibilityStatus,
  UpdateShowHideProfilePicture,
  FindAndAddUser,
  FindNearbyUser,
  FetchUserDetailsReq,
  UpdateCurrentLocationReq,
  CustomizedPersonalMessage,
} from "src/_common/interfaces/ApiReqRes";
import { useApiCall } from "../common/appApiCallHook";

export function useUserApi() {
  const callApi = useApiCall();

  const login = (data: LoginReq, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER.LOGIN, data, onSuccess, onError);
  };

  const loginCheckPassword = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.LOGIN_CHECK_PASSWORD, data, onSuccess, onError);
  };

  const getLoginModeUser = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.GET_LOGIN_MODE, data, onSuccess, onError);
  };

  const registation = (
    data: RegistationReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.REGISTRATION, data, onSuccess, onError);
  };
  const getMe = (onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER.DETAILS, null, onSuccess, onError);
  };
  const logout = (onSuccess: Function, onError: Function) => {
    console.log("logout");
    callApi(SAGA_ACTIONS.USER.LOGOUT, null, onSuccess, onError);
  };

  const checkNickName = (
    data: CheckNickNameReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.CHECK_NICKNAME_AVAILABLITY,
      data,
      onSuccess,
      onError
    );
  };

  const forgotPasswordnickName = (
    data: ForgotPasswordNickNameReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.FORGOT_PASSWORD_NICKNAME,
      data,
      onSuccess,
      onError
    );
  };

  const forgotPasswordQuestionAnswer = (
    data: ForgotPasswordQuestionAnswerReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.FORGOT_PASSWORD_QUESTION_ANSWER,
      data,
      onSuccess,
      onError
    );
  };

  const forgotPasswordOtp = (
    data: ForgotPasswordOtpReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.FORGOT_PASSWORD_OTP, data, onSuccess, onError);
  };
  const forgotPasswordReset = (
    data: ForgotPasswordResetReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.FORGOT_PASSWORD_RESET, data, onSuccess, onError);
  };

  const updatePassword = (
    data: UpdatePasswordReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.UPDATE_PASSWORD, data, onSuccess, onError);
  };

  const updateUserAvatar = (
    data: UpdateUserAvatar,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.UPDATE_PROFILE_IMAGE, data, onSuccess, onError);
  };

  const updateUserProfile = (
    data: UpdateUserProfile,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.UPDATE_PROFILE_DETAILS, data, onSuccess, onError);
  };

  const updateVisibilityStatus = (
    data: UpdateVisibilityStatus,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.UPDATE_VISIBLE_STATUS, data, onSuccess, onError);
  };

  const updateProfilePictureShowHide = (
    data: UpdateShowHideProfilePicture,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.SHOW_PROFILE_PICTURE, data, onSuccess, onError);
  };

  const findAndAddUser = (
    data: FindAndAddUser,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.FIND_AND_ADD_USER, data, onSuccess, onError);
  };

  const findNearbyUser = (
    data: FindNearbyUser,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.NEAR_BY_USER, data, onSuccess, onError);
  };

  const fetchUserDetails = (
    data: FetchUserDetailsReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.FETCH_USER_DETAILS, data, onSuccess, onError);
  };

  const updateCurrentLocation = (
    data: UpdateCurrentLocationReq,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.UPDATE_CURRENT_LOCATION,
      data,
      onSuccess,
      onError,
      false
    );
  };

  const findAndJoinRoom = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(SAGA_ACTIONS.USER.FIND_AND_JOIN_ROOM, data, onSuccess, onError);
  };

  const inviteToRoom = (data: any, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.USER.INVITE_TO_ROOM, data, onSuccess, onError);
  };

  const inviteEmail = (data: any, onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER.INVITE_EMAIL, data, onSuccess, onError);
  };

  const customizedPersonalMessage = (
    data: CustomizedPersonalMessage,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.CUSTOMIZED_PERSONAL_MESSAGE,
      data,
      onSuccess,
      onError
    );
  };

  const clearAboutMessage = (onSuccess: Function, onError: Function) => {
    callApi(SAGA_ACTIONS.USER.CLEAR_ABOUT_MESSAGE, null, onSuccess, onError);
  };

  const sendMultiRecipientMessage = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.SEND_MULTIRECIPIENT_MESSAGE,
      data,
      onSuccess,
      onError
    );
  };

  /** SUBSCRIPTION */
  const getNicknameSubscriptionPlan = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.SUBSCRIPTION.GET_NICKNAME_SUBSCRIPTION_PLAN,
      data,
      onSuccess,
      onError
    );
  };

  const processNicknameSubscription = (
    data: any,
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.SUBSCRIPTION.PROCESS_NICKNAME_SUBSCRIPTION,
      data,
      onSuccess,
      onError
    );
  };

  const removeNicknameSubscription = (
    onSuccess: Function,
    onError: Function
  ) => {
    callApi(
      SAGA_ACTIONS.USER.SUBSCRIPTION.REMOVE_NICKNAME_SUBSCRIPTION,
      null,
      onSuccess,
      onError
    );
  };

  return {
    callLogin: login,
    callGetLoginModeUser: getLoginModeUser,
    callLoginCheckPassword: loginCheckPassword,
    callLogout: logout,
    callGetMe: getMe,
    callRegistation: registation,
    callCheckNickName: checkNickName,
    callForgotPasswordnickName: forgotPasswordnickName,
    callForgotPasswordQuestionAnswer: forgotPasswordQuestionAnswer,
    callForgotPasswordOtp: forgotPasswordOtp,
    callForgotPasswordReset: forgotPasswordReset,
    callUpdatePassword: updatePassword,
    callUpdateAvatar: updateUserAvatar,
    callUpdateUserProfile: updateUserProfile,
    callUpdateUserVisibilityStatus: updateVisibilityStatus,
    callUpdateProfilePictureShowHide: updateProfilePictureShowHide,
    callFindAndAddUser: findAndAddUser,
    callFindNearbyUser: findNearbyUser,
    callFetchUserDetails: fetchUserDetails,
    callUpdateCurrentLocation: updateCurrentLocation,
    callFindAndJoinRoom: findAndJoinRoom,
    callInviteToRoom: inviteToRoom,
    callInviteEmail: inviteEmail,
    callCustomizedPersonalMessage: customizedPersonalMessage,
    callCLearAboutMessage: clearAboutMessage,
    callSendMultiRecipientMessage: sendMultiRecipientMessage,
    callGetNicknameSubscriptionPlan: getNicknameSubscriptionPlan,
    callProcessNicknameSubscription: processNicknameSubscription,
    callRemoveNicknameSubscription: removeNicknameSubscription,
  };
}
