import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {useThread} from '../api';
import {Status} from '../components/Status';
import {Type} from '../components/Type';
import {RootStackParamList, TStatus} from '../types';
import {resolveTerminatingTootIds} from './thread/thread.util';

export const Thread = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Thread'>) => {
  const {statusUrl, id} = route.params;
  const {thread, loading, fetchThread, error} = useThread(statusUrl, id);

  const terminatingIds = useMemo(() => {
    if (!thread?.descendants || !thread.status) {
      return [];
    }
    return resolveTerminatingTootIds(thread.descendants, thread.status.id);
  }, [thread]);

  const statuses = useMemo(() => {
    return [
      ...(thread?.ancestors ?? []),
      ...(thread?.status ? [thread.status] : []),
      ...(thread?.descendants ?? []),
    ];
  }, [thread]);

  const renderItem: ListRenderItem<TStatus> = ({item, index}) => {
    const localStatus = thread?.localStatuses?.[item.uri];

    return (
      <Status
        key={item.id}
        collapsed={false}
        isLocal={!!localStatus}
        focused={thread?.status?.id === item.id}
        {...(localStatus ?? item)}
        hasReplies={!!statuses[index + 1]}
        lastStatus={
          terminatingIds.includes(item.id) || statuses.length - 1 === index
        }
        onPress={() => {
          if (statusUrl === item.uri || item.id === id) {
            return;
          }
          navigation.push('Thread', {statusUrl: item.uri, id: item.id});
        }}
        onPressAvatar={account => {
          navigation.push('Profile', {
            account,
          });
        }}
      />
    );
  };

  if (error) {
    return (
      <View>
        <Type>Error! {error}</Type>
      </View>
    );
  }

  return (
    <FlatList
      data={statuses}
      renderItem={renderItem}
      style={styles.container}
      contentInset={{bottom: 40}}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchThread} />
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
