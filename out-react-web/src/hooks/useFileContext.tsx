import React, {
  ReactNode,
  createContext,
  useContext,
  useState,
  useRef,
  MutableRefObject,
  useEffect,
} from "react"
import { useLocalStorage } from "./useLocalStorage"
import ReactDOM from "react-dom"
import SweetAlert from "react-bootstrap-sweetalert"
import { API_BASE_URL, LOGIN_STORAGE } from "src/_config"

type FileContextReturnType = {
  showSendFileModal: boolean
  showRecieveFileModal: boolean
  fileRecieveInfo: any
  setShowSendFileModal: React.Dispatch<React.SetStateAction<boolean>>
  setShowRecieveFileModal: React.Dispatch<React.SetStateAction<boolean>>
  setFileRecieveInfo: React.Dispatch<React.SetStateAction<any>>
}

const fileContextInitialValue: FileContextReturnType = {
  showSendFileModal: false,
  showRecieveFileModal: false,
  fileRecieveInfo: null,
  setShowSendFileModal: () => {},
  setShowRecieveFileModal: () => {},
  setFileRecieveInfo: () => {},
}

const FileContext = createContext<FileContextReturnType>(fileContextInitialValue)

export const FileContextProvider = ({ children }: { children: ReactNode }) => {
  const [showSendFileModal, setShowSendFileModal] = useState<boolean>(
    fileContextInitialValue.showSendFileModal,
  )
  const [showRecieveFileModal, setShowRecieveFileModal] = useState<boolean>(
    fileContextInitialValue.showRecieveFileModal,
  )
  const [fileRecieveInfo, setFileRecieveInfo] = useState<any>(
    fileContextInitialValue.setFileRecieveInfo,
  )

  const [message, setMessage] = useState<string>("")

  const value = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS)
  const {
    id: signedInUserId,
  } = value ? JSON.parse(value) : ""

  

  async function handleConfirmation() {


    try {
      const filePath = fileRecieveInfo.url
      const response = await fetch(filePath);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'your-filename.mp3');
      document.body.appendChild(link);
      link.click();
      link?.parentNode?.removeChild(link);
      
      setShowRecieveFileModal(false)

    } catch (error) {
      console.error('Error occurred while downloading the file:', error);
    }
    
  }

  useEffect(() => {
    if (!fileRecieveInfo || fileRecieveInfo?.user.length < 1) return
    const user = fileRecieveInfo?.user?.find((user: any) => +user?.to_user_id === +signedInUserId)
    setMessage(user?.message || "")
  }, [fileRecieveInfo])

  return (
    <FileContext.Provider
      value={{
        showSendFileModal,
        showRecieveFileModal,
        fileRecieveInfo,
        setShowRecieveFileModal,
        setShowSendFileModal,
        setFileRecieveInfo,
      }}
    >
      {children}
      {showRecieveFileModal &&
        ReactDOM.createPortal(
          <SweetAlert
            warning
            showCancel
            confirmBtnText="Accept"
            cancelBtnText="Reject"
            cancelBtnBsStyle="danger"
            confirmBtnBsStyle="success"
            allowEscape={false}
            closeOnClickOutside={false}
            title={message}
            onConfirm={handleConfirmation}
            onCancel={() => {
              setShowRecieveFileModal(false)
            }}
            focusCancelBtn={false}
          ></SweetAlert>,
          document.getElementById("file-recieve-popup") as Element,
        )}
    </FileContext.Provider>
  )
}

export function useFileContext(): FileContextReturnType {
  return useContext(FileContext)
}
