import React from 'react';
import {View} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {InfoIcon} from './icons/InfoIcon';
import {Type} from './Type';

export const InfoBanner = ({children}: {children: string}) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  return (
    <View style={styles.container}>
      <InfoIcon color={getColor('baseAccent')} />
      <Type scale="S" style={styles.message} color={getColor('primary')}>
        {children}
      </Type>
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    backgroundColor: getColor('contrastTextColor'),
    flexDirection: 'row',
    padding: 15,
  },
  message: {
    flex: 1,
    marginLeft: 10,
  },
});
