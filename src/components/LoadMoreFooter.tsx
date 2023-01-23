import {ObservableComputed} from '@legendapp/state';
import {reactive, Show} from '@legendapp/state/react';
import React from 'react';
import {TouchableOpacity, TouchableOpacityProps, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {LoadingSpinner} from './LoadingSpinner';
import {Type} from './Type';

const FCTouchableOpacity = (props: TouchableOpacityProps) => (
  <TouchableOpacity {...props} />
);

const RTouchableOpacity = reactive(FCTouchableOpacity);

export const LoadMoreFooter = ({
  loading,
  onPress,
  more,
  noSafeArea,
}: {
  loading?: ObservableComputed<boolean>;
  onPress: () => void;
  more?: boolean;
  noSafeArea?: boolean;
}) => {
  const styles = useThemeStyle(styleCreator);

  if (more === false) {
    return null;
  }

  const SafeArea = noSafeArea ? View : SafeAreaView;

  const loadMore = (
    <Type scale="S" medium style={styles.label}>
      Load More
    </Type>
  );

  return (
    <RTouchableOpacity
      disabled$={loading}
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.5}>
      <SafeArea edges={['bottom']}>
        <Show if={loading} else={loadMore}>
          <LoadingSpinner />
        </Show>
      </SafeArea>
    </RTouchableOpacity>
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
