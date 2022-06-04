import React, {ReactNode, useMemo} from 'react';
import {View, ViewStyle} from 'react-native';

interface SpacingBoxProps {
  // margin: horizontal, vertical, top, right, etc.
  m?: number;
  mh?: number;
  mv?: number;
  ml?: number;
  mr?: number;
  mt?: number;
  mb?: number;
  // padding: horizontal, vertical, top, right, etc.
  p?: number;
  ph?: number;
  pv?: number;
  pl?: number;
  pr?: number;
  pt?: number;
  pb?: number;
}

interface BoxProps extends SpacingBoxProps {
  f?: number; // flex weight
  fd?: 'row' | 'column';
  sb?: boolean; // space-between
  c?: boolean; // center (horizontal & vertical)
  ch?: boolean; // center horizontal
  cv?: boolean; // center vertical
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
  const base = {
    flex: props.f,
    flexDirection: props.fd,
  };

  if (props.sb) {
    return {
      ...base,
      [props.fd === 'row' ? 'justifyContent' : 'alignContent']: 'space-between',
    };
  }

  if (props.c) {
    return {
      ...base,
      justifyContent: 'center',
      alignItems: 'center',
    };
  }

  if (props.ch && props.fd === 'row') {
    return {
      ...base,
      justifyContent: 'center',
    };
  }

  if (props.ch) {
    return {
      ...base,
      alignItems: 'center',
    };
  }

  if (props.cv && props.fd === 'row') {
    return {
      ...base,
      alignItems: 'center',
    };
  }

  if (props.cv) {
    return {
      ...base,
      justifyContent: 'center',
    };
  }

  return base;
};

export const Box = ({
  children,
  style,
  ...props
}: BoxProps & {children: ReactNode; style?: ViewStyle | ViewStyle[]}) => {
  const styles = useMemo(() => styleFor(props), [props]);
  return <View style={[styles, style, alignmentStyle(props)]}>{children}</View>;
};
