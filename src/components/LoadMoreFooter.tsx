import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {LoadingSpinner} from './LoadingSpinner';
import {Type} from './Type';

export const LoadMoreFooter = ({
  loading,
  onPress,
  more,
  noSafeArea,
}: {
  loading?: boolean;
  onPress: () => void;
  more?: boolean;
  noSafeArea?: boolean;
}) => {
  const styles = useThemeStyle(styleCreator);

  if (more === false) {
    return null;
  }

  const SafeArea = noSafeArea ? View : SafeAreaView;

  return (
    <TouchableOpacity
      disabled={loading}
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.5}>
      <SafeArea edges={['bottom']}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <Type scale="S" medium style={styles.label}>
            Load More
          </Type>
        )}
      </SafeArea>
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
