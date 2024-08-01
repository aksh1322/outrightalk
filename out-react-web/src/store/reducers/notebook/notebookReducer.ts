import { ActionExtended } from 'src/_common/interfaces/ActionExtended';
import { ACTIONS, VIDEO_VOICE_NOTEBOOK_SOCKET_TYPE } from 'src/_config'
import { GetNoteBookContactListUsers, GetNotebookList } from 'src/_common/interfaces/models/notebook';

export interface NotebookReducer {
    getNotebookList: any | null;
    getNotebookContactListUser: GetNoteBookContactListUsers | null;
    getNotebookDetails: any;
}

const initialState: NotebookReducer = {
    getNotebookList: null,
    getNotebookContactListUser: null,
    getNotebookDetails: null,
}

const NotebookReducer = (state = initialState, action: ActionExtended) => {
    switch (action.type) {
        case ACTIONS.NOTEBOOK.GET_NOTEBOOK_LIST:
            return {
                ...state,
                getNotebookList: action.payload
            }
        case ACTIONS.NOTEBOOK.GET_NOTEBOOK_CONTACT_LIST:
            return {
                ...state,
                getNotebookContactListUser: action.payload
            }
        case ACTIONS.NOTEBOOK.GET_NOTEBOOK_DETAILS:
            return {
                ...state,
                getNotebookDetails: action.payload
            }

        case ACTIONS.NOTEBOOK.UPDATE_NOTEBOOK_LIST:

            let notebookListData = [ ...state.getNotebookList ]
            var { socketData, userId } = action.payload;

            switch (socketData.type) {
                case VIDEO_VOICE_NOTEBOOK_SOCKET_TYPE.SHARE_NOTEBOOK:
                    socketData && socketData.user.length && socketData.user.map((x: any) => {
                        if (x.id == userId) {
                            notebookListData.unshift(socketData.notebook_info)
                        }
                    })
                    break;

                case VIDEO_VOICE_NOTEBOOK_SOCKET_TYPE.REMOVE_NOTEBOOK:

                    let notebooklistIndex: number = notebookListData.findIndex((x: any) => x.id === socketData.notebook_info.id)
                    if (notebooklistIndex >= 0) {
                        socketData && socketData.user.length && socketData.user.map((x: any) => {
                            if (x.id == userId) {
                                notebookListData.splice(notebooklistIndex, 1)
                            }
                        })
                    }
                    break;

            }

            return {
                ...state,
                getNotebookList: notebookListData && notebookListData.length ? notebookListData.map((x: any) => Object.assign(x)) : []
            }

        default:
            return state;
    }
}
export default NotebookReducer;