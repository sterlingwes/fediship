import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, SvgProps, Line} from 'react-native-svg';

interface XProps extends SvgProps {
  width?: string | number;
  height?: string | number;
  color?: ColorValue;
}

export const XIcon = ({width, height, color, ...svgProps}: XProps) => {
  return (
    <Svg
      {...svgProps}
      width={width ?? '24'}
      height={height ?? '24'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <Line x1="18" y1="6" x2="6" y2="18" />
      <Line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  );
};
