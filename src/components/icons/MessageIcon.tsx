import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Path, SvgProps} from 'react-native-svg';

interface MessageIconProps extends SvgProps {
  width?: string | number;
  height?: string | number;
  color?: ColorValue;
}

export const MessageIcon = ({
  width,
  height,
  color,
  ...svgProps
}: MessageIconProps) => {
  return (
    <Svg
      width={width ?? '24'}
      height={height ?? '24'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...svgProps}>
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
};
