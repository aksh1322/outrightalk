import { useSelector } from 'react-redux'
import { StateExtended } from 'src/_common/interfaces/StateExtended'

//Invite unsers at room
export const useAppInstanceInvitedUsers = () => {
    const users = useSelector((state: StateExtended) => state.notification.notificationList)
    return users;
}