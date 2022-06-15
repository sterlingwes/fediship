import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Circle, Line, SvgProps} from 'react-native-svg';

interface InfoIconProps extends SvgProps {
  color?: ColorValue;
}

export const InfoIcon = ({width, height, color, ...props}: InfoIconProps) => {
  return (
    <Svg
      {...props}
      width={width ?? '24'}
      height={height ?? '24'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Line x1="12" y1="16" x2="12" y2="12" />
      <Line x1="12" y1="8" x2="12.01" y2="8" />
    </Svg>
  );
};
