import React from 'react';
import {TouchableOpacity, TouchableOpacityProps, View} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {Chevron} from './icons/Chevron';

interface BackButtonProps extends TouchableOpacityProps {}

export const BackButton = (props: BackButtonProps) => {
  const {getColor} = useThemeGetters();
  const styles = useThemeStyle(styleCreator);

  return (
    <TouchableOpacity {...props}>
      <View style={styles.container}>
        <Chevron color={getColor('base')} width={'50'} height={'50'} />
      </View>
    </TouchableOpacity>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    backgroundColor: getColor('baseTextColor'),
    opacity: 0.7,
    borderRadius: 10,
  },
});
