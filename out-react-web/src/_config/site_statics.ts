export const TWITTER_LINK = 'https://twitter.com/home?lang=en'
export const VISA_LINK = 'https://www.visa.co.in/'
export const MASTER_CARD_LINK = 'https://www.mastercard.co.in/en-in.html'
export const GODADDY_LINK = 'https://in.godaddy.com/'

export const USER_DEFAULT_IMAGE = '/images/default_user.png'
export const CRYPTO_SECRET_KEY = 'oUtRiGhTaLk_ApP'
export const TOKBOX_KEY = '47303544';
export const GOOGLE_MAP_API_KEY = "AIzaSyDzyb77sOPwJdR8WINUuDX5EG51--WJDJ4";

export const DEVICE_TYPE = {
  WEB: 'web',
  MOBILE: 'mobile',
  DESKTOP: 'desktop',
}

export const DEFAULT_STICKER_SIZE = 200;
export const BOUNDARY_STICKER_SIZE = 29;

export const DEVICE_TOKEN = {
  WEB: 'xedfr452189657asdwer',
  MOBILE: 'xyz',
  DESKTOP: 'xyz',
}

export const DOB_MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

export const HEAR_FROM_OPTIONS = [{
  label: 'A Friend',
  value: 'A Friend'
}, {
  label: 'A Sibling',
  value: 'A Sibling'
}, {
  label: 'Flyer',
  value: 'Flyer'
}, {
  label: 'Google Search',
  value: 'Google Search'
}, {
  label: 'Saw car in the street',
  value: 'Saw car in the street'
}, {
  label: 'Walk in',
  value: 'Walk in'
}]

export const YES_NO_RADIO = [{
  label: 'No',
  value: 'no'
}, {
  label: 'Yes',
  value: 'yes'
}]

export const GENDER_RADIO = [{
  label: 'Male',
  value: 'male'
}, {
  label: 'Female',
  value: 'female'
}, {
  label: 'Other',
  value: 'other'
}]

export const CREATE_ROOM_POST_URL_USERS = [{
  label: 'Admin',
  value: 'Admin'
}, {
  label: 'Anyone',
  value: 'Anyone'
}]

export const CLASS_APPOINTMENT_STATUS_OPTIONS = [{
  label: 'Present',
  value: '1'
}, {
  label: 'Absent',
  value: '0'
}]

export const PROFILE_IMAGE_ASPECT_RATIO = 1

export const ROOM_TYPE = {
  TEXT_AUDIO: 'TA',
  TEXT_AUDIO_VIDEO: 'TAV',
  TEXT: 'T',
  TEXT_VIDEO: "TV"
}

export const VISIBILITY_STATUS_TYPE = {
  AVAILABLE: 'Available',
  AWAY: 'Away',
  DND: 'Do not disturb',
  INVISIBLE: 'Invisible',
  OFFLINE: 'Offline',
}

export const MENU_OPERATIONS = {
  WHISPER_MESSAGE: 'whisper_message',
  CUSTOMIZED_NICKNAME: 'customized_nickname',
  VIEW_PROFILE: 'view_profile',
  COPY_NICKNAME: 'copy_nickname',
  ADD_TO_CONTACT_LIST: 'add_to_contact_list',
  ADD_TO_BLOCK_LIST: 'add_to_block_list',
  ADD_TO_FAVOURITE_CONTACT: 'add_to_favourite_contact',
  REMOVE_FROM_FAVOURITE_CONTACT: 'remove_from_favourite_contact',
  REMOVE_FROM_CONTACT_LIST: 'remove_from_contact_list',
  SEND_VIRTUAL_GIFT: 'send_virtual_gift',
  BUY_GIFT_SUBSCRIPTION: 'buy_gift_subscription',
  SEND_GIFT_SUBSCRIPTION: "send_gift_subscription",
  SEND_VIRTUAL_CREDIT:'send_virtual_credit',
  SEND_PM: 'send_pm',
  KICK_USER: 'kick_user',
  REMOVE_USER_HAND: 'remove_user_hand',
  VIEW_USER_WEBCAM: 'view_user_webcam',
  ADD_TO_IGNORE_USER_LIST: 'add_to_ignore_user_list',
  REMOVE_IGNORE_USER_LIST: 'remove_from_ignore_user_list',
  RED_DOT_ALL: 'all',
  RED_DOT_FOR_MIC: 'red_dot_mic',
  RED_DOT_FOR_TEXT: 'red_dot_text',
  RED_DOT_FOR_CAM: 'red_dot_camera',
  OTHERS: 'others',
  SEND_FILE: 'send_file',
  PUSH_TO_TALK: 'push_to_talk',
  LOCK_MIC: 'lock_mic',

  AUTOSCROLL_TEXT: 'autoscrool_text',
  SHOW_INCOMING_TEXT_WITH_FORMAT: 'incoming_text_format',
  TIMESTAMP: 'show_timestamp_chat_room',
  SORT_NICKNAME_ALPHABETICALLY: 'nickname_alphabetically',
  DISABLE_DIG_SOUND: 'disable_dig_sound',
  NOTIFY_EXIT_JOIN_ROOM:'notify_users_join_exit_room',
  NOTIFY_USER_JOIN_ROOM: 'notify_join_room',
  NOTIFY_EXIT_ROOM: 'notify_exit_room',
  NOTIFY_START_STOP_WEBCAM: 'notify_users_start_stops_webcam',
  NOTIFY_START_WEBCAM: 'notify_start_webcam',
  NOTIFY_STOP_WEBCAM: 'notify_stop_webcam',
  CHANGE_ROOM_SCREEN: 'change_room_screen',
  MUTE_INCOMING_SOUND: 'mute_incoming_sound',
  SAVE_AS_DEFAULT_ROOM_SETTINGS: 'save_default_room_settings',
  ROOM_RESET_DEFAULT_SETTING: 'reset_default_settings',
  FONT_COLOR:'font_color',
  FONT_FAMILY:'font_family',
  FONT_SIZE:'font_size',
  TEXT_DECORATION:'text_decoration',
  FONT_WEIGHT:'font_weight',
  FONT_STYLE:'font_style',
  INVITE_A_FRIEND: {
    EMAIL: 'email',
    FACEBOOK: 'facebook',
    TWITTER: 'twitter',
    GOOGLE_TALK: 'google_talk',
  }
}

export const CHAT_TYPE = {
  WHISPER: 'whisper',
  NORMAL: 'normal',
  WELCOME: 'welcome',
  EXIT: 'exit',
  GIFT: 'gift',
  LETS_DO: 'letsdo',
  STICKER: 'sticker',
}

export const NOTIFICATION_TYPE = {
  GIFT: 'gift',
  INVITE: 'invite',
  PM_INVITE: 'pm_invite',
  PM_NOTIFICATION: 'pm_notification',
  PM_AUDIO_VIDEO_NOTIFICATION: 'pm_audio_video_notification',
  SHARE_POINTS_NOTIFICATION: 'share_points_notification'
}

export const HEADER_TYPE = {
  ROOM_WINDOW: 'room_window',
  MAIN_WINDOW: 'main_window',
  PM_WINDOW: 'pm_window',
}

export const HEADER_MENU_SELECTION_TYPE = {
  SELECT: 'select',
  DESELECT: 'deselect',
  SELECT_ALL: 'select_all',
  DESELECT_ALL: 'deselect_all',
  COPY: 'copy',
  PASTE: 'paste'
}

export const SOCKET_CHANNEL = {
  CHAT_MESSAGE: 'chatMessage',
  USER_STATUS: 'userStatus',
  ROOM_MEMBER_OPTION: 'RoomMemberOption',
  ROOM_VIDEO_UPLOAD: 'UploadVideo',
  TOPIC_UPDATE: 'TopicUpdate',
  VIDEO_AUDIO_ICON_UPDATE_CHANNEL: 'VideoAudioChnl',
  ADMIN_DISABLE_ENABLE_INVITATION: 'DisableEnableInvitation',
  VOICE_VIDEO_NOTEBOOK_CHANNEL: 'VoiceVideoNoteChnl',
  VOICE_VIDEO_NOTEBOOK_COUNT: 'VVNCntChnl',
  INSTANT_INVITE_AT_ROOM: 'Invite',
  GRAB_MIC: 'grabMic',
  PLAY_VIDEO_CHANNEL: 'playVideoChnl',
  MEMBER_DATA: 'roomMembers',
  RED_DOT_CHANNEL: 'redDotChnl',

  //PM Window
  PM_CHAT_MESSAGE: 'pmChatMessage',
  PM_ADD_REMOVE_USER: 'pmAddRemove',
  PM_TYPING: 'chatTyping',
  RECENT_PMS: 'recentPm',
  DIG_SOUND: 'digSound',
  PM_DETAILS: "pmDetails",
  SEND_FILE_INVITE: 'sendFileInvite',

  LOGGEDIN_OTHER_LOCATION: 'loggedInOthrLoc',

}

export const VIDEO_VOICE_NOTEBOOK_SOCKET_TYPE = {
  SHARE_NOTEBOOK: 'notebook',
  REMOVE_NOTEBOOK: 'remove_notebook',
  VOICE_MESSAGE: 'voice',
  VIDEO_MESSAGE: 'video',
}

export const ADMIN_ROOM_MENU_SOCKET_TYPE = {
  CAMERA_OFF: "camera_off",
  GIVE_MIC_ALL: "give_mic_all",
  REMOVE_ALL_MIC: "remove_all_mic",
  SIMULTANEOUS_MIC: "simultaneous_mic",
  RED_DOT: {
    RED_DOT_TO_ALL: 'red_dot_to_all',
    REMOVE_RED_DOT_FROM_ALL: 'remove_red_dot_from_all',
    RED_DOT_UPDATE_FOR_INDIVIDUAL_USER: 'red_dot_user',
  }
}


export const LEFT_SIDEBAR_SOCKET_TYPE = {
  CHANGE_STATUS: 'change_status',
  TOTAL_ONLINE_USERS: 'total_online_user',
  SHOW_PROFILE_PICTURE: 'show_profile_picture',
  ADD_CONTACT_LIST: 'add_contactlist',
  ADD_FAVOURITE_USER_FROM_CONTACT: 'add_favourite',
  REMOVE_CONTACT_LIST: 'remove_contactlist',
  CUSTOMIZED_NICKNAME: 'customize_nickname',
  ADD_TO_BLOCK_LIST: 'add_blocklist',
  REMOVE_FROM_BLOCKLIST: 'remove_blocklist',
}

export const ROOM_DETAILS_SOCKET_TYPE = {
  REMOVE_USER_HAND: 'remove_hand',
  REMOVE_ALL_HAND: 'remove_all_hand',
  RAISE_USER_HAND: 'raise_hand',
  KICK_USER_FROM_ROOM: 'kick',
  DELETE_ROOM: 'room_delete',
  EXIT_ROOM: 'exit',
  JOIN_ROOM: 'join',
  VIDEO_ACCEPTED: 'accepted',
  VIDEO_REJECTED: 'rejected',
  VIDEO_REMOVED: 'removed',
  ROOM_CLOSE: 'room_close',
}

export const PM_WINDOW_SOCKET_TYPE = {
  ADD_USER: 'add',
  REMOVE_USER: 'remove',
  EXIT: 'exit',
}

export const PM_TYPE = {
  SINGLE: 'single',
  GROUP: 'group'
}

export const FIND_AND_ADD_USER_TYPE = {
  ADD_BLOCK_USER: 'block_user',
  ADD_CONTACT_USER: 'contact_user',
  BOTH: 'both'
}

export const ADMIN_CONTROL = {
  USERS_UNDER: [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '10', value: '10' },
    { label: '11', value: '11' },
    { label: '12', value: '12' },
    { label: '13', value: '13' },
    { label: '14', value: '14' },
    { label: '15', value: '15' },
    { label: '16', value: '16' },
    { label: '17', value: '17' },
    { label: '18', value: '18' },
    { label: '19', value: '19' },
    { label: '20', value: '20' }
  ],
  ONLY_USERS: [
    { label: '1-6', value: '1-6' },
    { label: '7-12', value: '7-12' },
    { label: '13-19', value: '13-19' },
    { label: '20-25', value: '20-25' }
  ]
}

export const CONTACT_LIST_TYPE = {
  NOTEBOOK: 'notebook',
  VOICEMAIL: 'voicemail',
  VIDEOMESSAGE: 'videomessage',
  STICKER_GIFT_SEND: 'stickerGiftSend'
}

export const VIDEO_VOICE_MODAL_TYPE = {
  CREATE: 'create',
  VIEW: 'view'
}

export const CMS_PAGE_TYPE = {
  DEFAULT: 'general',
  PM: 'pm',
  GROUPS: 'group',
}

export const CUSTOM_MESSAGE = {
  LOGIN_FORM: {
    WITHOUT_NICKNAME_PASSWORD: 'Please, enter a nickname or register a new one by clicking on the register button.',
  },
  OTHERS: {
    AUDIOMAIL_PASSWORD: 'Password of the voicemail needs to be between 6 and 16 digits',
    VIDEOMAIL_PASSWORD: 'Password of the voicemail needs to be between 6 and 16 digits',
    VOICE_OLD_MSG_LIMIT: 'You have reached the limit of storing voice messages. Please delete at least one of the old voice messages to access the new voice message',
    VIDEO_OLD_MSG_LIMIT: 'You have reached the limit of storing video messages. Please delete at least one of the old video messages to access the new video message',
    FIND_AND_ADD_USER: 'You must enter criteria then click on Search.',
    BLOCK_HIMSELF: 'You cannot add yourself to the Blocked List!',
    NO_NEARBY_USERS: 'There is no user nearby, please try again later.',
    FOLDER_SELECT_FIRST: 'Please select a folder first.',
  }
}

export const MULTI_RECIPIENT_MESSGE_OPTION = [{
  label: 'All',
  value: 'all'
}, {
  label: 'Favourite',
  value: 'favourite'
}, {
  label: 'Online',
  value: 'online'
}, {
  label: 'Offline',
  value: 'offline'
}]

export const GALLERY_IMAGE_LIMITATION = 31 //Include own image