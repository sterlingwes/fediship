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
      <View>
        <View
          style={[styles.container, !props.transparent && styles.transparent]}
        />
        <Chevron
          color={
            props.transparent
              ? getColor('contrastTextColor')
              : getColor('primary')
          }
          width={'40'}
          height={'40'}
          style={styles.icon}
        />
      </View>
    </TouchableOpacity>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
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
    left: -2,
  },
});
