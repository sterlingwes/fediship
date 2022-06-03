import React, {ReactNode, useMemo} from 'react';
import {View, ViewStyle} from 'react-native';

interface BoxProps {
  mh?: number;
  mv?: number;
  ml?: number;
  mr?: number;
  mt?: number;
  mb?: number;
  ph?: number;
  pv?: number;
  pl?: number;
  pr?: number;
  pt?: number;
  pb?: number;
}

const propStyleMap: Record<keyof BoxProps, keyof ViewStyle> = Object.freeze({
  mh: 'marginHorizontal',
  mv: 'marginVertical',
  ml: 'marginLeft',
  mr: 'marginRight',
  mt: 'marginTop',
  mb: 'marginBottom',
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

export const Box = ({children, ...props}: BoxProps & {children: ReactNode}) => {
  const styles = useMemo(() => styleFor(props), [props]);
  return <View style={styles}>{children}</View>;
};
