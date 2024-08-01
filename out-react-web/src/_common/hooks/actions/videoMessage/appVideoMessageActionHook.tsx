import { useDispatch } from 'react-redux'
import { ACTIONS } from 'src/_config'

export function useAppVideoMessageAction() {

    const dispatch = useDispatch()

    const showVideoMessageModal = (isOpen: boolean, contactUsers: number[], sendMessageDate: string | null, sendMessageTime: string | null, title: string, status: boolean) => {
        dispatch({
            type: ACTIONS.VIDEO_VOICE_MESSAGE.VIDEO_MESSAGE_MODAL,
            payload: {
                isOpen,
                contactUsers,
                sendMessageDate,
                sendMessageTime,
                title,
                status
            }
        })
    }

    const showVoiceMailModal = (isOpen: boolean, contactUsers: number[], sendMessageDate: string | null, sendMessageTime: string | null, title: string, status: boolean) => {
        dispatch({
            type: ACTIONS.VIDEO_VOICE_MESSAGE.VOICE_MAIL_MODAL,
            payload: {
                isOpen,
                contactUsers,
                sendMessageDate,
                sendMessageTime,
                title,
                status
            },
        })
    }

    const updateVideoMessageList = (data: any, userId: number) => {
        var params = {
            socketData: data,
            userId: userId,
        }
        dispatch({
            type: ACTIONS.VIDEO_VOICE_MESSAGE.UPDATE_VIDEO_MESSAGE_LIST,
            payload: params
        })
    }

    const updateVoiceMessageList = (data: any, userId: number) => {
        var params = {
            socketData: data,
            userId: userId,
        }
        dispatch({
            type: ACTIONS.VIDEO_VOICE_MESSAGE.UPDATE_VOICE_MESSAGE_LIST,
            payload: params
        })
    }

    return {
        showVideoMessageModal,
        showVoiceMailModal,
        updateVideoMessageList,
        updateVoiceMessageList,
    }
}