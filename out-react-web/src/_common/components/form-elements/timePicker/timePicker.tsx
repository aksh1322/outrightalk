import React from 'react'
import { Form } from 'react-bootstrap'
import DatePicker from "react-datepicker";
import '../form-elem.css'
import classnames from 'classnames'
import moment from 'moment';
interface TimePickerProps {
  onChange: (...args: any) => void;
  onBlur?: () => void;
  value: Date | undefined;
  name?: string;
  inputRef?: any;
  placeholder?: string;
  error?: any;
  id?: string;
  minTime?:any;
  timeIntervals?: number;
  disabled?: boolean;
  dark?: boolean;
}

function TimePicker({
  onChange,
  onBlur,
  value,
  name,
  inputRef,
  placeholder,
  error,
  id,
  minTime,
  timeIntervals,
  disabled,
  dark,
}: TimePickerProps) {

  const timePickerContainerClass = classnames({
    'ne-datepicker-container': true,
    'dark': dark,
  })

  return (
    <div className={timePickerContainerClass}>
      <DatePicker
        selected={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholderText={placeholder}
        name={name}
        id={id}
        minTime={minTime?minTime:undefined}
        maxTime={minTime?moment().endOf('day').toDate():undefined}
        disabled={disabled}
        ref={inputRef}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={timeIntervals ? timeIntervals : 15}
        timeCaption="Time"
        dateFormat="h:mm aa"
        className="form-control"
        autoComplete={"no-auto-complete"}
      />
      <i className="time-icon"></i>
      {
        error && error.message ? <>
          <Form.Control.Feedback type="invalid" >
            {error.message}
          </Form.Control.Feedback>
        </> : null
      }
    </div>
  )
}

export default TimePicker
