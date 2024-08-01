import { SAGA_ACTIONS } from 'src/_config'
import {
    CreateNotebook,
    UpdateNotebook,
    ShareNotebook,
    GetNotebookContactList,
    NotebookDetails,
    DeleteNotebook,
    RemoveNotebookShare,
} from 'src/_common/interfaces/ApiReqRes'
import { useApiCall } from '../common/appApiCallHook'
import { call } from 'redux-saga/effects'

export function useNotebookApi() {

    const callApi = useApiCall()

    const createNotebook = (data: CreateNotebook, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.NOTEBOOK.CREATE_NOTEBOOK, data, onSuccess, onError);
    }

    const updateNotebook = (data: UpdateNotebook, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.NOTEBOOK.UPDATE_NOTEBOOK, data, onSuccess, onError);
    }

    const shareNotebook = (data: ShareNotebook, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.NOTEBOOK.SHARE_NOTEBOOK, data, onSuccess, onError);
    }

    const notebookDetails = (data: NotebookDetails, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.NOTEBOOK.NOTEBOOK_DETAILS, data, onSuccess, onError);
    }

    const deleteNotebook = (data: DeleteNotebook, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.NOTEBOOK.DELETE_NOTEBOOK, data, onSuccess, onError);
    }

    const removeNotebookShare = (data: RemoveNotebookShare, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.NOTEBOOK.REMOVE_NOTEBOOK_SHARE, data, onSuccess, onError);
    }

    const notebookList = (onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.NOTEBOOK.NOTEBOOK_LIST, null, onSuccess, onError);
    }

    const notebookContactList = (data: GetNotebookContactList, onSuccess: Function, onError: Function) => {
        callApi(SAGA_ACTIONS.NOTEBOOK.NOTEBOOK_CONTACT_LIST, data, onSuccess, onError);
    }

    return {
        callCreateNotebook: createNotebook,
        callUpdateNotebook: updateNotebook,
        callShareNotebook: shareNotebook,
        callNotebookDetails: notebookDetails,
        callDeleteNotebook: deleteNotebook,
        callRemoveNotebookShare: removeNotebookShare,
        callNotebookList: notebookList,
        callNotebookContactList: notebookContactList,
    }
}