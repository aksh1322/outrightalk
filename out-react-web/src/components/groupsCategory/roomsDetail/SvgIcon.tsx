import React from 'react';

import Icons from '../../../assets/svg/sprite.svg'

export const SvgIcon = ({ name, color, size, viewBox }: any) => {
  return (
    <svg width={size} viewBox={viewBox ? viewBox : '0 0 1000 500'} fill={color}>
      <use href={Icons + `#${name}`} />
    </svg>
  );
};
