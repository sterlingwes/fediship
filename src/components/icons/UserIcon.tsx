import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Path, Circle} from 'react-native-svg';

interface UserIconProps {
  width?: string;
  height?: string;
  color?: ColorValue;
}

export const UserIcon = ({width, height, color}: UserIconProps) => {
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
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  );
};
