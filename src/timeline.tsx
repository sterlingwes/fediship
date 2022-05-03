import React from 'react';
import {RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {useTimeline} from './api';
import {Status} from './components/Status';
import {NavigableScreenProps} from './types';

export const Timeline = ({navigation}: NavigableScreenProps) => {
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
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
  },
  statusUser: {
    color: 'grey',
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'right',
  },
});
