import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {usePeers} from './api';
import {Type} from './components/Type';
import {StyleCreator} from './theme';
import {useThemeStyle} from './theme/utils';

export const Explore = () => {
  const styles = useThemeStyle(styleCreator);
  const {loading, progressMessage} = usePeers();

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator />
        <Type semiBold style={styles.loadingMessage}>
          {progressMessage}
        </Type>
      </View>
    );
  }

  return <View />;
};

const styleCreator: StyleCreator = () => ({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMessage: {
    marginTop: 20,
  },
});
