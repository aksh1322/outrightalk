import { SAGA_ACTIONS } from 'src/_config'
import {
    IsPasswordProtectedPage,
    CheckPassword,
    GetContactListUsers,
    SendMessage,
    GetMessageList,
    DeleteMessage,
    RestoreMessage,
    ViewMessage,
    CheckAvailabilityUser
} from 'src/_common/interfaces/ApiReqRes'
import { useApiCall } from '../common/appApiCallHook'
import { call } from 'redux-saga/effects'

export function useVideoMessageApi() {

    const callApi = useApiCall()

    const isPasswordProtectedPage = (data: IsPasswordProtectedPage, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.IS_PAGE_PASSWORD_PROTECTED, data, onSuccess, onError);
    }

    const checkPassword = (data: CheckPassword, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.CHECK_PASSWORD, data, onSuccess, onError);
    }

    const getContactListUser = (data: GetContactListUsers, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.GET_CONTACT_LIST, data, onSuccess, onError);
    }

    const sendMessage = (data: SendMessage, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.SEND_MESSAGE, data, onSuccess, onError);
    }

    const getMessageList = (data: GetMessageList, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.GET_MESSAGE_LIST, data, onSuccess, onError);
    }

    const deleteMessage = (data: DeleteMessage, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.DELETE_MESSAGE, data, onSuccess, onError);
    }

    const restoreMessage = (data: RestoreMessage, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.RESTORE_MESSAGE, data, onSuccess, onError);
    }

    const viewMessage = (data: ViewMessage, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.VIEW_MESSAGE, data, onSuccess, onError);
    }

    const checkAvailabilityUser = (data: CheckAvailabilityUser, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.VIDEO_VOICE_MESSAGE.CHECK_AVAILABILITY_USER, data, onSuccess, onError);
    }

    return {
        callIsPasswordProtectedPage: isPasswordProtectedPage,
        callCheckPassword: checkPassword,
        callGetContactListUser: getContactListUser,
        callSendMessage: sendMessage,
        callGetMessageList: getMessageList,
        callDeleteMessage: deleteMessage,
        callRestoreMessage: restoreMessage,
        callViewMessage: viewMessage,
        callCheckAvailabilityUser: checkAvailabilityUser,
    }
}