import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, SvgProps, Circle, Line} from 'react-native-svg';

interface SearchProps extends SvgProps {
  width?: string;
  height?: string;
  color?: ColorValue;
}

export const SearchIcon = ({
  width,
  height,
  color,
  ...svgProps
}: SearchProps) => {
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
      <Circle cx="11" cy="11" r="8" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
};
