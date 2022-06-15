import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, SvgProps, Circle, Rect, Polyline} from 'react-native-svg';

interface ImageIconProps extends SvgProps {
  color?: ColorValue;
}

export const ImageIcon = ({
  width,
  height,
  color,
  ...svgProps
}: ImageIconProps) => {
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
      <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <Circle cx="8.5" cy="8.5" r="1.5" />
      <Polyline points="21 15 16 10 5 21" />
    </Svg>
  );
};
