import { Styles, StylesConfig } from 'react-select'
import { menuListCSS } from 'react-select/src/components/Menu'

const styles: StylesConfig = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#556ee6' : '#FFFFFF',
    ':hover': {
      backgroundColor: '#90a0ee',
      color: '#ffffff'
    },
  }),
  input: (provided, state) => ({
    ...provided,
      color: '#BFC8E2'
  }),
  menu: (provided, state) => ({
    ...provided,
    zIndex:999999
  }),
  menuList: (provided, state) => ({
    ...provided,
    color: '#636363',
    fontSize: '14.4px',
  }),
  control: (provided, state) => ({
    ...provided,
    height: `calc(1.9em + .94rem + 2px)`,
    borderRadius: '.5rem',
    backgroundColor:'#464D61',
    // color: '#BFC8E2',
    borderColor: '1.5px solid #58627F',
    boxShadow: 'none',
    ':hover': {
      borderColor: '#58627F',
    }
  }),
  indicatorSeparator: (provided, state) => ({
    ...provided,
    backgroundColor: '#353535'
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    color: '#676767'
  }),
  valueContainer: (provided, state) => ({
    ...provided,
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: '#676767'
  }),
  placeholder: (provided, state) => ({
    ...provided,
    color: '#BFC8E2',
    fontSize: '14.4px',
  }),
  singleValue: (provided, state) => ({
    ...provided,
    color: '#BFC8E2',
    fontSize: '14.4px',
  }),
}

export default styles