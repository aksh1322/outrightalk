import React, { useState, useEffect } from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import CheckboxInput from 'src/_common/components/form-elements/checkboxinput/checkboxInput'
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import { useAppUserPreferencesSelector } from 'src/_common/hooks/selectors/userPreferenceSelector';

import clsx from 'clsx';
import { useVideoMessageApi } from 'src/_common/hooks/actions/videoMessage/appVideoMessageApiHook';
import { useAppVideoMessageAction } from 'src/_common/hooks/actions/videoMessage/appVideoMessageActionHook';
import { useAppMessageList, useAppVideoMessageModalOpen } from 'src/_common/hooks/selectors/videoMessageSelector';
import { RestoreMessage } from 'src/_common/interfaces/ApiReqRes';
import SendVideoMessageModal from '../manageVideoMessage/sendVideoMessageModal';
import { CUSTOM_MESSAGE } from 'src/_config';


const VideoMsgSettingSchema = yup.object().shape({
  video_message_password: yup.string().when('enable_video_message_password', {
    is: true,
    then: (fieldSchema: any) => fieldSchema.required('Password is required').min(6, CUSTOM_MESSAGE.OTHERS.VIDEOMAIL_PASSWORD)
      .max(16, CUSTOM_MESSAGE.OTHERS.VIDEOMAIL_PASSWORD),
  }).nullable()
})



function VideoMailMsgSetting() {

  const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<any>({
    resolver: yupResolver(VideoMsgSettingSchema),
    defaultValues: {

      enable_video_message_password: false,
      video_message_password: '',
      receive_video_message_contact_list: false
    },
  })
  const [isShowPasswordField, setIsShowPasswordField] = useState(false)
  const [passwordTextToggle, setPasswordTextToggle] = useState('password')
  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector()
  const toast = useToaster()

  const videoVoiceMessageApi = useVideoMessageApi()
  const videoMessageAction = useAppVideoMessageAction()
  const videoMessageModalOpenSelector = useAppVideoMessageModalOpen()
  const [alert, setAlert] = useState<any>(null);
  const [videoMesssageList, setVideoMessageList] = useState<any>([])
  const [isMessageSelected, setIsMessageSelected] = useState<any>()
  const [selectedMessageTitle, setSelectedMessageTitle] = useState<any>()
  const [isMessageDeleted, setIsMessageDeleted] = useState<boolean>(false)

  const onSubmit = (values: any) => {
    let params = {
      enable_video_message_password: values.enable_video_message_password ? 1 : 0,
      video_message_password: (values.video_message_password && values.enable_video_message_password) ? values.video_message_password : '',
      receive_video_message_contact_list: values.receive_video_message_contact_list ? 1 : 0
    }
    preference.callSaveUserPreference(params, (message: string, resp: any) => {
      toast.success(message)
    }, (message: string) => {
      toast.error(message)
    })
  }

  useEffect(() => {
    if (preferenceSelector && preferenceSelector.list) {

      for (let i = 0; i < preferenceSelector.list.length; i++) {

        if (preferenceSelector.list[i].field_type_details == "checkbox") {
          let val = parseInt(preferenceSelector.list[i].val) ? true : false;
          setValue(preferenceSelector.list[i].key, val)
          if (preferenceSelector.list[i].key === 'enable_video_message_password' && val) {
            setIsShowPasswordField(true)
          }
        }

        setTimeout(() => {
          if (preferenceSelector.list[i].field_type_details == "text") {
            let val = parseInt(preferenceSelector.list[i].val) ? preferenceSelector.list[i].val : '';
            setValue(preferenceSelector.list[i].key, val)
          }
        }, 500)
      }
    }

  }, [preferenceSelector])


  const handleOnchange = (e: any) => {
    if (e) {
      setIsShowPasswordField(true)
    }
    else {
      setIsShowPasswordField(false)
    }
  }

  const handlePasswordTextToggle = () => {
    if (passwordTextToggle == 'password') {
      setPasswordTextToggle('text')
    }
    else {
      setPasswordTextToggle('password')
    }
  }

  const getVideoMessageList = () => {
    const params = {
      type: 'video'
    }
    videoVoiceMessageApi.callGetMessageList(params, (message: string, resp: any) => {
      if (resp) {
        setVideoMessageList([...resp.unread_message, ...resp.old_message, ...resp.deleted_message])
      }
    }, (message: string) => {
      toast.error(message)
    })
  }

  const restoreVideoMesage = (params: RestoreMessage) => {
    videoVoiceMessageApi.callRestoreMessage(params, (message: string, resp: any) => {
      if (resp) {
        toast.success(message)
        getVideoMessageList()
        setIsMessageSelected(null)
      }
    }, (message: string) => {
      toast.error(message)
    })
  }

  const deleteVideoMessage = (id: any) => {
    let fd = new FormData();
    const data = {
      record_id: [id]
    }

    for (const [key, value] of Object.entries(data)) {
      value.map((x: any) => fd.append('record_id[]', x))
    }

    videoVoiceMessageApi.callDeleteMessage(fd, (message: string, resp: any) => {
      if (resp) {
        // hideAlert();
        toast.success(message)
        getVideoMessageList()
        setIsMessageSelected(null)
      }
    }, (message: string) => {
      toast.error(message)
    })
  }

  const handleReplyMessage = (id: number, title: string) => {
    videoMessageAction.showVideoMessageModal(true, [id], '', '', `RE: ${title}`, true)
  }

  const handleRefreshMessageList = () => {
    getVideoMessageList()
    setIsMessageSelected(null)
    setSelectedMessageTitle('')
  }

  const handleSelectMessage = (id: number, title: string, isDeleted: boolean) => {
    setIsMessageSelected(id)
    setSelectedMessageTitle(title)
    setIsMessageDeleted(isDeleted)
  }

  useEffect(() => {
    getVideoMessageList()
  }, [])


  return (
    <React.Fragment>
      <div className="right-menu-details dark-box-inner inner_privacy">
        <h3>Video Message</h3>
        <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label >Enable video message password</label>
            <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox all_priv">
              <Controller
                control={control}
                name="enable_video_message_password"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <CheckboxInput
                    name={name}
                    onChange={
                      (e) => {
                        onChange(e)
                        handleOnchange(e)
                      }

                    }
                    classname="custom-control-input"
                    onBlur={onBlur}
                    value={value}
                    id="enable-video-message-password"
                    inputRef={ref}
                    label="Enable video message password"
                    error={errors.enable_video_message_password}
                  />
                )}
              />
            </div>
          </div>
          {isShowPasswordField ?
            <div className="form-group">
              <label>Video Message Password</label>
              <Controller
                control={control}
                name="video_message_password"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <FormTextInput
                    // name={name}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    inputRef={ref}
                    type={passwordTextToggle}
                    error={errors.video_message_password}
                    placeholder="password"
                  />
                )}
              />
              <span className="eye-password-text settings-eye" onClick={handlePasswordTextToggle}>
                {
                  passwordTextToggle == 'password' ?
                    <i className="fa fa-eye" aria-hidden="true"></i> :
                    <i className="fa fa-eye-slash" aria-hidden="true"></i>
                }
              </span>
            </div> : null}

          <div className="form-group">

            <div className="form-group">
              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox all_priv">
                <Controller
                  control={control}
                  name="receive_video_message_contact_list"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={onChange}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      id="receive-video-message-contact-list"
                      inputRef={ref}
                      label="Receive Video messages from contact list only"
                      error={errors.receive_video_message_contact_list}
                    />
                  )}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 my-account-outer">
                <ul className="my-account-list">
                  {
                    videoMesssageList && videoMesssageList.length ? videoMesssageList.map((message: any, index: number) =>
                      <li key={message.id}
                        className={
                          clsx({
                            'selected': isMessageSelected === message.id,
                            'text-line-through': message.deleted_at != null
                          })
                        }
                        onClick={() => handleSelectMessage(message.id, message.title, message.deleted_at ? true : false)}>
                        {
                          message.title
                        }
                      </li>

                    ) : <li>No message found</li>
                  }
                </ul>
              </div>
              <div className="col-md-12">
                <div className="form-group">
                  <button type="button"
                    disabled={
                      isMessageSelected ? (isMessageDeleted ? true : false) : true
                    }
                    className="btn theme-btn btn-primary mr-2 mt-3 waves-effect bt-gr"
                    onClick={() => handleReplyMessage(isMessageSelected, selectedMessageTitle)}
                  >
                    Reply
                  </button>

                  <button type="button"
                    disabled={
                      isMessageSelected ? (isMessageDeleted ? true : false) : true
                    }
                    className="btn theme-btn btn-primary mr-2 mt-3 waves-effect bt-red"
                    onClick={() => deleteVideoMessage(isMessageSelected)}
                  >
                    Delete
                  </button>

                  <button type="button"
                    disabled={
                      isMessageSelected ? (isMessageDeleted ? false : true) : true
                    }
                    className="btn theme-btn btn-primary mt-3 mr-2 waves-effect bt-red"
                    onClick={() => restoreVideoMesage({ record_id: isMessageSelected })}
                  >
                    Undo
                  </button>

                  <button type="button"
                    className="btn theme-btn btn-primary mt-3 mr-2 waves-effect bt-bl"
                    onClick={handleRefreshMessageList}
                  >
                    Refresh
                  </button>
                </div>
                <div className="col-md-12">
                  <span>
                    Select a message and press Delete button to delete it from saved VideoMessage list, or click on Undo button to recover it.
                  </span>
                  <br />
                </div>
              </div>
            </div>


            <div className="col-md-12">
              <span>
                For your security, change your VideoMessage Box Password periodically
              </span>
            </div>
            <div className="d-flex mt-5">
              <button type="submit" className="btn theme-btn btn-primary mr-2 waves-effect">Apply</button>
              {/* <button type="button" className="btn theme-btn btn-default waves-effect">Cancel</button> */}
            </div>
          </div>
        </form>
      </div>

      {
        videoMessageModalOpenSelector ?
          <SendVideoMessageModal
            shouldShow={videoMessageModalOpenSelector}
          />
          : null
      }

    </React.Fragment >
  )
}

export default VideoMailMsgSetting
