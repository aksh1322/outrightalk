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
import { useAppMessageList, useAppVideoMessageModalOpen, useAppVoiceMailModalOpen } from 'src/_common/hooks/selectors/videoMessageSelector';
import { RestoreMessage } from 'src/_common/interfaces/ApiReqRes';
import SendVideoMessageModal from '../manageVideoMessage/sendVideoMessageModal';
import SendVoiceMailModal from '../manageVoiceMail/sendVoiceMailModal';
import { CUSTOM_MESSAGE } from 'src/_config';


const VoiceMailSettingSchema = yup.object().shape({
  voicemail_password: yup.string().when('enable_voicemail_password', {
    is: true,
    then: (fieldSchema: any) => fieldSchema.required('Password is required').min(6, CUSTOM_MESSAGE.OTHERS.AUDIOMAIL_PASSWORD)
      .max(16, CUSTOM_MESSAGE.OTHERS.AUDIOMAIL_PASSWORD),
  }).nullable()
})



function VoiceMailMsg() {

  const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<any>({
    resolver: yupResolver(VoiceMailSettingSchema),
    defaultValues: {
      enable_voicemail_password: false,
      voicemail_password: '',
      receive_voicemail_contact_list: false
    },
  })
  const [isShowPasswordField, setIsShowPasswordField] = useState(false)
  const [passwordTextToggle, setPasswordTextToggle] = useState('password')
  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector()
  const toast = useToaster()

  const videoVoiceMessageApi = useVideoMessageApi()
  const voiceMessageAction = useAppVideoMessageAction()
  const voiceMailModalOpenSelector = useAppVoiceMailModalOpen()
  const [alert, setAlert] = useState<any>(null);
  const [voiceMesssageList, setVoiceMessageList] = useState<any>([])
  const [isMessageSelected, setIsMessageSelected] = useState<any>()
  const [selectedMessageTitle, setSelectedMessageTitle] = useState<any>()
  const [isMessageDeleted, setIsMessageDeleted] = useState<boolean>(false)

  const onSubmit = (values: any) => {
    let params = {
      enable_voicemail_password: values.enable_voicemail_password ? 1 : 0,
      voicemail_password: (values.voicemail_password && values.enable_voicemail_password) ? values.voicemail_password : '',
      receive_voicemail_contact_list: values.receive_voicemail_contact_list ? 1 : 0
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
          if (preferenceSelector.list[i].key === 'enable_voicemail_password' && val) {
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

  const getVoiceMessageList = () => {
    const params = {
      type: 'voice'
    }
    videoVoiceMessageApi.callGetMessageList(params, (message: string, resp: any) => {
      if (resp) {
        setVoiceMessageList([...resp.unread_message, ...resp.old_message, ...resp.deleted_message])
      }
    }, (message: string) => {
      toast.error(message)
    })
  }

  const restoreVoiceMesage = (params: RestoreMessage) => {
    videoVoiceMessageApi.callRestoreMessage(params, (message: string, resp: any) => {
      if (resp) {
        toast.success(message)
        getVoiceMessageList()
        setIsMessageSelected(null)
      }
    }, (message: string) => {
      toast.error(message)
    })
  }

  const deleteVoiceMessage = (id: any) => {
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
        getVoiceMessageList()
        setIsMessageSelected(null)
      }
    }, (message: string) => {
      toast.error(message)
    })
  }

  const handleReplyMessage = (id: number, title: string) => {
    voiceMessageAction.showVoiceMailModal(true, [id], '', '', `RE: ${title}`, true)
  }

  const handleRefreshMessageList = () => {
    getVoiceMessageList()
    setIsMessageSelected(null)
    setSelectedMessageTitle('')
  }

  const handleSelectMessage = (id: number, title: string, isDeleted: boolean) => {
    setIsMessageSelected(id)
    setSelectedMessageTitle(title)
    setIsMessageDeleted(isDeleted)
  }

  useEffect(() => {
    getVoiceMessageList()
  }, [])

  return (
    <React.Fragment>
      <div className="right-menu-details dark-box-inner inner_privacy">
        <h3>Voice Mail Message</h3>
        <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label >Enable voicemail password</label>
            <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox all_priv">
              <Controller
                control={control}
                name="enable_voicemail_password"
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
                    id="enable-voicemail-password"
                    inputRef={ref}
                    label="Enable voicemail password"
                    error={errors.enable_voicemail_password}
                  />
                )}
              />
            </div>
          </div>
          {isShowPasswordField ?
            <div className="form-group">
              <label>Voice Mail Password</label>
              <Controller
                control={control}
                name="voicemail_password"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <FormTextInput
                    // name={name}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    inputRef={ref}
                    type={passwordTextToggle}
                    error={errors.voicemail_password}
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
                  name="receive_voicemail_contact_list"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={onChange}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      id="receive-voicemail-contact-list"
                      inputRef={ref}
                      label="Receive VoiceMail messages from contact list only"
                      error={errors.receive_voicemail_contact_list}
                    />
                  )}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 my-account-outer">
                <ul className="my-account-list">
                  {
                    voiceMesssageList && voiceMesssageList.length ? voiceMesssageList.map((message: any, index: number) =>
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
                    onClick={() => deleteVoiceMessage(isMessageSelected)}
                  >
                    Delete
                  </button>

                  <button type="button"
                    disabled={
                      isMessageSelected ? (isMessageDeleted ? false : true) : true
                    }
                    className="btn theme-btn btn-primary mt-3 mr-2 waves-effect bt-red"
                    onClick={() => restoreVoiceMesage({ record_id: isMessageSelected })}
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
                    Select a message and press Delete button to delete it from saved VoiceMessage list, or click on Undo button to recover it.
                  </span>
                  <br />
                </div>
              </div>
            </div>


            <div className="col-md-12">
              <span>
                For your security, change your VoiceMails Box Password periodically
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
        voiceMailModalOpenSelector ?
          <SendVoiceMailModal
            shouldShow={voiceMailModalOpenSelector}
          />
          : null
      }

    </React.Fragment >
  )
}

export default VoiceMailMsg
