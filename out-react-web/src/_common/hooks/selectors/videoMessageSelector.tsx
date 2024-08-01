import { useSelector } from 'react-redux'
import { StateExtended } from 'src/_common/interfaces/StateExtended'

export const useAppVideoMessageModalOpen = () => {
    const videoMessageModal = useSelector((state: StateExtended) => state.videoMessage.videoMessageModalShow)
    return videoMessageModal;
}

export const useAppVoiceMailModalOpen = () => {
    const voiceMailModal = useSelector((state: StateExtended) => state.videoMessage.voiceMailModalShow)
    return voiceMailModal;
}

export const useAppVideoVoiceMessageShareIds = () => {
    const videoShareIds = useSelector((state: StateExtended) => state.videoMessage.contactUsers)
    return videoShareIds;
}

export const useAppVideoVoiceMessageShareDateTime = () => {
    const dateTime = useSelector((state: StateExtended) => state.videoMessage.sendMessageDateTime)
    return dateTime;
}

export const useAppReplyMessageSelector = () => {
    const replyMessage = useSelector((state: StateExtended) => state.videoMessage.replyMessageProperty)
    return replyMessage;
}

export const useAppMessageList = () => {
    const messageList = useSelector((state: StateExtended) => state.videoMessage.getMessageList)
    return messageList;
}

export const useAppContactListUser = () => {
    const contactList = useSelector((state: StateExtended) => state.videoMessage.getContactListUser)
    return contactList;
}