import React, {ReactNode} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {StyleCreator} from '../../theme';
import {useThemeGetters, useThemeStyle} from '../../theme/utils';
import {flex} from '../../utils/styles';
import {ChevronInverted} from '../icons/Chevron';
import {Type} from '../Type';

export const DrawerButton = ({
  children,
  active,
  onPress,
}: {
  children: ReactNode;
  active?: boolean;
  onPress: () => void;
}) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.5}
      style={[styles.touchable, active && styles.active]}>
      <View style={styles.buttonRow}>
        <Type scale="S" style={flex} numberOfLines={1}>
          {children}
        </Type>
        <ChevronInverted
          color={getColor(active ? 'baseTextColor' : 'baseAccent')}
        />
      </View>
    </TouchableOpacity>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  buttonRow: {
    marginHorizontal: 8,
    marginVertical: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  touchable: {
    borderTopWidth: 1,
    borderColor: getColor('baseHighlight'),
  },
  active: {backgroundColor: getColor('baseHighlight')},
});
