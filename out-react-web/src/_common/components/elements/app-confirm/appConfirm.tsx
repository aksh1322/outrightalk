import React from 'react'

import './appConfirm.css'

interface AppConfirmProps {
  header: string,
  message: string,
  yesBtnText: string,
  noBtnText: string,
  onClickYes: () => void,
  onClickNo: () => void,
  onClose: () => void,
}

function AppConfirm({
  message,
  yesBtnText,
  noBtnText,
  onClickNo,
  onClickYes,
  onClose,
  header,
}: AppConfirmProps) {
  return (
    <div className="modal-content confirm-content">
      <div className="modal-header">
        <h5 className="modal-title">{header}</h5>
        <button type="button" onClick={() => {
          onClickNo()
          onClose()
        }} className="close">
          <img src="/images/close-btn-icon.png" alt="" />
        </button>
      </div>
      <div className="modal-body p-0">
        <div className="p-3">
          <p>{message}</p>
        </div>
        <div className="p-3 d-flex justify-content-between align-items-center">
          <button className="btn confirm-btn btn-danger" onClick={() => {
            onClickNo()
            onClose()
          }} >{noBtnText}</button>
          <button className="btn confirm-btn btn-primary" onClick={() => {
            onClickYes()
            onClose()
          }} >{yesBtnText}</button>
        </div>
      </div>
    </div>
  )
}

export default AppConfirm
