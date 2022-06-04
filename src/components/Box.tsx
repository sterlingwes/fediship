import React, {ReactNode, useMemo} from 'react';
import {View, ViewStyle} from 'react-native';

interface BoxProps {
  m?: number;
  mh?: number;
  mv?: number;
  ml?: number;
  mr?: number;
  mt?: number;
  mb?: number;
  p?: number;
  ph?: number;
  pv?: number;
  pl?: number;
  pr?: number;
  pt?: number;
  pb?: number;
}

const propStyleMap: Record<keyof BoxProps, keyof ViewStyle> = Object.freeze({
  m: 'margin',
  mh: 'marginHorizontal',
  mv: 'marginVertical',
  ml: 'marginLeft',
  mr: 'marginRight',
  mt: 'marginTop',
  mb: 'marginBottom',
  p: 'padding',
  ph: 'paddingHorizontal',
  pv: 'paddingVertical',
  pl: 'paddingLeft',
  pr: 'paddingRight',
  pt: 'paddingTop',
  pb: 'paddingBottom',
});

const styleFor = (props: BoxProps) => {
  const keys = Object.keys(propStyleMap) as Array<keyof BoxProps>;
  return keys.reduce((acc, key) => {
    const styleProp = propStyleMap[key];

    if (!props[key] || !styleProp) {
      return acc;
    }

    return {
      ...acc,
      [styleProp]: props[key],
    };
  }, {} as ViewStyle);
};

export const Box = ({
  children,
  style,
  ...props
}: BoxProps & {children: ReactNode; style?: ViewStyle}) => {
  const styles = useMemo(() => styleFor(props), [props]);
  return <View style={[styles, style]}>{children}</View>;
};
