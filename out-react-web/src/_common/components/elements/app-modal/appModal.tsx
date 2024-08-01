import React from 'react'
import { Modal } from 'react-bootstrap'

import './appModal.css'

interface AppModalProps {
  headerTitle: string;
  body?: string | React.ReactNode;
  footer?: string | React.ReactNode;
  onClose: () => void;
  shouldShow: boolean;
  size?: "sm" | "lg" | "xl",
  bodyClass?: string,
  hideClose?: boolean,
}

function AppModal({
  headerTitle,
  body,
  footer,
  onClose,
  shouldShow,
  size,
  bodyClass,
  hideClose,
}: AppModalProps) {
  return (
    <React.Fragment>
      <Modal
        show={shouldShow}
        size={size ? size : undefined}
        backdrop="static"
        keyboard={false}
        className="ne-modal-wrapper"
      >
        <Modal.Header>
          <h5 className="modal-title">
            {headerTitle}
          </h5>
          {
            hideClose ? null : <button type="button" className="close" onClick={onClose}>
              <img src="/images/close-btn-icon.png" alt=""/>
            </button>
          }
        </Modal.Header>
        <Modal.Body className={bodyClass} >
          {body}
        </Modal.Body>
        {
          footer ? <>
          <Modal.Footer>
          {footer}
          </Modal.Footer>
          </> : null
        }
      </Modal>
    </React.Fragment>
  )
}

export default AppModal
