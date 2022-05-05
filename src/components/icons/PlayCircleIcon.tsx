import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Polygon, Circle} from 'react-native-svg';

interface PlayCircleIconProps {
  width?: string;
  height?: string;
  color?: ColorValue;
}

export const PlayCircleIcon = ({width, height, color}: PlayCircleIconProps) => {
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
      <Polygon points="10 8 16 12 10 16 10 8" />
    </Svg>
  );
};
