import React from 'react'
import ReactSlider from 'react-slider'
import PropTypes from 'prop-types'

import './SliderInput.css'

interface SliderProps {
  max: number;
  min: number;
  step: number;
  value: number;
  onChange(val: any): any;
}

function SliderInput(props: SliderProps) {
  return (
    <React.Fragment>
      <ReactSlider
        className="ne-slider"
        thumbActiveClassName="ne-slider-thumb-active"
        thumbClassName="ne-slider-thumb"
        trackClassName="ne-slider-track"
        max={props.max}
        min={props.min}
        step={props.step}
        onChange={props.onChange}
        value={props.value}
      />
    </React.Fragment>
  )
}

SliderInput.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default SliderInput
