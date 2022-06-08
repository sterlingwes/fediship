import React from 'react';
import {Pressable, ViewStyle} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {Type} from './Type';

interface ButtonProps {
  disabled?: boolean;
  onPress: () => any;
  children: string;
  style?: ViewStyle;
}

export const OutlineButton = (props: ButtonProps) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <Pressable
      style={[styles.buttonContainer, props.style]}
      disabled={props.disabled}
      onPress={props.onPress}>
      <Type
        scale="S"
        style={[
          styles.buttonLabel,
          props.disabled && styles.buttonLabelDisabled,
        ]}>
        {props.children}
      </Type>
    </Pressable>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  buttonContainer: {
    borderColor: getColor('baseAccent'),
    borderWidth: 1,
    padding: 5,
    paddingVertical: 10,
    borderRadius: 2,
    width: '50%',
    marginVertical: 8,
  },
  buttonLabel: {
    color: getColor('baseTextColor'),
    textAlign: 'center',
  },
  buttonLabelDisabled: {
    color: getColor('baseAccent'),
  },
});
