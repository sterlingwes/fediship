import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, SvgProps, Path, Line, Circle} from 'react-native-svg';

interface FrownIconProps extends SvgProps {
  color?: ColorValue;
}

export const FrownIcon = ({
  width,
  height,
  color,
  ...svgProps
}: FrownIconProps) => {
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
      <Circle cx="12" cy="12" r="10" />
      <Path d="M16 16s-1.5-2-4-2-4 2-4 2" />
      <Line x1="9" y1="9" x2="9.01" y2="9" />
      <Line x1="15" y1="9" x2="15.01" y2="9" />
    </Svg>
  );
};
