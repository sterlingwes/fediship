import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Line} from 'react-native-svg';

interface HashtagIconProps {
  width?: string;
  height?: string;
  color?: ColorValue;
}

export const HashtagIcon = ({width, height, color}: HashtagIconProps) => {
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
      <Line x1="4" y1="9" x2="20" y2="9" />
      <Line x1="4" y1="15" x2="20" y2="15" />
      <Line x1="10" y1="3" x2="8" y2="21" />
      <Line x1="16" y1="3" x2="14" y2="21" />
    </Svg>
  );
};
