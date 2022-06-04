import React from 'react';
import {TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {LoadingSpinner} from './LoadingSpinner';
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
      <SafeAreaView edges={['bottom']}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <Type scale="S" medium style={styles.label}>
            Load More
          </Type>
        )}
      </SafeAreaView>
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
