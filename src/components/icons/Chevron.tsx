import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Polyline, SvgProps} from 'react-native-svg';

interface ChevronProps extends SvgProps {
  width?: string;
  height?: string;
  color?: ColorValue;
}

export const Chevron = ({width, height, color, ...svgProps}: ChevronProps) => {
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
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
};

export const ChevronInverted = (props: ChevronProps) => (
  <Chevron {...props} style={{transform: [{rotate: '180deg'}]}} />
);
