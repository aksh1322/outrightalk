import { useDispatch } from 'react-redux'
import { ACTIONS } from 'src/_config'

export function useAppNotebookAction() {

    const dispatch = useDispatch()

    const updateNotebookList = (data: any, userId: number) => {
        var params = {
            socketData: data,
            userId: userId,
        }
        dispatch({
            type: ACTIONS.NOTEBOOK.UPDATE_NOTEBOOK_LIST,
            payload: params
        })
    }

    const voiceVideoNotebookCount = (data: any, userId: any) => {
        var params = {
            socketData: data,
            userId: userId
        }
        dispatch({
            type: ACTIONS.NOTEBOOK.VIDEO_VOICE_NOTEBOOK_COUNT,
            payload: params
        })
    }

    return {
        updateNotebookList,
        voiceVideoNotebookCount,
    }
}