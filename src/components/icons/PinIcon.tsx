import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Path, Circle} from 'react-native-svg';

interface PinIconProps {
  width?: string;
  height?: string;
  color?: ColorValue;
}

export const PinIcon = ({width, height, color}: PinIconProps) => {
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
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <Circle cx="12" cy="10" r="3" />
    </Svg>
  );
};
