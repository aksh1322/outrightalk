import React from 'react'
import { Form } from 'react-bootstrap'
import InputMask from 'react-input-mask';

import '../form-elem.css'

interface FormMaskedInputProps {
  onChange: (...args: any) => void;
  onBlur: () => void;
  onPaste?: (args: React.ClipboardEvent) => void;
  value: any;
  name: string;
  type: string;
  inputRef: any;
  placeholder?: string;
  error?: any;
  id?: string;
  mask: string;
  maskPlaceholder: string;
}

function FormMaskedInput({
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
  mask,
  maskPlaceholder,
}: FormMaskedInputProps) {
  return (
    <React.Fragment>
      <InputMask
        mask={mask}
        maskPlaceholder={maskPlaceholder}
        value={value}
        onChange={onChange}
        name={name}
        id={id}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={"no-auto-complete"}
        onPaste={onPaste}
      >
        {
          (inputProps: any) => <Form.Control
            type={type}
            {...inputProps}
            ref={inputRef}
          />
        }
      </InputMask>
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

export default FormMaskedInput
