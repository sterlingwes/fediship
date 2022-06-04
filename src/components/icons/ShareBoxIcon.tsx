import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Polyline, SvgProps, Path, Line} from 'react-native-svg';

interface ShareBoxProps extends SvgProps {
  width?: string | number;
  height?: string | number;
  color?: ColorValue;
}

export const ShareBoxIcon = ({
  width,
  height,
  color,
  ...svgProps
}: ShareBoxProps) => {
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
      <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <Polyline points="16 6 12 2 8 6" />
      <Line x1="12" y1="2" x2="12" y2="15" />
    </Svg>
  );
};
