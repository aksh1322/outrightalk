import React, {
  ReactNode,
  createContext,
  useContext,
  useState,
  useRef,
  MutableRefObject,
  useEffect,
} from "react";
import { useLocalStorage } from "./useLocalStorage";

type NotificationContextReturnType = {
  state: string;
  isAlert: boolean;
  isAccepted: boolean;
  isPmAlert: boolean;
  isRoomAlert: boolean;
  giftRec: any;
  pmNotificationType: boolean;
  pmInviteData: any;
  RoomInviteData: any;
  offlineUserStatus: any;
  onlineUserStatus: any;
  pmRemoveUserNotification: any;
  giftAcceptedNotification: any;
  setState: React.Dispatch<React.SetStateAction<string>>;
  setIsAlert: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  setGiftRcv: React.Dispatch<React.SetStateAction<any>>;
  setPmNotificationType: React.Dispatch<React.SetStateAction<any>>;
  setPmInviteData: React.Dispatch<React.SetStateAction<any>>;
  setIsPmAlert: React.Dispatch<React.SetStateAction<any>>;
  setRoomInviteData: React.Dispatch<React.SetStateAction<any>>;
  setIsRoomAlert: React.Dispatch<React.SetStateAction<any>>;
  setOfflineUserStatus: React.Dispatch<React.SetStateAction<any>>;
  setPmRemoveUserNotification: React.Dispatch<React.SetStateAction<any>>;
  setOnlineUserStatus: React.Dispatch<React.SetStateAction<any>>;
  setGiftAcceptedNotification: React.Dispatch<React.SetStateAction<any>>;
};

const notificationContextInitialValue: NotificationContextReturnType = {
  state: "initial",
  isAlert: false,
  isAccepted: false,
  giftRec: null,
  pmNotificationType: false,
  pmInviteData: null,
  RoomInviteData: null,
  isPmAlert: false,
  isRoomAlert: false,
  offlineUserStatus: null,
  onlineUserStatus: null,
  pmRemoveUserNotification: false,
  giftAcceptedNotification: null,  
  setIsAccepted: () => {},
  setState: () => {},
  setIsAlert: () => {},
  setGiftRcv: () => {},
  setPmNotificationType: () => {},
  setPmInviteData: () => {},
  setIsPmAlert: () => {},
  setRoomInviteData: () => {},
  setIsRoomAlert: () => {},
  setOfflineUserStatus: () => {},
  setOnlineUserStatus: () => {},
  setPmRemoveUserNotification: () => {},
  setGiftAcceptedNotification: () => {},
};

const NotificationContext = createContext<NotificationContextReturnType>(
  notificationContextInitialValue
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(notificationContextInitialValue.state);
  const [isAlert, setIsAlert] = useState(
    notificationContextInitialValue.isAlert
  );
  const [isAccepted, setIsAccepted] = useState(
    notificationContextInitialValue.isAccepted
  );
  const [giftRec, setGiftRcv] = useState(
    notificationContextInitialValue.giftRec
  );
  const [pmNotificationType, setPmNotificationType] = useState(
    notificationContextInitialValue.pmNotificationType
  );
  const [giftAcceptedNotification, setGiftAcceptedNotification] = useState(
    notificationContextInitialValue.giftAcceptedNotification
  );

  const [pmInviteData, setPmInviteData] = useState(
    notificationContextInitialValue.pmInviteData
  );
  const [RoomInviteData, setRoomInviteData] = useState(
    notificationContextInitialValue.RoomInviteData
  );
  const [isPmAlert, setIsPmAlert] = useState(
    notificationContextInitialValue.isPmAlert
  );
  const [isRoomAlert, setIsRoomAlert] = useState(
    notificationContextInitialValue.isRoomAlert
  );
  const [offlineUserStatus, setOfflineUserStatus] = useState(
    notificationContextInitialValue.offlineUserStatus
  );
  const [onlineUserStatus, setOnlineUserStatus] = useState(
    notificationContextInitialValue.onlineUserStatus
  );
  const [pmRemoveUserNotification, setPmRemoveUserNotification] = useState(
    notificationContextInitialValue.pmRemoveUserNotification
  );
  useEffect(() => {
    console.log(isAlert, isAccepted, giftRec, isPmAlert);
  }, [isAlert, isAccepted, giftRec, isPmAlert,isRoomAlert,RoomInviteData]);

  return (
    <NotificationContext.Provider
      value={{
        state,
        isAlert,
        isAccepted,
        giftRec,
        pmNotificationType,
        pmInviteData,
        isPmAlert,
        isRoomAlert,
        RoomInviteData,
        offlineUserStatus,
        onlineUserStatus,
        pmRemoveUserNotification,
        giftAcceptedNotification,
        setIsAccepted,
        setIsAlert,
        setState,
        setGiftRcv,
        setPmInviteData,
        setIsPmAlert,
        setIsRoomAlert,
        setRoomInviteData,
        setPmNotificationType,
        setOfflineUserStatus,
        setOnlineUserStatus,
        setPmRemoveUserNotification,
        setGiftAcceptedNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotificationsContext(): NotificationContextReturnType {
  return useContext(NotificationContext);
}
