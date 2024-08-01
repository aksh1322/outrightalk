import { number } from "prop-types";

//Online Offline Contact List
export interface ContactListOnlineOffline {
  type: string;
}

//user module interface
export interface LoginReq {
  // email: string;
  // username: string;
  // password: string;
  nickname: string;
  password: string;
  device_type: string;
  device_token: string;
  login_invisible: number;
}

interface InnerApiParms {
  nickname?: string;
  password?: string;
  confirm_password?: string;
  dob?: string;
  dob_visible?: number;
  gender?: number;
  gender_visible?: number;
  country?: number;
  country_visible?: number;
  state?: string;
  state_visible?: number;
  email?: string;
  email_visible?: number;
  confirm_email?: string;
  about?: string;
  about_visible?: number;
  question?: number;
  answer?: string;
}

export interface RegistationReq {
  extra: any;
  apiParms: InnerApiParms;
}
export interface CheckNickNameReq {
  nickname: string;
}
export interface ForgotPasswordNickNameReq {
  nickname: string;
}
export interface ForgotPasswordQuestionAnswerReq {
  token: string;
  answer: string;
}
export interface ForgotPasswordOtpReq {
  token: string;
  otp: string;
}
export interface ForgotPasswordResetReq {
  token: string;
  password: string;
  c_password: string;
}

export interface UpdatePasswordReq {
  current_password: string;
  password: string;
  confirm_password: string;
}

export interface UpdateUserAvatar extends FormData {}

export interface UpdateUserProfile {
  // first_name?: string;
  // last_name?: string;
  dob?: string;
  dob_visible: number;
  // gender?: number;
  // gender_visible?: number;
  country: number;
  country_visible: number;
  state: string;
  state_visible: number;
  // email?: string;
  // email_visible?: number;
  // confirm_email?: string;
  about: string;
  about_visible: number;
  question?: number;
  answer?: string;
  flag?: number;
}
export interface UpdateVisibilityStatus {
  visible_status: number;
}
export interface UpdateShowHideProfilePicture {
  avatar_visible: number;
}

export interface FindAndAddUser {
  user_id?: number | null;
  nickname?: string;
  email?: string;
  age?: number | null;
  country?: number | null;
  gender?: number | null;
  language?: number | null;
}

export interface FindNearbyUser {
  current_lat: number;
  current_lon: number;
  radius: number;
}

export interface UpdateCurrentLocationReq {
  curr_loc_lat: number;
  curr_loc_lon: number;
}

export interface FetchUserDetailsReq {
  user_id: number;
}
export interface CustomizedPersonalMessage {
  about: string;
}
//endof user module interface

//Group & Category Module Interface
export interface GetGroupCategoryList {
  room_name?: string;
  "18plus_room"?: number;
  language?: string;
  language_id?: string | number | null;
}
export interface CreateRoom extends FormData {
  // room_name: string;
  // room_type_id: number;
  // group_id: number;
  // room_category_id: number;
  // language_id: number;
  // welcome_message: string;
  // banner_url: string;
  // text_enabled: number;
  // video_enabled: number;
  // voice_enabled: number;
  // locked_room: number;
  // lockword: string;
  // admin_code: string;
  // room_password: string;
  // post_url: string;
  // filter_words: string;
}
export interface GetRoomListCategoryWise {
  group_id: number;
}

export interface JoinRoomReq {
  room_id: number;
  exit_room: number;
  invitation_code?: number;  // initation code
}

export interface ExitFromRoomReq {
  room_id: number;
}

export interface GetRoomGroups {
  category_id: number;
}

export interface VerifyLockword {
  room_id: number;
  lockword: string;
}

export interface GetRoomDetails {
  room_id: number;
}

export interface VerifyAdminCode {
  room_id: number;
  admincode: string;
}
export interface VerifyInviteCode {
  room_id: number;
  invitation_code: string;
}
export interface AddAsFavourite {
  room_id: number;
  folder_id: number;
}

export interface RemoveFavourite {
  room_id: number;
}

export interface LikeRoomReq {
  room_id: number;
}

export interface RemoveLikeRoomReq {
  room_id: number;
}

export interface ManageRoomTopic {
  room_id: number;
  topic: string | null;
}

export interface RoomAdminListReq {
  room_id: number;
}
export interface AddRoomAdminReq {
  room_id: number;
  user_id: number;
  is_admin: number;
}
export interface RemoveRoomAdminReq {
  room_id: number;
  user_id: number[];
}
export interface ViewMyWebCamReq {
  room_id: number;
  view_user_id: number;
  is_view: number;
}
export interface WhoIsViewingMyWebCam {
  room_id: number;
}

export interface RedDotForAll {
  room_id: number;
  is_red_dot: number;
}

export interface RedDotForIndividual {
  room_id: number;
  user_id: number;
  red_dot_type: string;
  is_red_dot: number;
}

export interface VerifyRoomPasswordReq {
  room_id: number;
  room_password: string;
}

export interface GetAdminControlReq {
  room_id: number;
}
export interface RoomRemoveKickUserReq {
  room_id: number;
  user_id: number[];
}
export interface RoomRemoveBanUserReq {
  room_id: number;
  user_id: number[];
}
export interface ApplyBannedToUserReq {
  room_id: number;
  user_id: number[];
  is_unlimited_banned: number;
  ban_date?: string | null;
  ban_time?: string | null;
}
export interface SaveAdminControlReq {
  room_id: number;
  welcome_message: string | null;
  under_age: number | null;
  under_age_not_allowed: number | null;
  under_age_range_id: number | null;
  under_age_range_allowed: number;
  disable_hyperlinks: number;
  anti_flood: number;
  red_dot_newcomers: number;
  admin_meeting_date: string | null;
  admin_meeting_time: string | null;
}
export interface InstantRoomInvite extends FormData {}
export interface ChangeuserRoomSettings {
  room_id: number;
  key_name: string;
  key_value: number;
}

export interface RoomPlayAcceptVideo {
  record_id: number;
  room_id: number;
}

//chat

export interface GetChatRoomReq {
  room_id: number;
  download: boolean;
  isPM: boolean;
}

export interface PostChatInRoomReq {
  room_id: number;
  chat_body: any;
  to_user_id: number | null;
  type: string;
}

export interface SaveTranslationsReq {
  pm_id: number;
  message_id:number;
  translations:any;
}
// Room Member
export interface CustomizeNickname {
  // room_id: number;
  for_user_id: number | null;
  nickname: string;
}

export interface ADDToContactList {
  user_id?: number | null;
  contact_user_id: number;
}

export interface RemoveFromContactList {
  user_id?: number | null;
  contact_user_id: number;
}

export interface AddAsFavouriteContact {
  contact_user_id: number;
}

export interface AddUserAsFavouriteFromContact {
  contact_user_id: number;
}

export interface RemoveFromFavouriteContact {
  contact_user_id: number;
}

export interface KickUserFromRoom {
  room_id: number;
  user_id: number;
}
export interface RemoveHandFromRoom {
  room_id: number;
  user_id: number;
}

export interface RaiseHandAtRoom {
  room_id: number;
}
export interface RaiseHandRemoveAtRoom {
  room_id: number;
}

export interface AddToBlockList {
  user_id?: number | null;
  block_user_id: number;
}

export interface RemoveFromBlockList {
  user_id?: number | null;
  block_user_id: number;
}

export interface AddToIgnoreList {
  room_id: number;
  ignore_user_id: number;
}
export interface RemoveFromIgnoreList {
  room_id: number;
  ignore_user_id: number;
}
export interface CameraOnOffToggle {
  room_id: number;
  is_cemera: number;
  is_device_close?: number;
}
export interface UploadRoomVideo extends FormData {}
export interface RemoveAllHand {
  room_id: number;
}

export interface DisableInvitationReq {
  room_id: number;
  disable_invitation: number;
}
export interface GiveMicToAllReq {
  room_id: number;
}
export interface RemoveAllMicReq {
  room_id: number;
}
export interface SimultaneousMicReq {
  room_id: number;
  simultaneous_value: number;
}
export interface GrabMicReq {
  room_id: number;
  is_grab: number;
}

//endof group & category module interface

//Video & Voice Message Start from here

export interface IsPasswordProtectedPage {
  type: string;
}

export interface CheckPassword {
  type: string;
  password: string;
}

export interface GetContactListUsers {
  type: string | null;
}

export interface SendMessage extends FormData {}

export interface GetMessageList {
  type: string;
}

export interface DeleteMessage extends FormData {}

export interface RestoreMessage {
  record_id: number;
}

export interface ViewMessage {
  record_id: number;
}
export interface CheckAvailabilityUser extends FormData {}

//Notebook start from here
export interface CreateNotebook {
  notebook_title: string;
  description: string;
}
export interface UpdateNotebook {
  notebook_id: number;
  notebook_title: string;
  description: string;
}
export interface GetNotebookContactList {
  notebook_id: number | undefined;
}
export interface ShareNotebook extends FormData {}
export interface NotebookDetails {
  notebook_id: number;
}
export interface DeleteNotebook extends FormData {}
export interface RemoveNotebookShare {
  share_user_id: number;
  notebook_id: number;
}

//User Preferences
export interface UploadGalleryImage extends FormData {}
export interface DeleteGalleryImage {
  record_id: number;
}

export interface DeleteAccount {
  record_id: number;
}
export interface RestoreAccount {
  record_id: number;
}
export interface GetContactListUser {
  nickname?: string;
}
export interface GetContactBlockListUser {
  nickname?: string;
}

//alert
export interface UploadCustomizedSound extends FormData {}
export interface DeleteCustomizedSound {
  record_id?: number;
}

//parental control
export interface GetParentalControlInfo {
  user_id: number;
}
export interface SaveParentalControlPassword {
  user_id: number;
  parental_password: string;
}
export interface DeleteParentalControl {
  user_id: number;
}
export interface ResetParentalControlPassword {
  user_id: number;
}
export interface ParentalControlForgotPasswordOtp {
  user_id: number;
  otp: string;
}
export interface ParentalControlSetPassword {
  user_id: number;
  password: string;
  c_password: string;
}
export interface UserDetailsReq {
  id: number;
  status: number;
  visible_status: number;
  prev_visible_status: number;
  is_loggedout: number;
  username: string;
  customize_nickname: any;
  email: string;
  phone: string;
  otp: string;
  dob: string;
  gender: number;
  country: number;
  state: string;
  about: string;
  question: number;
  answer: string;
  ip_addr: string;
  timezone: string;
  last_seen: string;
  curr_loc_lat: string;
  curr_loc_lon: string;
  full_name: string;
  avatar: {
    id: number;
    original: string;
    thumb: string;
    file_mime: string;
    visible_avatar: number;
  };
  visible_option: Visible_Option[];
  date_of_birth: string;
  gender_name: { title: string };
  country_name: { country_name: string };
  gallery: Gallery[];
  roles: {
    slug: string;
    title: string;
  };
}
export interface Gallery {
  id: number;
  user_id: number;
  gallery: Image;
}
export interface Image {
  id: number;
  original: string;
  thumb: string;
  file_mime: string;
}
export interface Visible_Option {
  key: string;
  value: number;
}

//Notification
export interface RemoveSingleNotification {
  record_id: number;
}

//PM Window
export interface SendPms {
  user_id: number;
}

export interface GetPmsDetailsReq {
  pm_id: number;
}

export interface AddMemberIntoPmWindowReq {
  pm_id: number;
  // user_id: number[];
}
export interface RemoveMemberFromWindowReq extends FormData {}
export interface SendPmWindowChat {
  pm_id: number;
  chat_body: string;
}

export interface GetPmWindowChat {
  pm_id: number;
}

export interface PmCallAcceptRejectReq {
  pm_id: number;
  type: string;
}
export interface ShowUsersLocationReq {
  pm_id: number;
}
export interface ReadPmReq {
  pm_id: number;
}

//CMS
export interface CmsContentDetails {
  slug: string;
  type: number;
}
