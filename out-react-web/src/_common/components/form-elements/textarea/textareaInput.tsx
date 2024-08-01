import React from 'react'
import { Form } from 'react-bootstrap'

import '../form-elem.css'

interface FormTextInputProps {
  onChange: (...args: any) => void;
  onBlur: () => void;
  onPaste?: (args: React.ClipboardEvent) => void;
  value: any;
  name: string;
  type?: string;
  inputRef?: any;
  placeholder?: string;
  error?: any;
  id?: string;
  rows: number;
  isDisabled?:boolean;
}

function FormTextAreaInput({
  onChange,
  onBlur,
  onPaste,
  value,
  name,
  inputRef,
  type,
  placeholder,
  error,
  id,
  isDisabled,
  rows
}: FormTextInputProps) {
  return (
    <React.Fragment>
      <Form.Control
        type={type}
        name={name}
        id={id}
        as="textarea"
        value={value}
        rows={rows}
        onBlur={onBlur}
        disabled={isDisabled}
        placeholder={placeholder}
        onChange={(evt) => onChange(evt.target.value)}
        ref={inputRef}
        autoComplete={"no-auto-complete"}
        onPaste={onPaste}
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

export default FormTextAreaInput
