import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {screenWidth} from '../dimensions';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {ChevronInverted} from './icons/Chevron';
import {Type} from './Type';

export const SimpleListRow = ({
  onPress,
  label,
}: {
  onPress: () => any;
  label: string;
}) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  return (
    <TouchableOpacity
      style={styles.listRow}
      activeOpacity={0.5}
      onPress={onPress}>
      <Type scale="S" style={styles.label} numberOfLines={1}>
        {label}
      </Type>
      <ChevronInverted color={getColor('primary')} />
    </TouchableOpacity>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  listRow: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: getColor('baseAccent'),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  peerName: {
    maxWidth: (screenWidth * 2) / 3,
  },
});
