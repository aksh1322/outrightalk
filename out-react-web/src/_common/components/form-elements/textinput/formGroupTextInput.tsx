import React from 'react'
import { Form, InputGroup } from 'react-bootstrap'

import '../form-elem.css'

interface FormGroupTextInputProps {
  onChange: (...args: any) => void;
  onBlur: () => void;
  onFocus?: () => void;
  onPaste?: (args: React.ClipboardEvent) => void;
  value: any;
  appendText:string;
  name: string;
  type: string;
  inputRef: any;
  placeholder?: string;
  error?: any;
  id?: string;
  pattern?: string;
  maxLength?: number;
}

// const onhandleBlur=(v:any)=>{

//   console.log('onhandle blur',v);

// }

function FormGroupTextInput({
  onChange,
  onBlur,
  onPaste,
  value,
  appendText,
  name,
  inputRef,
  type,
  placeholder,
  error,
  id,
  pattern,
  onFocus,
  maxLength,
}: FormGroupTextInputProps) {
  return (
    <React.Fragment>
      <InputGroup>
        <Form.Control
          type={type}
          name={name}
          value={value}
          id={id}
          onFocus={onFocus ? onFocus : () => { }}
          maxLength={maxLength}
          pattern={pattern}
          // onBlur={(v:any)=>onhandleBlur(v.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          onChange={(evt) => onChange(evt.target.value)}
          ref={inputRef}
          autoComplete={"no-auto-complete"}
          onPaste={onPaste}
          className="text-muted"
        />
        <InputGroup.Append>
          <InputGroup.Text id="inputGroupPrepend">{appendText}</InputGroup.Text>
        </InputGroup.Append>
      </InputGroup>
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

export default FormGroupTextInput
