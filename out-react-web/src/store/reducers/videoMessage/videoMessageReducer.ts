import { ActionExtended } from 'src/_common/interfaces/ActionExtended';
import { ACTIONS, VIDEO_VOICE_NOTEBOOK_SOCKET_TYPE } from 'src/_config'
import { GetMessageList, GetContactListUsers } from 'src/_common/interfaces/models/videoMessage';

export interface VideoMessageReducer {
    videoMessageModalShow: boolean;
    voiceMailModalShow: boolean;
    contactUsers: number[];
    sendMessageDateTime: any;
    replyMessageProperty: any;
    getMessageList: GetMessageList | null;
    // getMessageList: any | null;
    getContactListUser: GetContactListUsers | null;
}

const initialState: VideoMessageReducer = {
    videoMessageModalShow: false,
    voiceMailModalShow: false,
    contactUsers: [],
    sendMessageDateTime: {
        date: '',
        time: ''
    },
    replyMessageProperty: {
        title: '',
        disable: false
    },
    getMessageList: null,
    getContactListUser: null,
}


const videoMessageReducer = (state = initialState, action: ActionExtended) => {

    switch (action.type) {
        case ACTIONS.VIDEO_VOICE_MESSAGE.VIDEO_MESSAGE_MODAL:
            return {
                ...state,
                videoMessageModalShow: action.payload.isOpen,
                contactUsers: action.payload.contactUsers,
                sendMessageDateTime: {
                    date: action.payload.sendMessageDate,
                    time: action.payload.sendMessageTime
                },
                replyMessageProperty: {
                    title: action.payload.title,
                    disable: action.payload.status
                }
            }

        case ACTIONS.VIDEO_VOICE_MESSAGE.VOICE_MAIL_MODAL:
            return {
                ...state,
                voiceMailModalShow: action.payload.isOpen,
                contactUsers: action.payload.contactUsers,
                sendMessageDateTime: {
                    date: action.payload.sendMessageDate,
                    time: action.payload.sendMessageTime
                },
                replyMessageProperty: {
                    title: action.payload.title,
                    disable: action.payload.status
                }
            }

        case ACTIONS.VIDEO_VOICE_MESSAGE.GET_MESSAGE_LIST:
            return {
                ...state,
                getMessageList: action.payload
            }

        case ACTIONS.VIDEO_VOICE_MESSAGE.GET_CONTACT_LIST_USER:
            return {
                ...state,
                getContactListUser: action.payload
            }

        case ACTIONS.VIDEO_VOICE_MESSAGE.UPDATE_VOICE_MESSAGE_LIST:
            let voiceMessageListData: any = { ...state.getMessageList };
            var { socketData, userId } = action.payload;

            socketData && socketData.user.length && socketData.user.map((x: any) => {
                if (x.id == userId) {
                    if (voiceMessageListData && voiceMessageListData.unread_message) {
                        voiceMessageListData.unread_message.unshift(x.info)
                    }
                }
            })

            return {
                ...state,
                getMessageList: {
                    ...voiceMessageListData,
                    unread_message: voiceMessageListData && voiceMessageListData.unread_message && voiceMessageListData.unread_message.length ? voiceMessageListData.unread_message.map((x: any) => Object.assign(x)) : []
                }
            }

        case ACTIONS.VIDEO_VOICE_MESSAGE.UPDATE_VIDEO_MESSAGE_LIST:
            let videoMessageListData: any = { ...state.getMessageList };
            var { socketData, userId } = action.payload;

            socketData && socketData.user.length && socketData.user.map((x: any) => {
                if (x.id == userId) {
                    if (videoMessageListData && videoMessageListData.unread_message) {
                        videoMessageListData.unread_message.unshift(x.info)
                    }
                }
            })

            return {
                ...state,
                getMessageList: {
                    ...videoMessageListData,
                    unread_message: videoMessageListData && videoMessageListData.unread_message && videoMessageListData.unread_message.length ? videoMessageListData.unread_message.map((x: any) => Object.assign(x)) : []
                }
            }

        default:
            return state;
    }
}

export default videoMessageReducer;