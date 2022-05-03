import React from 'react';
import {RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {useProfile} from './api';
import {Status} from './components/Status';
import {NavigableScreenProps} from './types';
import {useBackHandler} from './utils';

export const Profile = ({navigation}: NavigableScreenProps) => {
  const params = navigation.getParams();
  const {statuses, loading, fetchTimeline} = useProfile(params.statusUrl);

  useBackHandler(() => {
    navigation.navigate('timeline');
    return true;
  });

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
