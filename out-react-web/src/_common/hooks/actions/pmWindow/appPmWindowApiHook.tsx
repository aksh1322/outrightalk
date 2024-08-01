import { SAGA_ACTIONS } from 'src/_config'
import {
    SendPms,
    GetPmsDetailsReq,
    AddMemberIntoPmWindowReq,
    GetPmWindowChat,
    SendPmWindowChat,
    RemoveMemberFromWindowReq,
    PmCallAcceptRejectReq,
    ShowUsersLocationReq,
    ReadPmReq,
} from 'src/_common/interfaces/ApiReqRes'
import { useApiCall } from '../common/appApiCallHook'

export function usePmWindowApi() {

    const callApi = useApiCall()

    const sendPms = (data: SendPms, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.SEND_PM, data, onSuccess, onError);
    }

    const getPmsDetails = (data: GetPmsDetailsReq, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.PM_WINDOW_DETAILS, data, onSuccess, onError);
    }

    const inviteInPmNotification = (data: any, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.INVITE_IN_PM_NOTIFICATION, data, onSuccess, onError);
    }


    const addMemberIntoPmWindow = (data: AddMemberIntoPmWindowReq, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.ADD_MEMBER_INTO_PM_WINDOW, data, onSuccess, onError);
    }

    const removeMemberFromPmWindow = (data: RemoveMemberFromWindowReq, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.REMOVE_MEMBER_FROM_PM_WINDOW, data, onSuccess, onError);
    }

    const sendPmWindowChat = (data: SendPmWindowChat, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.SEND_CHAT, data, onSuccess, onError);
    }

    const getPmWindowChat = (data: GetPmWindowChat, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.GET_CHAT, data, onSuccess, onError);
    }

    const clearAllChatsInPm = (data: any, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.CLEAR_ALL_CHATS_IN_PM, data, onSuccess, onError);
    }

    const getActivePmWindows = (onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.ACTIVE_PM_WINDOW, null, onSuccess, onError);
    }

    const pmCallInitiateAndDisconnect = (data: any, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.PM_CALL_INITIATE_AND_DISCONNECT, data, onSuccess, onError);
    }

    const pmCallAcceptReject = (data: PmCallAcceptRejectReq, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.PM_CALL_ACCEPT_REJECT, data, onSuccess, onError);
    }

    const pmShowUsersLocation = (data: ShowUsersLocationReq, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.SHOW_USERS_LOCATION, data, onSuccess, onError);
    }

    const pmHeaderMenuSettingActionUpdate = (data: any, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.PM_WINDOW_HEADER_MENU_SETTING_ACTION_UPDATE, data, onSuccess, onError);
    }

    const pmHeaderMenuSaveDefaultSetting = (data: any, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.PM_WINDOW_HEADER_MENU_SAVE_DEFAULT_SETTING, data, onSuccess, onError);
    }

    const pmHeaderMenuResetDefaultSetting = (data: any, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.PM_WINDOW_HEADER_MENU_RESET_DEFAULT_SETTING, data, onSuccess, onError);
    }

    const exitPmWindow = (data: any, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.EXIT_PM_WINDOW, data, onSuccess, onError);
    }

    const readPm = (data: ReadPmReq, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.PM_READ, data, onSuccess, onError);
    }

    const getDigSoundList = (onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.GET_DIG_SOUND_LIST, null, onSuccess, onError);
    }

    const sendDigSound = (data: any, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.PM_WINDOW.SEND_DIG_SOUND, data, onSuccess, onError);
    }

    return {
        callSendPms: sendPms,
        callGetPmsDetails: getPmsDetails,
        callInviteInPmNotification: inviteInPmNotification,
        callAddMemberIntoPmWindow: addMemberIntoPmWindow,
        callRemoveMemberFromPmWindow: removeMemberFromPmWindow,
        callSendPmWindowChat: sendPmWindowChat,
        callGetPmWindowChat: getPmWindowChat,
        callClearAllChatsInPm: clearAllChatsInPm,
        callGetActivePmWindows: getActivePmWindows,
        callPmCallInitiateAndDisconnect: pmCallInitiateAndDisconnect,
        callPmShowUsersLocation: pmShowUsersLocation,
        callPmCallAcceptReject: pmCallAcceptReject,
        callExitPmWindow: exitPmWindow,
        callPmHeaderMenuSettingActionUpdate: pmHeaderMenuSettingActionUpdate,
        callPmHeaderMenuSaveDefaultSetting: pmHeaderMenuSaveDefaultSetting,
        callPmHeaderMenuResetDefaultSetting: pmHeaderMenuResetDefaultSetting,
        callReadPm: readPm,
        callGetDigSoundList: getDigSoundList,
        callSendDigSound: sendDigSound
    }
}