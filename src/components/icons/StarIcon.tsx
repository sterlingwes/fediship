import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Polygon} from 'react-native-svg';

interface StarIconProps {
  width?: string;
  height?: string;
  stroke?: ColorValue;
  fill?: ColorValue;
}

export const StarIcon = ({width, height, stroke, fill}: StarIconProps) => {
  return (
    <Svg
      width={width ?? '24'}
      height={height ?? '24'}
      viewBox="0 0 24 24"
      fill={fill ?? 'none'}
      stroke={stroke ?? 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </Svg>
  );
};
