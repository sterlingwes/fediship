import React, {ReactNode, useMemo} from 'react';
import {View, ViewStyle} from 'react-native';

interface SpacingBoxProps {
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

interface BoxProps extends SpacingBoxProps {
  fd?: 'row' | 'column';
  c?: boolean;
  ch?: boolean;
  cv?: boolean;
}

const propStyleMap: Record<keyof SpacingBoxProps, keyof ViewStyle> =
  Object.freeze({
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
  const keys = Object.keys(propStyleMap) as Array<keyof SpacingBoxProps>;
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

const alignmentStyle = (props: BoxProps): ViewStyle => {
  if (props.c) {
    return {
      justifyContent: 'center',
      alignItems: 'center',
    };
  }

  if (props.ch && props.fd === 'row') {
    return {
      justifyContent: 'center',
    };
  }

  if (props.ch) {
    return {
      alignItems: 'center',
    };
  }

  if (props.cv && props.fd === 'row') {
    return {
      alignItems: 'center',
    };
  }

  if (props.cv) {
    return {
      justifyContent: 'center',
    };
  }

  return {};
};

export const Box = ({
  children,
  style,
  ...props
}: BoxProps & {children: ReactNode; style?: ViewStyle}) => {
  const styles = useMemo(() => styleFor(props), [props]);
  return <View style={[styles, style, alignmentStyle(props)]}>{children}</View>;
};
