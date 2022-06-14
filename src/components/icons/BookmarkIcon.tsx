import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, SvgProps, Path} from 'react-native-svg';

interface BookmarkProps extends SvgProps {
  width?: string | number;
  height?: string | number;
  stroke?: ColorValue;
  fill?: ColorValue;
}

export const BookmarkIcon = ({
  width,
  height,
  stroke,
  fill,
  ...svgProps
}: BookmarkProps) => {
  return (
    <Svg
      {...svgProps}
      width={width ?? '24'}
      height={height ?? '24'}
      viewBox="0 0 24 24"
      fill={fill ?? 'none'}
      stroke={stroke ?? 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </Svg>
  );
};
