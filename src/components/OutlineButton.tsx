import React from 'react';
import {Pressable} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {Type} from './Type';

interface ButtonProps {
  disabled?: boolean;
  onPress: () => any;
  children: string;
}

export const OutlineButton = (props: ButtonProps) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <Pressable style={styles.buttonContainer} onPress={props.onPress}>
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