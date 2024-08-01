import { useDispatch } from 'react-redux'
import { ACTIONS } from 'src/_config'

export function useAppPmWindowAction() {

    const dispatch = useDispatch()


    const SetTimeStamp =(body:any)=> {
dispatch({
    type:ACTIONS.PM_WINDOW.SET_TIMESTAMP_DATA,
    payload:body
})
    }
    const startCallOnClickAction = (body: any) => {
        dispatch({
            type: ACTIONS.PM_WINDOW.START_CALL_ON_CLICK,
            payload: body
        })
    }

    const updatePmWindowDetails = (socketData: any) => {
        var params = {
            socketData
        }
        dispatch({
            type: ACTIONS.PM_WINDOW.UPDATE_PM_DETAILS,
            payload: params
        })
    }

    const pushSocketDataToPmWindowChat = (socketData: any, userId: number) => {
        // console.log(socketData)
        // console.log(userId)
        var params = {
            socketData: socketData,
            userId: userId,
        }
        dispatch({
            type: ACTIONS.PM_WINDOW.CHAT.GET_SOCKET_DATA_AND_PUSH_TO_CHAT_LIST,
            payload: params
        })
    }

    const pmWindowAddRemoveUser = (socketData: any, userId: number) => {
        var params = {
            socketData,
            userId
        }
        dispatch({
            type: ACTIONS.PM_WINDOW.ADD_REMOVE_USERS,
            payload: params
        })
    }

    const activePmWindowPopDownHandler = (isOpen: boolean) => {
        dispatch({
            type: ACTIONS.PM_WINDOW.MY_ACTIVE_PM_WINDOW_ISOPEN_HANDLER,
            payload: isOpen,
        })
    }

    const openClosePmCallAlertModal = (isOpen: any) => {
        dispatch({
            type: ACTIONS.PM_WINDOW.OPEN_PM_CALL_ALERT_MODAL,
            payload: isOpen,
        })
    }

    const pmCallAccepted = (body: any) => {
        dispatch({
            type: ACTIONS.PM_WINDOW.PM_CALL_ACCEPTED,
            payload: body,
        })
    }

    //Chat data Select Deselect
    const pmWindowChatDataSelectDeselect = (category: string | null) => {
        dispatch({
            type: ACTIONS.PM_WINDOW.CHAT.SELECT_DESELECT_PM_CHAT_DATA,
            payload: category,
        })
    }

    //Pm window Incoming call
    const pmWindowReceiveIncomingCall = (action: any) => {
        dispatch({
            type: ACTIONS.PM_WINDOW.CALL.INCOMING_CALL_DETAILS,
            payload: action,
        })
    }

    const fromRouteHandler = (formRoute: any) => {
        dispatch({
            type: ACTIONS.PM_WINDOW.MY_ACTIVE_PMS_FROM_ROUTE,
            payload: formRoute,
        })
    }

    const pmChatTimestampToogle = (data: any) => {
        dispatch({
            type: ACTIONS.PM_WINDOW.MENU.PM_CHAT_TIMESTAMP_TOOGLE,
            payload: data
        })
    }

    const pmTypingNotification = (socketData: any, userId: number) => {
        var params = {
            socketData: socketData,
            userId: userId,
        }
        dispatch({
            type: ACTIONS.PM_WINDOW.TYPEING_NOTIFICATION,
            payload: params
        })
    }

    const recentPmsListData = (socketData: any) => {
        dispatch({
            type: ACTIONS.PM_WINDOW.RECENT_PMS_LIST,
            payload: socketData
        })
    }

    const digSoundSocketData = (socketData: any) => {
        dispatch({
            type: ACTIONS.PM_WINDOW.DIG_SOUND,
            payload: socketData
        })
    }


    return {
        pushSocketDataToPmWindowChat,
        activePmWindowPopDownHandler,
        pmWindowChatDataSelectDeselect,
        pmWindowReceiveIncomingCall,
        pmWindowAddRemoveUser,
        fromRouteHandler,
        pmChatTimestampToogle,
        pmTypingNotification,
        recentPmsListData,
        digSoundSocketData,
        updatePmWindowDetails,
        openClosePmCallAlertModal,
        pmCallAccepted,
        startCallOnClickAction,
        SetTimeStamp
    }
}