import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, SvgProps, Circle, Line} from 'react-native-svg';

interface ShareGraphProps extends SvgProps {
  width?: string | number;
  height?: string | number;
  color?: ColorValue;
}

export const ShareGraphIcon = ({
  width,
  height,
  color,
  ...svgProps
}: ShareGraphProps) => {
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
      <Circle cx="18" cy="5" r="3" />
      <Circle cx="6" cy="12" r="3" />
      <Circle cx="18" cy="19" r="3" />
      <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </Svg>
  );
};
