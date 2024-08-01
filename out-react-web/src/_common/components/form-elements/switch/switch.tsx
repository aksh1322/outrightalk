import React from 'react'
import { Form } from 'react-bootstrap'
import Switch from "react-switch";
// import '../form-elem.css'

interface FormSwitchInputProps {
  onChange: (...args: any) => void;
  value: any;
  inputRef: any;
  error?: any;
  id?: string;
}

function FormSwitchInput({
  onChange,
  value,
  inputRef,
  error,
  id,
}: FormSwitchInputProps) {
  return (
    <React.Fragment>
      <Switch
        checked={value ? true : false}
        onChange={(evt) => onChange(evt)}
      />
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

export default FormSwitchInput
