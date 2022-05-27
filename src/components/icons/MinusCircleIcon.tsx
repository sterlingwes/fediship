import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Circle, Line} from 'react-native-svg';

interface MinusCircleIconProps {
  width?: string;
  height?: string;
  color?: ColorValue;
}

export const MinusCircleIcon = ({
  width,
  height,
  color,
}: MinusCircleIconProps) => {
  return (
    <Svg
      width={width ?? '24'}
      height={height ?? '24'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Line x1="8" y1="12" x2="16" y2="12" />
    </Svg>
  );
};
