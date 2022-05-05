import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {useThread} from '../api';
import {Status} from '../components/Status';
import {RootStackParamList} from '../types';

export const Thread = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Thread'>) => {
  const {statusUrl} = route.params;
  const {thread, loading, fetchThread} = useThread(statusUrl);

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
            navigation.navigate('Thread', {statusUrl: childStatus.url})
          }
          onPressAvatar={account => {
            navigation.navigate('Profile', {
              statusUrl: childStatus.url,
              account,
            });
          }}
        />
      ))}

      {thread?.status && (
        <Status
          {...thread?.status}
          onPress={() => {}}
          onPressAvatar={account => {
            navigation.navigate('Profile', {
              statusUrl: thread.status.url,
              account,
            });
          }}
        />
      )}

      {thread?.descendants.map(childStatus => (
        <Status
          key={childStatus.id}
          {...childStatus}
          onPress={() =>
            navigation.navigate('Thread', {statusUrl: childStatus.url})
          }
          onPressAvatar={account => {
            navigation.navigate('Profile', {
              statusUrl: childStatus.url,
              account,
            });
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
});
