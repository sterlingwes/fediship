import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {useProfile} from './api';
import {Status} from './components/Status';
import {RootStackParamList} from './types';
import {useBackHandler} from './utils';

export const Profile = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Profile'>) => {
  const {statusUrl} = route.params;
  const {statuses, loading, fetchTimeline} = useProfile(statusUrl);

  useBackHandler(() => {
    navigation.navigate('Timeline');
    return true;
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchTimeline} />
      }>
      {statuses.map(status => {
        const nextStatusUrl = status.reblog ? status.reblog.url : status.url;
        return (
          <Status
            key={status.id}
            {...status}
            onPress={() => {
              navigation.navigate('Thread', {statusUrl: nextStatusUrl});
            }}
            onPressAvatar={() => {
              navigation.navigate('Profile', {statusUrl: nextStatusUrl});
            }}
          />
        );
      })}
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
