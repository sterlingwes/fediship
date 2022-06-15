import React, {ComponentType, ReactNode} from 'react';
import {ColorValue, Pressable, ViewStyle} from 'react-native';
import {SvgProps} from 'react-native-svg';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {Box} from './Box';
import {LoadingSpinner} from './LoadingSpinner';
import {Type} from './Type';

interface ButtonProps {
  disabled?: boolean;
  loading?: boolean;
  onPress: () => any;
  children: ReactNode;
  Icon?: ComponentType<SvgProps & {color: ColorValue}>;
  style?: ViewStyle;
}

export const SolidButton = ({Icon, ...props}: ButtonProps) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  return (
    <Pressable
      style={[styles.buttonContainer, props.style]}
      disabled={props.disabled || props.loading}
      onPress={props.onPress}>
      {props.loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {Icon && (
            <Box mr={7}>
              <Icon width={20} height={20} color={getColor('baseTextColor')} />
            </Box>
          )}
          <Type
            scale="S"
            style={[
              styles.buttonLabel,
              props.disabled && styles.buttonLabelDisabled,
            ]}>
            {props.children}
          </Type>
        </>
      )}
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
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonLabel: {
    color: getColor('baseTextColor'),
    textAlign: 'center',
  },
  buttonLabelDisabled: {
    color: getColor('baseAccent'),
  },
});
