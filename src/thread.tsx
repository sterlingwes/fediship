import React from 'react';
import {RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {useThread} from './api';
import {Status} from './components/Status';
import {NavigableScreenProps} from './types';
import {useBackHandler} from './utils';

export const Thread = ({navigation}: NavigableScreenProps) => {
  const params = navigation.getParams();
  const {thread, loading, fetchThread} = useThread(params.statusUrl);

  useBackHandler(() => {
    navigation.navigate('timeline');
    return true;
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchThread} />
      }>
      {thread?.ancestors.map(childStatus => (
        <Status
          key={childStatus.id}
          {...childStatus}
          onPress={() =>
            navigation.navigate('thread', {statusUrl: childStatus.url})
          }
        />
      ))}

      {thread?.status && <Status {...thread?.status} onPress={() => {}} />}

      {thread?.descendants.map(childStatus => (
        <Status
          key={childStatus.id}
          {...childStatus}
          onPress={() =>
            navigation.navigate('thread', {statusUrl: childStatus.url})
          }
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
