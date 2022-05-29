import React from 'react';
import {ActivityIndicator, TouchableOpacity} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {Type} from './Type';

export const LoadMoreFooter = ({
  loading,
  onPress,
  more,
}: {
  loading?: boolean;
  onPress: () => void;
  more?: boolean;
}) => {
  const styles = useThemeStyle(styleCreator);

  if (more === false) {
    return null;
  }

  return (
    <TouchableOpacity
      disabled={loading}
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.5}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Type scale="S" medium style={styles.label}>
          Load More
        </Type>
      )}
    </TouchableOpacity>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    backgroundColor: getColor('contrastTextColor'),
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: getColor('primary'),
    textAlign: 'center',
  },
});
