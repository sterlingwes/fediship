import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Path, Rect} from 'react-native-svg';

interface LockIconProps {
  width?: string;
  height?: string;
  color?: ColorValue;
}

export const LockIcon = ({width, height, color}: LockIconProps) => {
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
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Svg>
  );
};
