import React from 'react'
import { Form } from 'react-bootstrap'
import DatePicker from "react-datepicker";
import '../form-elem.css'
import classnames from 'classnames'
import { v4 as uuidv4 } from 'uuid';

interface DateInputProps {
  onChange: (...args: any) => void;
  onBlur?: () => void;
  value: Date | undefined;
  name?: string;
  inputRef?: any;
  placeholder?: string;
  dateFormat?: string;
  error?: any;
  id?: string;
  maxDate?: Date;
  minDate?: Date;
  disabled?: boolean;
  dark?: boolean;
}

function DateInput({
  onChange,
  onBlur,
  value,
  name,
  inputRef,
  placeholder,
  error,
  id,
  dateFormat,
  maxDate,
  minDate,
  disabled,
  dark,
}: DateInputProps) {

  const datePickerContainerClass = classnames({
    'ne-datepicker-container': true,
    'dark': dark,
  })

  return (
    <div className={datePickerContainerClass}>
      <DatePicker
        selected={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholderText={placeholder}
        name={name}
        id={id}
        disabled={disabled}
        ref={inputRef}
        maxDate={maxDate}
        minDate={minDate}
        showYearDropdown
        dateFormat={dateFormat}
        className="form-control"
        autoComplete={"no-auto-complete_" + uuidv4()}
      />
      <i className="date-icon"></i>
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

export default DateInput
