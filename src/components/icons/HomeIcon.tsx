import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Polyline, Path} from 'react-native-svg';

interface HomeIconProps {
  width?: string;
  height?: string;
  color?: ColorValue;
}

export const HomeIcon = ({width, height, color}: HomeIconProps) => {
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
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Polyline points="9 22 9 12 15 12 15 22" />
    </Svg>
  );
};
