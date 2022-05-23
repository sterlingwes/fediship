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

export const SolidButton = (props: ButtonProps) => {
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
    backgroundColor: getColor('base'),
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginVertical: 8,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 2},
  },
  buttonLabel: {
    color: getColor('baseTextColor'),
    textAlign: 'center',
  },
  buttonLabelDisabled: {
    color: getColor('baseAccent'),
  },
});
