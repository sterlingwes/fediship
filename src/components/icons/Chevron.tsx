import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Polyline} from 'react-native-svg';

interface ChevronProps {
  width?: string;
  height?: string;
  color?: ColorValue;
}

export const Chevron = ({width, height, color}: ChevronProps) => {
  return (
    <Svg
      width={width ?? '24'}
      height={height ?? '24'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? 'currentColor'}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round">
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
};
