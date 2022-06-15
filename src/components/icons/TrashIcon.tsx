import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, SvgProps, Path, Polyline} from 'react-native-svg';

interface TrashIconProps extends SvgProps {
  color?: ColorValue;
}

export const TrashIcon = ({
  width,
  height,
  color,
  ...svgProps
}: TrashIconProps) => {
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
      <Polyline points="3 6 5 6 21 6" />
      <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Svg>
  );
};
