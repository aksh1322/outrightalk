import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ContentEditable from 'react-contenteditable'
import moment from 'moment';
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import CheckboxInput from 'src/_common/components/form-elements/checkboxinput/checkboxInput'
import SelectInput from '../../_common/components/form-elements/selectinput/selectInput';
import TimePicker from 'src/_common/components/form-elements/timePicker/timePicker';
import { useAppUserPreferencesSelector } from 'src/_common/hooks/selectors/userPreferenceSelector';
import { calculateMinTime, DATE_ALL_FORMAT, sort_by, TIME_CONFIG } from 'src/_config';
import _, { values } from 'lodash';
import DateInput from 'src/_common/components/form-elements/datepicker/dateInput';
import EditorInputBasic from 'src/_common/components/form-elements/ckTextEditor/ckEditorInputBasic';


const AutoReplySettingSchema = yup.object().shape({
  selected_message_id: yup.object().when('enable_auto_reply', {
    is: true,
    then: (fieldSchema: any) => fieldSchema.required('Message is required'),
  }).nullable()
})

function AutoReplySetting() {
  const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<any>({
    resolver: yupResolver(AutoReplySettingSchema),
    defaultValues: {
      enable_auto_reply: false,
      selected_message_id: '',
      customize_auto_reply_msg: '',
      // start_time_dd: '',
      // start_time_mm: '',
      // start_time_hour: '',
      // end_time_dd: '',
      // end_time_mm: '',
      // end_time_hour: '',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      send_automatic_chatting_with_me: false,
    },
  })
  const [chatText, setChatText] = useState('')
  const [welcomeMsgList, setWelcomeMsgList] = useState<any>([]);
  const chatTextRef = useRef('');
  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector()
  const toast = useToaster()
  const [initialDisableState, setInitialDisableState] = useState<boolean>(true)
  const [autoReplyMessageSelectDisableState, setautoReplyMessageSelectDisableState] = useState<boolean>(true)
  const [customAutoReplyMessageDisableState, setCustomAutoReplyMessageDisableState] = useState<boolean>(true)
  const [alwaysSendAutoreplyDisableState, setAlwaysSendAutoreplyDisableState] = useState<boolean>(true)
  const [isAutoReplyDbcheckBoxDisableStatus, setIsAutoReplyDbcheckBoxDisableStatus] = useState<boolean>(true)
  const [dateTimeDisableState, setDateTimeDisableState] = useState<boolean>(true)
  const [startDateminTime, setStartDateminTime] = useState(calculateMinTime(new Date()))
  const [endDateminTime, setEndDateMinTime] = useState(calculateMinTime(new Date()))



  const onSubmit = (values: any) => {
    let params = {
      enable_auto_reply: values.enable_auto_reply ? 1 : 0,
      // start_time_dd: values.start_time_dd ? values.start_time_dd : null,
      // start_time_mm: values.start_time_mm ? values.start_time_mm : null,
      // start_time_hour: values.start_time_hour ? moment(values.start_time_hour).format(TIME_CONFIG.TIME_FORMAT) : null,
      // end_time_dd: values.end_time_dd ? values.end_time_dd : null,
      // end_time_mm: values.end_time_mm ? values.end_time_mm : null,
      // end_time_hour: values.end_time_hour ? moment(values.end_time_hour).format(TIME_CONFIG.TIME_FORMAT) : null,
      selected_message_id: values.selected_message_id && values.selected_message_id.value ? parseInt(values.selected_message_id.value) : null,
      customize_auto_reply_msg: values.customize_auto_reply_msg ? values.customize_auto_reply_msg : null,
      start_date: values.start_date ? (values.send_automatic_chatting_with_me ? null : moment(values.start_date).format(DATE_ALL_FORMAT.MOMENT_FORMAT)) : null,
      start_time: values.start_time ? (values.send_automatic_chatting_with_me ? null : moment(values.start_time).format(TIME_CONFIG.TIME_FORMAT)) : null,
      end_date: values.end_date ? (values.send_automatic_chatting_with_me ? null : moment(values.end_date).format(DATE_ALL_FORMAT.MOMENT_FORMAT)) : null,
      end_time: values.end_time ? (values.send_automatic_chatting_with_me ? null : moment(values.end_time).format(TIME_CONFIG.TIME_FORMAT)) : null,
      send_automatic_chatting_with_me: values.send_automatic_chatting_with_me ? 1 : 0,
    }

    preference.callSaveUserPreference(params, (message: string, resp: any) => {
      toast.success(message)
    }, (message: string) => {
      toast.error(message)
    })
  }

  useEffect(() => {
    getUserAutoReplyMsg()
  }, [])

  const getUserAutoReplyMsg = () => {
    preference.callGetUserAutoReply((message: string, resp: any) => {
      // console.log('resp auto reply', resp)
      if (resp && resp.list && resp.list.length) {
        resp.list.push({
          id: 0,
          message: 'Select Message'
        })
        setWelcomeMsgList(resp.list.sort(sort_by('id', false, parseInt)))
      }
      // toast.success(message)
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
        }

        // if (preferenceSelector.list[i].field_type_details == "text" && ['start_time_dd', 'start_time_mm', 'end_time_dd', 'end_time_mm'].includes(preferenceSelector.list[i].key)) {
        //   let val = preferenceSelector.list[i].val ? preferenceSelector.list[i].val : '';
        //   setValue(preferenceSelector.list[i].key, val)
        // }

        // if (preferenceSelector.list[i].field_type_details == "text" && ['start_time_hour', 'end_time_hour'].includes(preferenceSelector.list[i].key)) {
        //   let val = preferenceSelector.list[i].val ? moment(preferenceSelector.list[i].val, 'hh:mm a').toDate() : '';
        //   if (val) {
        //     setValue(preferenceSelector.list[i].key, val)
        //   }
        // }

        if (preferenceSelector.list[i].field_type_details == "text" && preferenceSelector.list[i].key == 'start_date') {
          let val = preferenceSelector.list[i].val ? new Date(preferenceSelector.list[i].val) : '';
          setValue(preferenceSelector.list[i].key, val)
          setStartDateminTime(calculateMinTime(val))
        }

        if (preferenceSelector.list[i].field_type_details == "text" && preferenceSelector.list[i].key == 'start_time') {
          let val = preferenceSelector.list[i].val ? moment(preferenceSelector.list[i].val, 'hh:mm a').toDate() : '';
          setValue(preferenceSelector.list[i].key, val)
        }

        if (preferenceSelector.list[i].field_type_details == "text" && preferenceSelector.list[i].key == 'end_date') {
          let val = preferenceSelector.list[i].val ? new Date(preferenceSelector.list[i].val) : '';
          setValue(preferenceSelector.list[i].key, val)
          setEndDateMinTime(calculateMinTime(val))
        }

        if (preferenceSelector.list[i].field_type_details == "text" && preferenceSelector.list[i].key == 'end_time') {
          let val = preferenceSelector.list[i].val ? moment(preferenceSelector.list[i].val, 'hh:mm a').toDate() : '';
          setValue(preferenceSelector.list[i].key, val)
        }

        if (preferenceSelector.list[i].key == "selected_message_id" && welcomeMsgList && welcomeMsgList.length) {
          let found = welcomeMsgList && welcomeMsgList.length ? welcomeMsgList.filter((x: any) => x.id == preferenceSelector.list[i].val) : []
          if (found && found.length) {
            let val = parseInt(preferenceSelector.list[i].val) ? { label: found[0].message, value: found[0].id } : null;
            setValue(preferenceSelector.list[i].key, val)
          }
        }

        if (preferenceSelector.list[i].key == "customize_auto_reply_msg" && preferenceSelector.list[i].field_type_details == "textarea") {
          let val = preferenceSelector.list[i].val ? preferenceSelector.list[i].val : '';
          setValue(preferenceSelector.list[i].key, val)
        }

        if (preferenceSelector.list[i].key == "enable_auto_reply" && preferenceSelector.list[i].field_type_details == "checkbox") {
          let val = preferenceSelector.list[i].val ? preferenceSelector.list[i].val : '';

          if (val === "1") {
            setDateTimeDisableState(false)
            setInitialDisableState(false)
            setIsAutoReplyDbcheckBoxDisableStatus(true)
          } else {
            setDateTimeDisableState(true)
            setInitialDisableState(true)
            setIsAutoReplyDbcheckBoxDisableStatus(false)
          }
        }

        if (preferenceSelector.list[i].key == "selected_message_id" && preferenceSelector.list[i].field_type_details == "number") {
          let val = preferenceSelector.list[i].val ? preferenceSelector.list[i].val : '';
          if ((val === "0" || val === null) && !isAutoReplyDbcheckBoxDisableStatus) {
            setCustomAutoReplyMessageDisableState(false)
            setValue('selected_message_id', 0)
          }

        }

        if (preferenceSelector.list[i].key == "send_automatic_chatting_with_me" && preferenceSelector.list[i].field_type_details == "checkbox") {
          let val = preferenceSelector.list[i].val ? preferenceSelector.list[i].val : '';

          if (val === "1") {
            setDateTimeDisableState(true)
            setValue('start_date', '')
            setValue('start_time', '')
            setValue('end_date', '')
            setValue('end_time', '')
          } else {
            setDateTimeDisableState(false)
          }
        }

      }
    }
  }, [preferenceSelector, welcomeMsgList])

  useEffect(() => {


  }, [])


  // console.log('preferenceSelector', preferenceSelector)
  const chatHandleChange = (evt: any) => {
    chatTextRef.current = evt.target.value;
    setChatText(evt.target.value)
  };

  const chatHandleBlur = () => {

  };


  const handleCustomizeMsgSave = () => {
    // console.log('chatTextRef.current', chatTextRef.current)
    let txt = chatTextRef.current
    chatTextRef.current = '';
    let params = {
      message: txt
    }
    preference.callSaveUserAutoReply(params, (message: string, resp: any) => {
      // console.log('resp auto reply', resp)
      setChatText('')
      getUserAutoReplyMsg()
      // toast.success(message)
    }, (message: string) => {
      toast.error(message)
    })
  }

  const handleClear = () => {
    chatTextRef.current = '';
    setChatText('')
  }

  const handleAutoReplyMessageCheckbox = (e: any) => {
    // console.log("handleAutoReplyMessageCheckbox: ", e);
    setautoReplyMessageSelectDisableState(false)
    if (e) {
      // setDateTimeDisableState(false)
      setInitialDisableState(false)
    } else {
      // setDateTimeDisableState(true)
      setInitialDisableState(true)
      setDateTimeDisableState(true)
    }
  }

  const handleAutoReplyMessageDropdown = (e: any) => {
    // console.log("handleAutoReplyMessageDropdown: ", e);
    if (e && e.value === "0" || e === null) {
      setCustomAutoReplyMessageDisableState(false)
    } else {
      setCustomAutoReplyMessageDisableState(true)
      setValue('customize_auto_reply_msg', '')
    }
  }

  const handleAutomaticAutoReplyCheckbox = (e: any) => {
    // console.log("handleAutomaticAutoReplyCheckbox: ", e);
    if (e) {
      setDateTimeDisableState(true)
      setValue('start_date', '')
      setValue('start_time', '')
      setValue('end_date', '')
      setValue('end_time', '')
    } else {
      setDateTimeDisableState(false)
    }
  }

  const handleStartDateChange = (e: any) => {
    setValue('start_time', '');
    setStartDateminTime(calculateMinTime(e))
  }

  const handleEndDateChange = (e: any) => {
    setValue('end_time', '');
    setEndDateMinTime(calculateMinTime(e))
  }

  return (

    <React.Fragment>
      <div className="right-menu-details dark-box-inner inner_auto_reply">
        <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>
          <p style={{ color: 'white' }}>
            You can select an Auto-Reply message from the list below or customize your own using the following message Editor Box.
          </p>
          <div className="form-group">
            <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
              <Controller
                control={control}
                name="enable_auto_reply"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <CheckboxInput
                    name={name}
                    onChange={(e) => {
                      onChange(e)
                      handleAutoReplyMessageCheckbox(e)
                    }}
                    classname="custom-control-input"
                    onBlur={onBlur}
                    value={value}
                    id="enable-auto-reply"
                    inputRef={ref}
                    label="Enable Auto-Reply message"
                    error={errors.enable_auto_reply}
                  />
                )}
              />
            </div>
          </div>
          <div className="form-group">

            <label>Select Auto Reply Message</label>
            <Controller
              control={control}
              name="selected_message_id"
              render={({ onChange, onBlur, value, name, ref }) => (
                <SelectInput
                  // name={name}
                  onChange={(e) => {
                    onChange(e)
                    handleAutoReplyMessageDropdown(e)
                  }}
                  onBlur={onBlur}
                  value={value}
                  inputRef={ref}
                  dark={true}
                  options={welcomeMsgList.length ? welcomeMsgList.map((c: any) => ({
                    value: String(c.id),
                    // label: _.truncate(c.message, {
                    //   'length': 24,
                    //   'separator': ' '
                    // }),
                    label: c.message,
                  })) : []}
                  isDisabled={initialDisableState}
                  error={errors.selected_message_id}
                  placeholder="Select Message"
                />
              )}
            />
          </div>
          <div className="form-group row">
            <hr className="light-hr" />
            <div className="form-group col-12">
              <label>customize your personal message section</label>
              {/* <ContentEditable
                // tagName="pre"
                html={chatTextRef.current}
                onBlur={chatHandleBlur}
                onChange={chatHandleChange}
                // onKeyDown={chatOnKeyDown}
                className="room-chat-content-editable"
              /> */}
              <Controller
                control={control}
                name="customize_auto_reply_msg"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <EditorInputBasic
                    value={value}
                    inputRef={ref}
                    name={name}
                    isDisabled={customAutoReplyMessageDisableState}
                    onChange={onChange}
                    onBlur={onBlur}
                    toolbarItems={['heading', '|', 'bold', 'italc', 'blockQuote', 'undo', 'redo']}
                    error={errors.customize_auto_reply_msg}
                  />
                )}
              />
              {/* <button className="a1">Aa</button>
              <button className="a1" disabled={chatText ? false : true} onClick={handleClear}>Clear</button>
              <button className="a1" disabled={chatText ? false : true} onClick={handleCustomizeMsgSave}>Save</button> */}
            </div>
            <hr className="light-hr" />
            <div className="form-group col-3">
              <label>Start Date</label>
              <Controller
                control={control}
                name="start_date"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <DateInput
                    // name={name}
                    onChange={(e) => {
                      onChange(e)
                      handleStartDateChange(e)
                    }}
                    onBlur={onBlur}
                    disabled={dateTimeDisableState}
                    value={value}
                    minDate={new Date()}
                    dateFormat={DATE_ALL_FORMAT.DATE_PICKER_FORMAT}
                    inputRef={ref}
                    error={errors.start_date}
                    placeholder="Start Date"
                  />
                )}
              />
            </div>
            <div className="form-group col-3">
              <label>Start Time</label>
              {/* <Controller
                control={control}
                name="start_time_dd"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <FormTextInput
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    inputRef={ref}
                    type="text"
                    error={errors.start_time_dd}
                    placeholder="DD"
                  />
                )}
              /> */}
              <Controller
                control={control}
                name="start_time"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <TimePicker
                    // name={name}
                    onChange={onChange}
                    disabled={dateTimeDisableState}
                    onBlur={onBlur}
                    minTime={startDateminTime}
                    value={value}
                    inputRef={ref}
                    timeIntervals={TIME_CONFIG.TIME_INTERVALS}
                    error={errors.start_time}
                    placeholder="Start Time"
                  />
                )}
              />
            </div>


            <hr className="light-hr" />
            <div className="form-group col-3">
              <label>End Date</label>
              <Controller
                control={control}
                name="end_date"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <DateInput
                    // name={name}
                    onChange={(e) => {
                      onChange(e)
                      handleEndDateChange(e)
                    }}
                    disabled={dateTimeDisableState}
                    onBlur={onBlur}
                    value={value}
                    minDate={new Date()}
                    dateFormat={DATE_ALL_FORMAT.DATE_PICKER_FORMAT}
                    inputRef={ref}
                    error={errors.end_date}
                    placeholder="End Date"
                  />
                )}
              />
            </div>

            <div className="form-group col-3">
              <label>End Time</label>
              {/* <Controller
                control={control}
                name="end_time_dd"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <FormTextInput
                    // name={name}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    inputRef={ref}
                    type="text"
                    error={errors.end_time_dd}
                    placeholder="DD"
                  />
                )}
              /> */}
              <Controller
                control={control}
                name="end_time"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <TimePicker
                    // name={name}
                    disabled={dateTimeDisableState}
                    onChange={onChange}
                    onBlur={onBlur}
                    minTime={endDateminTime}
                    value={value}
                    inputRef={ref}
                    timeIntervals={TIME_CONFIG.TIME_INTERVALS}
                    error={errors.end_time}
                    placeholder="End Time"
                  />
                )}
              />
            </div>



            <hr className="light-hr" />
            <div className="form-group col-12">
              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                <Controller
                  control={control}
                  name="send_automatic_chatting_with_me"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={(e) => {
                        onChange(e)
                        handleAutomaticAutoReplyCheckbox(e)
                      }}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      disabled={initialDisableState}
                      id="send-automatic-chatting-with-me"
                      inputRef={ref}
                      label="Always send this automatic auto-reply message to users who start chatting with me"
                      error={errors.send_automatic_chatting_with_me}
                    />
                  )}
                />
              </div>
            </div>

            <div className="d-flex mt-4 col-12">
              <button type="submit" className="btn theme-btn btn-primary mr-2 waves-effect">Apply</button>
              {/* <button type="button" className="btn theme-btn btn-default waves-effect">Cancel</button> */}
            </div>
          </div>
        </form>
      </div>
    </React.Fragment >
  )
}

export default AutoReplySetting
