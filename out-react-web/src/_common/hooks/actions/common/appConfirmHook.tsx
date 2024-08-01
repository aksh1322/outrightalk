import React, { useEffect } from 'react'
import { confirmAlert } from 'react-confirm-alert';
import AppConfirm from '../../../components/elements/app-confirm/appConfirm';

export function useAppConfirm() {

  const showConfirm = (
    header: string,
    message: string,
    yesBtnText: string = 'Yes',
    noBtnText: string = 'No',
    onClickYes: () => void,
    onClickNo: () => void,
  ) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return <AppConfirm
          onClose={onClose}
          message={message}
          header={header}
          yesBtnText={yesBtnText}
          noBtnText={noBtnText}
          onClickYes={onClickYes}
          onClickNo={onClickNo}
        />
      },
      onClickOutside: () => {},
      onKeypressEscape: () => {}
    })
  }

  return showConfirm
}