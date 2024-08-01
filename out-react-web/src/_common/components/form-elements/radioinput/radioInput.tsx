import React from 'react'
import '../form-elem.css'
import { OptionValue } from '../../../interfaces/common';
import { Form } from 'react-bootstrap'

interface RadioInputProps {
  onChange: (...args: any) => void;
  onBlur: () => void;
  options: OptionValue[];
  value: string | undefined;
  name: string;
  inputRef: any;
  placeholder?: string;
  error?: any;
  id?: string;
}


function RadioInput({
  onChange,
  onBlur,
  value,
  name,
  inputRef,
  placeholder,
  error,
  id,
  options,
}: RadioInputProps) {
  return (
    <div>
      <div className="radio-wrapper">
      {
        options.map((opt, index) => {
          return <label key={index} className="container-radio" >
            {opt.label}
            <input
              type="radio"
              checked={value == opt.value}
              name={name}
              value={opt.value}
              onChange={(evt) => {
                onChange(evt.target.value)
              }}
            />
            <span className="checkmark"></span>
          </label>
        })
      }
      </div>
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

export default RadioInput
