import React from 'react';
import {Image, View, ViewStyle} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';

export const AvatarImage = ({uri, style}: {uri: string; style?: ViewStyle}) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <View style={[styles.headerAvatar, style]}>
      <Image source={{uri}} style={[styles.img]} />
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  headerAvatar: {
    backgroundColor: getColor('base'),
    borderRadius: 5,
    borderWidth: 2,
    borderColor: getColor('secondary'),
    elevation: 4,
    shadowColor: getColor('base'),
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    width: 100,
    height: 100,
  },
  img: {
    width: '100%',
    height: '100%',
  },
});
