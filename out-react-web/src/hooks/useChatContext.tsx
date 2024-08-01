import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocalStorage } from "./useLocalStorage";

const ChatContext = createContext<any>({});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const {
    state: currentRoomURL,
    setState: setCurrentRoomURL,
    clearState: clearCurrentRoomURL,
  } = useLocalStorage<string>("CURRENT_ROOM_URL", "");
  const {
    state: currentSuperRoomURL,
    setState: setCurrentSuperRoomURL,
    clearState: clearCurrentSuperRoomURL,
  } = useLocalStorage<string>("CURRENT_SUPER_ROOM_URL", "");
  const [currentRoomChat, setCurrentRoomChat] = useState<any[]>([]);
  const [currentSuperRoomChat, setCurrentSuperRoomChat] = useState<any[]>([]);
  const [currentRoomMembers, setCurrentRoomMembers] = useState<any[]>([]);
  const [superRoomSettings, setSuperRoomSettings] = useState<any>({});
  const [currentPmAdminUserId, setCurrentPmAdminUserId] = useState<
    string | number
  >("");
  const [roomDetailsFromSocket, setRoomDetailsFromSocket] = useState<any>([]);
  const [sortNicknameAlphabetically, setSortNicknameAlphabetically] = useState(() => {
    const storedValue = localStorage.getItem("sortNicknameAlphabetically");
    return storedValue ? JSON.parse(storedValue) : false;
  });
  const [sortAutoScrollTextChat, setSortAutoScrollTextChat] = useState(() => {
    const storedValue = localStorage.getItem("sortAutoScrollTextChat");
    return storedValue ? JSON.parse(storedValue) : true;
  });
  
  useEffect(() => {}, [currentRoomChat]);

  return (
    <ChatContext.Provider
      value={{
        currentRoomURL,
        clearCurrentRoomURL,
        currentRoomChat,
        setCurrentRoomURL,
        setCurrentRoomChat,
        setCurrentSuperRoomChat,
        currentSuperRoomChat,
        currentRoomMembers,
        setCurrentRoomMembers,
        superRoomSettings,
        setSuperRoomSettings,
        currentSuperRoomURL,
        setCurrentSuperRoomURL,
        clearCurrentSuperRoomURL,
        setCurrentPmAdminUserId,
        currentPmAdminUserId,
        roomDetailsFromSocket,
        setRoomDetailsFromSocket,
        sortNicknameAlphabetically,
        setSortNicknameAlphabetically,
        sortAutoScrollTextChat,
        setSortAutoScrollTextChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export function useChatContext() {
  return useContext(ChatContext);
}
