import React from 'react';
import {Image, ImageStyle} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';

export const AvatarImage = ({
  uri,
  style,
}: {
  uri: string;
  style?: ImageStyle;
}) => {
  const styles = useThemeStyle(styleCreator);
  return <Image source={{uri}} style={[styles.headerAvatar, style]} />;
};

const styleCreator: StyleCreator = ({getColor}) => ({
  headerAvatar: {
    width: 100,
    height: 100,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: getColor('secondary'),
    shadowColor: getColor('base'),
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
  },
});
