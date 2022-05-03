import React from 'react';
import {RefreshControl, ScrollView} from 'react-native';
import {useTimeline} from './api';
import {Status} from './components/Status';
import {StyleCreator} from './theme';
import {useThemeStyle} from './theme/utils';
import {NavigableScreenProps} from './types';

export const Timeline = ({navigation}: NavigableScreenProps) => {
  const styles = useThemeStyle(styleCreator);
  const {statuses, loading, fetchTimeline} = useTimeline('home');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchTimeline} />
      }>
      {statuses.map(status => (
        <Status
          key={status.id}
          {...status}
          onPress={() => {
            const statusUrl = status.reblog ? status.reblog.url : status.url;
            navigation.navigate('thread', {statusUrl});
          }}
          onPressAvatar={() => {
            const statusUrl = status.reblog ? status.reblog.url : status.url;
            navigation.navigate('profile', {statusUrl});
          }}
        />
      ))}
    </ScrollView>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    flex: 1,
  },
  statusContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomColor: getColor('secondary'),
    borderBottomWidth: 1,
  },
  statusUser: {
    color: getColor('baseTextColor'),
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'right',
  },
});
