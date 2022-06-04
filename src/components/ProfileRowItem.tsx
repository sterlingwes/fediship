import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {TAccount} from '../types';
import {Type} from './Type';

interface ProfileRowItemProps {
  item: TAccount;
  onPress: () => any;
}

export const ProfileRowItem = ({onPress, item}: ProfileRowItemProps) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <TouchableOpacity
      style={styles.listRow}
      activeOpacity={0.5}
      onPress={onPress}>
      <Image source={{uri: item.avatar_static}} style={styles.avatar} />
      <View style={styles.userDetails}>
        <Type scale="S" style={styles.userName} medium numberOfLines={1}>
          {item.display_name || item.username}
        </Type>
        {!!item.display_name && !!item.username && (
          <Type scale="S">{item.acct}</Type>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  listRow: {
    flexDirection: 'row',
    minHeight: 65,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomColor: getColor('baseAccent'),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
    marginRight: 15,
    borderRadius: 5,
    backgroundColor: getColor('baseAccent'),
  },
  userDetails: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  userName: {
    marginBottom: 5,
  },
});
