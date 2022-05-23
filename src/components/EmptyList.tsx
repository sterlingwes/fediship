import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {Type} from './Type';

export const EmptyList = ({loading}: {loading?: boolean}) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={getColor('primary')} />
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
