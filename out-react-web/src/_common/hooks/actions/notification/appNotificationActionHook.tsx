import { useDispatch } from 'react-redux'
import { ACTIONS } from 'src/_config'

export function useAppNotificationAction() {

    const dispatch = useDispatch()

    //Instance invited Users data
    const pushDataAtInstanceInvitedUsers = (socketData: any, userId: number) => {
        var params = {
            socketData,
            userId
        }
        dispatch({
            type: ACTIONS.USER.GROUPS_CATEGORY.INSTANCE_INVITE_AT_ROOM,
            payload: params
        })
    }

    //Remove Single Notification
    const removeSingleNotification = (notificationId: number) => {
        var params = {
            notificationId
        }
        dispatch({
            type: ACTIONS.NOTIFICATION.REMOVE_NOTIFICATION_SINGLE,
            payload: params
        })
    }

    return {
        pushDataAtInstanceInvitedUsers,
        removeSingleNotification,
    }
}