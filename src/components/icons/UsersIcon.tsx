import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, SvgProps, Path, Circle} from 'react-native-svg';

interface UsersIconProps extends SvgProps {
  color?: ColorValue;
}

export const UsersIcon = ({
  width,
  height,
  color,
  ...svgProps
}: UsersIconProps) => {
  return (
    <Svg
      {...svgProps}
      width={width ?? '24'}
      height={height ?? '24'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? 'currentColor'}
      strokeWidth={svgProps.strokeWidth ?? '2'}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
};
