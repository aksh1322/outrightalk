import React from "react";
import { Form } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import "../form-elem.css";

interface FormTextInputProps {
  onChange: (...args: any) => void;
  onBlur: () => void;
  onFocus?: () => void;
  onPaste?: (args: React.ClipboardEvent) => void;
  value: any;
  name?: string;
  type: string;
  inputRef: any;
  placeholder?: string;
  error?: any;
  id?: string;
  pattern?: string;
  maxLength?: number;
  disabled?: boolean;
  accept?: string;
}

function FormTextInput({
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
  pattern,
  onFocus,
  maxLength,
  disabled,
  accept,
}: FormTextInputProps) {
  return (
    <React.Fragment>
      <Form.Control
        type={type}
        name={name}
        value={value}
        id={id}
        onFocus={onFocus ? onFocus : () => {}}
        maxLength={maxLength}
        pattern={pattern}
        onBlur={onBlur}
        placeholder={placeholder}
        onChange={(evt) => onChange(evt.target.value)}
        ref={inputRef}
        autoComplete={"no-auto-complete_" + uuidv4()}
        onPaste={onPaste}
        disabled={disabled}
        accept={accept}
        className="text-muted"
      />

      {error && error.message ? (
        <>
          <Form.Control.Feedback type="invalid">
            {error.message}
          </Form.Control.Feedback>
        </>
      ) : null}
    </React.Fragment>
  );
}

export default FormTextInput;
