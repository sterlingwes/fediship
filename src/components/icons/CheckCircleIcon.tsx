import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, SvgProps, Path, Polyline} from 'react-native-svg';

interface CheckCircleProps extends SvgProps {
  width?: string | number;
  height?: string | number;
  color?: ColorValue;
}

export const CheckCircleIcon = ({
  width,
  height,
  color,
  ...svgProps
}: CheckCircleProps) => {
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
      <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <Polyline points="22 4 12 14.01 9 11.01" />
    </Svg>
  );
};
