import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {Chevron} from './icons/Chevron';

interface BackButtonProps extends TouchableOpacityProps {
  transparent?: boolean;
}

export const BackButton = (props: BackButtonProps) => {
  const {getColor} = useThemeGetters();
  const styles = useThemeStyle(styleCreator);

  return (
    <TouchableOpacity {...props}>
      <View style={styles.root}>
        <View
          style={[styles.container, props.transparent && styles.transparent]}
        />
        <Chevron
          color={
            !props.transparent
              ? getColor('contrastTextColor')
              : getColor('primary')
          }
          width={'35'}
          height={'35'}
          style={styles.icon}
        />
      </View>
    </TouchableOpacity>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  root: {
    top: 5,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor('baseTextColor'),
    opacity: 0.7,
    borderRadius: 10,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  icon: {
    top: 0,
    left: -2,
  },
});
