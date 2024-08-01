import React from 'react'
import Select, { components } from 'react-select'
import { v4 as uuidv4 } from 'uuid';
import { AiFillCaretDown } from 'react-icons/ai'

import '../form-elem.css'
import { OptionValue } from '../../../interfaces/common';
import styles from './selectElementStyle'
import stylesDark from './selectElementStyleDark'
import { Form } from 'react-bootstrap'


interface SelectInputProps {
  onChange: (...args: any) => void;
  onBlur?: () => void;
  options: OptionValue[];
  value: OptionValue | undefined;
  name?: string;
  inputRef?: any;
  placeholder?: string;
  error?: any;
  className?: string;
  id?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  dark?: boolean;
  isDisabled?: boolean;
}

const DropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <AiFillCaretDown />
    </components.DropdownIndicator>
  );
};

const DropdownIndicatorDark = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <AiFillCaretDown style={{
        color: '#353535'
      }} />
    </components.DropdownIndicator>
  );
};

const filteOption = (options: any, option: any, inputValue: any) => {
    
  const { label, value } = option;
  const otherKey = options.filter(
    (opt: any) => opt.label.toLowerCase() === label.toLowerCase() && opt.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return label.toLowerCase().includes(inputValue.toLowerCase()) || otherKey.length > 0;
}

function SelectInput({
  onChange,
  onBlur,
  value,
  name,
  inputRef,
  placeholder,
  error,
  id,
  className,
  options,
  isSearchable,
  isClearable,
  isDisabled,
  dark,
}: SelectInputProps) {
  return (
    <div>
      <Select
        options={options}
        value={value}
        onChange={onChange}
        isClearable={isClearable == undefined ? true : isClearable}
        isSearchable={isSearchable == undefined ? true : isSearchable}
        styles={dark ? stylesDark : styles}
        onBlur={onBlur}
        name={name}
        className={className}
        id={id}
        ref={inputRef}
        isDisabled={isDisabled}
        placeholder={placeholder}
        autoComplete={"no-auto-complete_" + uuidv4()}
        components={{DropdownIndicator:() => null, IndicatorSeparator: () => null }}
        filterOption={(option, InputValue) => filteOption(options, option, InputValue)}
      />
      {
        (error && error.value && error.value.message) ? 
        <>
          <Form.Control.Feedback type="invalid" >
            {error.value.message}
          </Form.Control.Feedback>
        </> : error && error && error.message ? <>
          <Form.Control.Feedback type="invalid" >
            {error.message}
          </Form.Control.Feedback>
        </> : null
      }
    </div>
  )
}

export default SelectInput
