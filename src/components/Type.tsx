import React from 'react';
import {Text, TextProps} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';

const fontScales = Object.freeze({
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
  semiBold?: boolean;
  medium?: boolean;
  weight?: FontWeight;
}

export const Type = (props: TypeProps) => {
  const styles = useThemeStyle(styleCreator);
  const scale = fontScales[props.scale ?? 'M'];
  return (
    <Text
      {...props}
      style={[
        styles.text,
        props.weight === 'bold' || (props.bold && styles.bold),
        props.weight === 'semiBold' || (props.semiBold && styles.semiBold),
        props.weight === 'medium' || (props.medium && styles.medium),
        {fontSize: scale, lineHeight: scale * 1.3},
        props.style,
      ]}
    />
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  bold: {
    fontWeight: '700',
  },
  semiBold: {
    fontWeight: '600',
  },
  medium: {
    fontWeight: '500',
  },
  text: {
    color: getColor('baseTextColor'),
  },
});
