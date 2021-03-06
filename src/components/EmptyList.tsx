import React from 'react';
import {View} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {LoadingSpinner} from './LoadingSpinner';
import {Type} from './Type';

export const EmptyList = ({loading}: {loading?: boolean}) => {
  const styles = useThemeStyle(styleCreator);

  return (
    <View style={styles.container}>
      {loading ? (
        <LoadingSpinner size="large" />
      ) : (
        <Type style={styles.text}>Nothing to see here!</Type>
      )}
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  text: {color: getColor('primary')},
});
