import React from 'react'
import Select, { components } from 'react-select'
import AsyncCreatableSelect from 'react-select/async-creatable'
import { AiFillCaretDown } from 'react-icons/ai'

import '../form-elem.css'
import { OptionValue } from '../../../interfaces/common';
import styles from './selectElementStyle'
import stylesDark from './selectElementStyleDark'
import { Form } from 'react-bootstrap'
import { LOGIN_STORAGE } from '../../../../_config';

interface SelectInputProps {
  onChange: (...args: any) => void;
  onBlur?: () => void;
  // options: OptionValue[];
  options: (input: any, callback: any) => void
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
  menuIsOpen?: boolean;
  noOptionsMessage?: string;
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

function AsyncCreatbleSelectInput({
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
  menuIsOpen,
  noOptionsMessage,
  dark,
}: SelectInputProps) {

  return (
    <div>
      <AsyncCreatableSelect
        cacheOptions
        defaultOptions
        loadOptions={options}
        value={value}
        onChange={onChange}
        isClearable={isClearable == undefined ? true : isClearable}
        onBlur={onBlur}
        name={name}
        ref={inputRef}
        placeholder={placeholder}
        styles={dark ? stylesDark : styles}
        components={{ IndicatorSeparator: () => null }}
        formatCreateLabel={(inputValue) => inputValue}
        noOptionsMessage={() => noOptionsMessage ? noOptionsMessage : 'No Data Available'}
      />
      {
        error && error.value && error.value.message ? <>
          <Form.Control.Feedback type="invalid" >
            {error.value.message}
          </Form.Control.Feedback>
        </> : null
      }
    </div>
  )
}

export default AsyncCreatbleSelectInput
