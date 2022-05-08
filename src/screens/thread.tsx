import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useThread} from '../api';
import {Status} from '../components/Status';
import {RootStackParamList, TStatus} from '../types';

export const Thread = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Thread'>) => {
  const {statusUrl} = route.params;
  const {thread, loading, fetchThread} = useThread(statusUrl);

  const statuses = useMemo(() => {
    return [
      ...(thread?.ancestors ?? []),
      ...(thread?.status ? [thread.status] : []),
      ...(thread?.descendants ?? []),
    ];
  }, [thread]);

  const renderItem: ListRenderItem<TStatus> = ({item, index}) => {
    return (
      <Status
        key={item.id}
        focused={thread?.status.id === item.id}
        {...item}
        hasReplies={!!statuses[index + 1]}
        lastStatus={statuses.length - 1 === index}
        onPress={() => navigation.navigate('Thread', {statusUrl: item.url})}
        onPressAvatar={account => {
          navigation.push('Profile', {
            statusUrl: item.url,
            account,
          });
        }}
      />
    );
  };

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
