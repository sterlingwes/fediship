import React, {useMemo} from 'react';
import {ColorValue, StyleProp, Text, TextProps, TextStyle} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';

export const fontScales = Object.freeze({
  MEGA: 32,
  XL: 28,
  L: 24,
  M: 20,
  S: 16,
  XS: 14,
});

export type FontScale = keyof typeof fontScales;
export type FontWeight = 'bold' | 'semiBold' | 'medium' | 'regular';
export interface TypeProps extends TextProps {
  scale?: FontScale;
  bold?: boolean;
  color?: ColorValue | null;
  semiBold?: boolean;
  medium?: boolean;
  weight?: FontWeight;
  center?: boolean;
}

export const getTextScaleStyle = (scale: TypeProps['scale']) => {
  const resolvedScale = fontScales[scale ?? 'M'];
  return {fontSize: resolvedScale, lineHeight: resolvedScale * 1.3};
};

export const getTextStyle = (
  props: TypeProps,
  styles: ReturnType<StyleCreator>,
): StyleProp<TextStyle> => {
  return [
    styles.baseFamily,
    props.color === null ? undefined : styles.baseColor,
    props.weight === 'bold' || props.bold ? styles.bold : undefined,
    props.weight === 'semiBold' || props.semiBold ? styles.semiBold : undefined,
    props.weight === 'medium' || props.medium ? styles.medium : undefined,
    getTextScaleStyle(props.scale),
    props.center && {textAlign: 'center' as TextStyle['textAlign']},
    props.style,
    props.color ? {color: props.color} : undefined,
  ].filter(s => !!s);
};

export const Type = (props: TypeProps) => {
  const styles = useThemeStyle(fontStyleFactory);
  const textStyle = useMemo(() => getTextStyle(props, styles), [props, styles]);
  return <Text {...props} style={textStyle} />;
};

export const fontStyleFactory: StyleCreator = ({getColor}) => ({
  bold: {
    fontFamily: 'Nunito-Bold',
    // fontWeight: '700',
  },
  semiBold: {
    fontFamily: 'Nunito-SemiBold',
    // fontWeight: '600',
  },
  medium: {
    fontFamily: 'Nunito-Medium',
    // fontWeight: '500',
  },
  baseColor: {
    color: getColor('baseTextColor'),
  },
  baseFamily: {
    fontFamily: 'Nunito-Regular',
  },
  nativeHeaderFont: {
    fontFamily: 'Nunito-Bold',
    fontWeight: undefined,
  },
});
