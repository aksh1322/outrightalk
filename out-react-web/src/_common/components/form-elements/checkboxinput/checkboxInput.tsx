import React from 'react'
import '../form-elem.css'
import { Form } from 'react-bootstrap'

interface CheckboxInputProps {
  onChange: (...args: any) => void;
  onBlur: () => void;
  label: React.ReactNode,
  value: boolean;
  name: string;
  inputRef: any;
  disabled?:boolean;
  error?: any;
  id?: string;
  classname?:string;
}

function CheckboxInput({
  onChange,
  onBlur,
  value,
  name,
  inputRef,
  disabled,
  error,
  id,
  label,
  classname
}: CheckboxInputProps) {
  return (
    <React.Fragment>
      <input
        className={classname}
        type="checkbox"
        checked={value}
        name={name}
        id={id}
        disabled={disabled}
        ref={inputRef}
        onChange={(evt) => {
          onChange(evt.target.checked)
        }}
        onBlur={onBlur}
      />
      <label className="custom-control-label" htmlFor={id}>{label}</label>
      {
        error && error.message ? <>
          <Form.Control.Feedback type="invalid" >
            {error.message}
          </Form.Control.Feedback>
        </> : null
      }
    </React.Fragment>
  )
}

export default CheckboxInput
