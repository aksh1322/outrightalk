import React, { useEffect } from 'react'
import { confirmAlert } from 'react-confirm-alert';
import AppFeedback from '../../../components/elements/app-feedback/appFeedback';

export function useAppFeedback() {

  const showAlert = (
    message: string,
    autoClose: boolean,
    showBtn: boolean,
    btnText: string,
    onBtnPress: any,
    type: string, 
  ) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return <AppFeedback
          onClose={onClose}
          onBtnPress={onBtnPress}
          message={message}
          autoClose={autoClose}
          showBtn={showBtn}
          btnText={btnText}
          type={type}
        />
      },
      onClickOutside: () => {},
      onKeypressEscape: () => {}
    })
  }

  const info = (
    message: string,
    autoClose = false,
    showBtn = true,
    btnText = 'close',
    onBtnPress = () => { }
  ) => {
    showAlert(message, autoClose, showBtn, btnText, onBtnPress, 'info')
  }
  const warning = (
    message: string,
    autoClose = false,
    showBtn = true,
    btnText = 'close',
    onBtnPress = () => { }
  ) => {
    showAlert(message, autoClose, showBtn, btnText, onBtnPress, 'warning')
  }
  const success = (
    message: string,
    autoClose = false,
    showBtn = true,
    btnText = 'close',
    onBtnPress = () => { }
  ) => {
    showAlert(message, autoClose, showBtn, btnText, onBtnPress, 'success')
  }
  const error = (
    message: string,
    autoClose = false,
    showBtn = true,
    btnText = 'close',
    onBtnPress = () => { }
  ) => {
    showAlert(message, autoClose, showBtn, btnText, onBtnPress, 'error')
  }

  return { error, info, success, warning }
}