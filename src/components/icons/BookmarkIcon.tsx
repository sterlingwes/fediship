import {Observable} from '@legendapp/state';
import {useSelector} from '@legendapp/state/react';
import React from 'react';
import {ColorValue} from 'react-native';
import {Svg, SvgProps, Path} from 'react-native-svg';

interface BookmarkProps extends SvgProps {
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

export const BookmarkIcon = ({
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
  ...svgProps
}: BookmarkProps) => {
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
      {...svgProps}
      width={width ?? '24'}
      height={height ?? '24'}
      viewBox="0 0 24 24"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </Svg>
  );
};
