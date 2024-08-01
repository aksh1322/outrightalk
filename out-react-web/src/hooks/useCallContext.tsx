import React, { ReactNode, createContext, useContext, useState, useRef, MutableRefObject } from "react"
import { useLocalStorage } from "./useLocalStorage"
import SendbirdChat from "@sendbird/chat"
import SendBirdCall, { Room } from "sendbird-calls"
import { GroupChannelModule } from "@sendbird/chat/groupChannel"

type DisabledViewsForGroup = {
  [roomId: string]: string[];
}

type CallContextReturnType = {
  openCall: boolean,
  openAudioCall: boolean,
  audioAccess: boolean,
  videoAccess: boolean,
  currentCallRoomId: string,
  currentAudioCallRoomId: string,
  callRoom: Room | null,
  audioCallRoom: Room | null,
  disabledViews: DisabledViewsForGroup | undefined,
  remoteParticipants:  SendBirdCall.RemoteParticipant[],
  localParticipant:  SendBirdCall.LocalParticipant | null,
  currentCallMembers: (SendBirdCall.RemoteParticipant | SendBirdCall.LocalParticipant)[],
  allowedMicCount: number,
  invitationRec: any,
  showAlert: boolean,
  showYoutubeAlert:boolean
  acceptedFromInvite: boolean,
  callAcceptType: 'audio' | 'video' | null,
  microphoneState:boolean;
  setCallAcceptType: React.Dispatch<React.SetStateAction<'audio' | 'video' | null>>
  setAcceptedFromInvite: React.Dispatch<React.SetStateAction<boolean>>, 
  setAllowedMicCount: React.Dispatch<React.SetStateAction<number>>,
  setCallRoom: React.Dispatch<React.SetStateAction<Room | null>>,
  setAudioCallRoom: React.Dispatch<React.SetStateAction<Room | null>>,
  setRemoteParticipants: React.Dispatch<React.SetStateAction<SendBirdCall.RemoteParticipant[]>>,
  setLocalParticipant: React.Dispatch<React.SetStateAction<SendBirdCall.LocalParticipant | null>>,
  setOpenCall:  React.Dispatch<React.SetStateAction<boolean>>,
  setOpenAudioCall:  React.Dispatch<React.SetStateAction<boolean>>,
  setCurrentCallRoomId: React.Dispatch<React.SetStateAction<string>>,
  setCurrentAudioCallRoomId: React.Dispatch<React.SetStateAction<string>>,
  setAudioAccess: React.Dispatch<React.SetStateAction<boolean>>,
  setVideoAccess: React.Dispatch<React.SetStateAction<boolean>>,
  setDisabledViews: React.Dispatch<React.SetStateAction<DisabledViewsForGroup | undefined>>,
  setCurrentCallMembers: React.Dispatch<React.SetStateAction<(SendBirdCall.RemoteParticipant | SendBirdCall.LocalParticipant)[]>>,
  setInvitationRec: React.Dispatch<React.SetStateAction<SendBirdCall.RoomInvitation | null>>,
  setShowAlert:  React.Dispatch<React.SetStateAction<boolean>>,
  setShowYoutubeAlert:React.Dispatch<React.SetStateAction<boolean>>,
  setMicrophoneState:React.Dispatch<React.SetStateAction<boolean>>,
}

const callContextInitialValue: CallContextReturnType = {
  openCall: false,
  openAudioCall: false,
  videoAccess: true,
  audioAccess: true,
  remoteParticipants:  [],
  localParticipant: null,
  currentCallMembers: [],
  callRoom: null,
  audioCallRoom: null,
  disabledViews: {},
  currentCallRoomId: "",
  currentAudioCallRoomId: "",
  allowedMicCount: 1,
  invitationRec: null,
  showAlert: false,
  showYoutubeAlert:false,
  acceptedFromInvite: false,
  callAcceptType: null,
  microphoneState:false,
  setCallAcceptType: () => {},
  setAcceptedFromInvite: () => {},
  setRemoteParticipants: () => {},
  setLocalParticipant: () => {},
  setOpenCall: () => {},
  setOpenAudioCall: () => {},
  setAudioAccess: () => {},
  setVideoAccess: () => {},
  setCurrentCallMembers: () => {},
  setDisabledViews: () => {},
  setCurrentCallRoomId: () => {},
  setCurrentAudioCallRoomId: () => {},
  setCallRoom: () => {},
  setAudioCallRoom: () => {},
  setAllowedMicCount: () => {},
  setInvitationRec: () => { },
  setShowAlert: () => {},
  setShowYoutubeAlert: () => {},
  setMicrophoneState: () => {},
}

const CallContext = createContext<CallContextReturnType>(callContextInitialValue)


export const CallProvider = ({ children }: { children: ReactNode }) => {
  const [openCall, setOpenCall] = useState<boolean>(callContextInitialValue.openCall)
  const [openAudioCall, setOpenAudioCall] = useState<boolean>(callContextInitialValue.openAudioCall)
  const [audioAccess, setAudioAccess] = useState<boolean>(callContextInitialValue.audioAccess)
  const [videoAccess, setVideoAccess] = useState<boolean>(callContextInitialValue.videoAccess)
  const [localParticipant, setLocalParticipant] = useState<SendBirdCall.LocalParticipant | null>(callContextInitialValue.localParticipant)
  const [remoteParticipants, setRemoteParticipants] = useState<SendBirdCall.RemoteParticipant[]>(callContextInitialValue.remoteParticipants)
  const [currentCallMembers, setCurrentCallMembers] = useState<(SendBirdCall.RemoteParticipant | SendBirdCall.LocalParticipant)[]>(callContextInitialValue.currentCallMembers)
  const {state:disabledViews, setState: setDisabledViews} = useLocalStorage("DISABLED_VIEWS_FOR_GROUP_CALL_ROOMS",callContextInitialValue.disabledViews)
  const [currentCallRoomId, setCurrentCallRoomId] = useState<string>(callContextInitialValue.currentCallRoomId)
  const [currentAudioCallRoomId, setCurrentAudioCallRoomId] = useState<string>(callContextInitialValue.currentAudioCallRoomId)
  const [callRoom, setCallRoom] = useState<SendBirdCall.Room | null>(callContextInitialValue.callRoom)
  const [audioCallRoom, setAudioCallRoom] = useState<SendBirdCall.Room | null>(callContextInitialValue.audioCallRoom)
  const [allowedMicCount, setAllowedMicCount] = useState<number>(callContextInitialValue.allowedMicCount)
  const [invitationRec, setInvitationRec] = useState<SendBirdCall.RoomInvitation | null>(callContextInitialValue.invitationRec)
  const [showAlert, setShowAlert] = useState<boolean>(callContextInitialValue.showAlert)
  const [acceptedFromInvite, setAcceptedFromInvite] = useState<boolean>(callContextInitialValue.acceptedFromInvite)
  const [callAcceptType, setCallAcceptType] = useState<'audio' | 'video' | null>(callContextInitialValue.callAcceptType)
  const [showYoutubeAlert, setShowYoutubeAlert] = useState<boolean>(callContextInitialValue.showAlert)
  const [microphoneState , setMicrophoneState] = useState<boolean>(callContextInitialValue.microphoneState)

  return (
    <CallContext.Provider
      value={{
        callAcceptType,
        setCallAcceptType,
        acceptedFromInvite,
        setAcceptedFromInvite,
        openCall,
        openAudioCall,
        setOpenAudioCall,
        setOpenCall,
        audioAccess,
        setAudioAccess,
        videoAccess,
        setVideoAccess,
        remoteParticipants,
        setRemoteParticipants,
        localParticipant,
        setLocalParticipant,
        currentCallMembers,
        setCurrentCallMembers,
        callRoom,
        disabledViews,
        setDisabledViews,
        currentCallRoomId,
        setCurrentCallRoomId,
        currentAudioCallRoomId,
        setCurrentAudioCallRoomId,
        audioCallRoom,
        setAudioCallRoom,
        setCallRoom,
        allowedMicCount,
        setAllowedMicCount,
        invitationRec,
        setInvitationRec,
        showAlert,
        setShowAlert,
        showYoutubeAlert,
        setShowYoutubeAlert,
        microphoneState,
        setMicrophoneState
      }}
    >
      {children}
    </CallContext.Provider>
  )
}

export function useCallContext():CallContextReturnType {
  return useContext(CallContext)
}
