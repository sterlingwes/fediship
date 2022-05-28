import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Path} from 'react-native-svg';

interface MessageIconProps {
  width?: string;
  height?: string;
  color?: ColorValue;
}

export const MessageIcon = ({width, height, color}: MessageIconProps) => {
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
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
};
