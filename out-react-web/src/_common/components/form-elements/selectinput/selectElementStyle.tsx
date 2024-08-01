import { Styles, StylesConfig } from 'react-select'
import { menuListCSS } from 'react-select/src/components/Menu'

const styles: StylesConfig = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#d71c2d' : '#FFFFFF',
    ':hover': {
      backgroundColor: '#ff606e',
      color: '#ffffff'
    },
  }),
  menu: (provided, state) => ({
    ...provided,
  }),
  menuList: (provided, state) => ({
    ...provided,
    color: '#636363',
    fontSize: '18px',
  }),
  control: (provided, state) => ({
    ...provided,
    borderColor: '#cdc6c1',
    boxShadow: 'none',
    ':hover': {
      borderColor: '#cdc6c1',
    }
  }),
  indicatorSeparator: (provided, state) => ({
    ...provided,
  }),
  valueContainer: (provided, state) => ({
    ...provided,
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
  }),
  placeholder: (provided, state) => ({
    ...provided,
    color: '#c2bfbf',
    fontSize: '18px',
  }),
  singleValue: (provided, state) => ({
    ...provided,
    color: '#636363',
    fontSize: '18px',
  }),
}

export default styles