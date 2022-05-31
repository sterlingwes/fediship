import React from 'react';
import {TextInputProps, TextStyle} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {useThemeGetters} from '../theme/utils';
import {FontScale, fontScales, Type} from './Type';
// import {StyleCreator} from '../theme';

interface Props extends TextInputProps {
  scale?: FontScale;
}

export const Input = ({value, ...props}: Props) => {
  const {getColor} = useThemeGetters();
  const scale = fontScales[props.scale ?? 'M'];

  const style = {
    lineHeight: scale * 1.4,
    color: getColor('baseTextColor'),
  } as TextStyle;

  return (
    <TextInput {...props} placeholderTextColor={getColor('baseAccent')}>
      <Type scale={props.scale} style={style}>
        {value}
      </Type>
    </TextInput>
  );
};

// const styleCreator: StyleCreator = ({getColor}) => ({});
