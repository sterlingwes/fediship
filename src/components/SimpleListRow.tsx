import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {screenWidth} from '../dimensions';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {Box} from './Box';
import {ChevronInverted} from './icons/Chevron';
import {Type} from './Type';

export const SimpleListRow = ({
  onPress,
  label,
  hideChevron,
}: {
  onPress: () => any;
  label: string;
  hideChevron?: boolean;
}) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  return (
    <TouchableOpacity
      style={styles.listRow}
      activeOpacity={0.5}
      onPress={onPress}>
      <Box pr={10} f={1}>
        <Type scale="S" numberOfLines={1} ellipsizeMode="tail">
          {label}
        </Type>
      </Box>
      <Box>
        {!hideChevron && <ChevronInverted color={getColor('primary')} />}
      </Box>
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
