import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Polyline, SvgProps, Path} from 'react-native-svg';

interface BoostProps extends SvgProps {
  width?: string | number;
  height?: string | number;
  color?: ColorValue;
}

export const BoostIcon = ({width, height, color, ...svgProps}: BoostProps) => {
  return (
    <Svg
      {...svgProps}
      width={width ?? '24'}
      height={height ?? '24'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <Polyline points="17 1 21 5 17 9" />
      <Path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <Polyline points="7 23 3 19 7 15" />
      <Path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </Svg>
  );
};
