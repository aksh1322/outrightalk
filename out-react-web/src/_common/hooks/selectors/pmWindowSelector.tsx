import { useSelector } from 'react-redux'
import { StateExtended } from 'src/_common/interfaces/StateExtended'

export const usePmStartCallOnClickFieldSelector = () => {
    const pmChatTimestamp = useSelector((state: StateExtended) => state.pmWindow.startingCallOnClick)
    return pmChatTimestamp;
}
export const usePmTimeStampSelector = () => {
    const pmTimestamp = useSelector((state: StateExtended) => state.pmWindow.startCheckTimeStamp)
    return pmTimestamp; 
}


export const useAppPmWindowDetails = () => {
    const pmWindow = useSelector((state: StateExtended) => state.pmWindow.pmWindowDetails)  
    return pmWindow;
}

export const useAppPmWindowChatDetailsSelector = () => {
    const pmChat = useSelector((state: StateExtended) => state.pmWindow.pmWindowRoomChat)
    return pmChat;
}

export const useAppIsOpenActivePmWindowSelector = () => {
    const activePmWindowIsOpen = useSelector((state: StateExtended) => state.pmWindow.isOpenMyActivePmWindowPopDown)
    return activePmWindowIsOpen;
}

export const useAppIsOpenPmWindowCallAlertSelector = () => {
    const activePmWindowIsOpen = useSelector((state: StateExtended) => state.pmWindow.pmCallAlertModal)
    return activePmWindowIsOpen;
}

export const useAppPmWindowIsCallAcceptedSelector = () => {
    const activePmWindowIsOpen = useSelector((state: StateExtended) => state.pmWindow.pmCallAccepted)
    return activePmWindowIsOpen;
}

export const useAppActivePmWindowListSelector = () => {
    const activePmWindowList = useSelector((state: StateExtended) => state.pmWindow.activePmWindowList)
    return activePmWindowList;
}

export const useAppPmChatDataSelectDeselect = () => {
    const chatData = useSelector((state: StateExtended) => state.pmWindow.chatDataSelectDeselect)
    return chatData;
}

export const useAppPmWindowIncomingCall = () => {
    const incomingCall = useSelector((state: StateExtended) => state.pmWindow.pmWindowIncomingCall)
    return incomingCall;
}

export const useAppActivePmsRouteSelector = () => {
    const activeRoute = useSelector((state: StateExtended) => state.pmWindow.fromRoute)
    return activeRoute;
}

export const usePmChatTimestampToogleSelector = () => {
    const pmChatTimestamp = useSelector((state: StateExtended) => state.pmWindow.pmChatTimestampToogle)
    return pmChatTimestamp;
}

export const usePmChatTypingSelector = () => {
    const pmChatTyping = useSelector((state: StateExtended) => state.pmWindow.pmTypingNotification)
    return pmChatTyping;
}

export const usePmDigSoundSelector = () => {
    const pmDigSound = useSelector((state: StateExtended) => state.pmWindow.pmDigSound)
    return pmDigSound;
}
