import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, SvgProps, Circle, Line} from 'react-native-svg';

interface XCircleProps extends SvgProps {
  width?: string;
  height?: string;
  color?: ColorValue;
}

export const XCircleIcon = ({
  width,
  height,
  color,
  ...svgProps
}: XCircleProps) => {
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
      <Circle cx="12" cy="12" r="10" />
      <Line x1="15" y1="9" x2="9" y2="15" />
      <Line x1="9" y1="9" x2="15" y2="15" />
    </Svg>
  );
};
