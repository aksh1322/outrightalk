import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import {
  MdCheckCircle,
  MdError,
  MdInfo,
  MdWarning,
} from 'react-icons/md'

import './appFeedback.css';


interface AppFeedbackProps {
  onClose(): any;
  onBtnPress(): any;
  message: string;
  autoClose: boolean;
  showBtn: boolean;
  btnText: string;
  type: string;
}

function AppFeedback(props: AppFeedbackProps) {
  const wrapperClass = classnames('ws-app-feedback-container', props.type)
  const iconClass = classnames('ws-app-feedback-icon', props.type)

  let autoCloseTimer: any = null

  useEffect(() => {
    if (props.autoClose) {
      autoCloseTimer = setTimeout(() => {
        props.onClose();
      }, 2000);
    }
    return () => {
      if (props.autoClose && autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    }
  }, [props.autoClose])

  return (
    <div className={wrapperClass}>
      <div className="ws-app-feedback-icon-container">
        {
          props.type == 'info' ? <div className={iconClass}>
            <MdInfo/>
          </div> : null
        }
        {
          props.type == 'warning' ? <div className={iconClass}>
            <MdWarning/>
          </div> : null
        }
        {
          props.type == 'error' ? <div className={iconClass}>
            <MdError/>
          </div> : null
        }
        {
          props.type == 'success' ? <div className={iconClass}>
            <MdCheckCircle/>
          </div> : null
        }
      </div>
      <p className="ws-app-feedback-message">{props.message}</p>
      {
        props.showBtn ? <div className="ws-app-feedback-btn-container">
          <button className="ws-app-feedback-btn" onClick={() => {
            props.onBtnPress && props.onBtnPress()
            props.onClose()
          }} >{props.btnText}</button>
        </div> : null
      }
    </div>
  )
}

AppFeedback.propTypes = {
  onClose: PropTypes.func.isRequired,
  onBtnPress: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  autoClose: PropTypes.bool.isRequired,
  showBtn: PropTypes.bool.isRequired,
  btnText: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
}

export default AppFeedback