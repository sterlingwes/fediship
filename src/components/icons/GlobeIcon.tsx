import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Path, Circle, Line} from 'react-native-svg';

interface GlobeIconProps {
  width?: string;
  height?: string;
  color?: ColorValue;
}

export const GlobeIcon = ({width, height, color}: GlobeIconProps) => {
  return (
    <Svg
      width={width ?? '24'}
      height={height ?? '24'}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Line x1="2" y1="12" x2="22" y2="12" />
      <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </Svg>
  );
};
