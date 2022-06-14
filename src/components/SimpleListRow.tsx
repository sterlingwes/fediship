import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {screenWidth} from '../dimensions';
import {StyleCreator, ValidColor} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {Box} from './Box';
import {ChevronInverted} from './icons/Chevron';
import {ExternalLink} from './icons/ExternalLinkIcon';
import {Type} from './Type';

export const SimpleListRow = ({
  onPress,
  label,
  hideChevron,
  icon,
  iconColor,
}: {
  onPress: () => any;
  label: string;
  hideChevron?: boolean;
  icon?: 'external-link' | 'chevron';
  iconColor?: ValidColor;
}) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  const Icon = icon === 'external-link' ? ExternalLink : ChevronInverted;
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
        {!hideChevron && <Icon color={getColor(iconColor ?? 'primary')} />}
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
