import type {Observable} from '@legendapp/state';
import {useSelector} from '@legendapp/state/react';
import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, Polygon} from 'react-native-svg';

interface StarIconProps {
  width?: string | number;
  height?: string | number;
  stroke?: ColorValue;
  strokeActive$?: Observable<boolean>;
  strokeActiveColor?: ColorValue;
  strokeInactiveColor?: ColorValue;
  fill?: ColorValue;
  fillActive$?: Observable<boolean>;
  fillActiveColor?: ColorValue;
  fillInactiveColor?: ColorValue;
}

export const StarIcon = ({
  width,
  height,
  stroke,
  strokeActive$,
  strokeActiveColor,
  strokeInactiveColor,
  fill,
  fillActive$,
  fillActiveColor,
  fillInactiveColor,
}: StarIconProps) => {
  const strokeColor = useSelector(() => {
    if (!strokeActive$) {
      return stroke ?? 'currentColor';
    }

    return strokeActive$.get()
      ? strokeActiveColor
      : strokeInactiveColor ?? 'currentColor';
  });
  const fillColor = useSelector(() => {
    if (!fillActive$) {
      return fill ?? 'none';
    }

    return fillActive$.get() ? fillActiveColor : fillInactiveColor ?? 'none';
  });

  return (
    <Svg
      width={width ?? '24'}
      height={height ?? '24'}
      viewBox="0 0 24 24"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </Svg>
  );
};
