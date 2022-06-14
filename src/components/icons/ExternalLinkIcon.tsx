import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Polyline, SvgProps, Path, Line} from 'react-native-svg';

interface ExternalLinkProps extends SvgProps {
  width?: string;
  height?: string;
  color?: ColorValue;
}

export const ExternalLink = ({
  width,
  height,
  color,
  ...svgProps
}: ExternalLinkProps) => {
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
      <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <Polyline points="15 3 21 3 21 9" />
      <Line x1="10" y1="14" x2="21" y2="3" />
    </Svg>
  );
};
