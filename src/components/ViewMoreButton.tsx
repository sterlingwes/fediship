import React from 'react';
import {View} from 'react-native';
import {StyleCreator} from '../theme/types';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {ChevronInverted} from './icons/Chevron';
import {Type} from './Type';

export const ViewMoreButton = ({left}: {left?: boolean}) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  return (
    <View style={[styles.viewMore, left && styles.viewMoreLeft]}>
      <Type scale="XS" semiBold style={styles.viewMoreText}>
        View More
      </Type>
      <ChevronInverted color={getColor('primary')} width="18" />
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  viewMore: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  viewMoreLeft: {
    justifyContent: 'flex-start',
  },
  viewMoreText: {
    marginRight: 2,
    marginBottom: 1,
    color: getColor('primary'),
  },
});
