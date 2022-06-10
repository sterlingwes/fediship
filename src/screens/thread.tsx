import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo, useRef, useState} from 'react';
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {useThread} from '../api';
import {InfoBanner} from '../components/InfoBanner';
import {InlineReply} from '../components/InlineReply';
import {LoadMoreFooter} from '../components/LoadMoreFooter';
import {Status} from '../components/Status';
import {Type} from '../components/Type';
import {RootStackParamList, TStatusMapped} from '../types';
import {resolveTerminatingTootIds} from './thread/thread.util';

export const Thread = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Thread'>) => {
  const {statusUrl, id} = route.params;
  const [initialLoad, setInitialLoad] = useState(true);
  const filtered = useRef(false);
  const {thread, loading, fetchThread, error, localFallback} = useThread(
    statusUrl,
    id,
  );

  const terminatingIds = useMemo(() => {
    if (!thread?.descendants || !thread.status) {
      return [];
    }
    return resolveTerminatingTootIds(thread.descendants, thread.status.id);
  }, [thread]);

  const statuses = useMemo(() => {
    if (localFallback) {
      return [
        ...(thread?.localResponse?.ancestors ?? []),
        ...(thread?.localResponse?.status
          ? [thread.localResponse?.status]
          : []),
        ...(thread?.localResponse?.descendants ?? []),
      ];
    }

    return [
      ...(thread?.ancestors ?? []),
      ...(thread?.status ? [thread.status] : []),
      ...(thread?.descendants ?? []),
    ];
  }, [thread, localFallback]);

  const focusedThread = useMemo(() => {
    const targetPosition = statuses.findIndex(
      status => (status.uri ?? status.url) === statusUrl,
    );

    if (targetPosition > 2 && initialLoad) {
      filtered.current = true;
      return statuses.slice(targetPosition - 1);
    }

    filtered.current = false;
    return statuses;
  }, [initialLoad, statuses, statusUrl]);

  const renderItem: ListRenderItem<TStatusMapped> = ({item, index}) => {
    const localStatus = thread?.localStatuses?.[item.uri];
    const resolvedStatus = localStatus ?? item;
    const focused = thread?.status?.id === resolvedStatus.id;

    const statusComponent = (
      <Status
        key={item.id}
        collapsed={false}
        isLocal={!!localStatus}
        focused={focused}
        {...resolvedStatus}
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

    if (!focused || !localStatus) {
      return statusComponent;
    }

    return (
      <>
        {statusComponent}
        <InlineReply
          inReplyToId={item.id}
          onlyReply={index === statuses.length - 1}
          onSent={fetchThread}
        />
      </>
    );
  };

  const LoadHeader = useMemo(
    () => <LoadMoreFooter onPress={() => setInitialLoad(false)} />,
    [setInitialLoad],
  );

  if (error) {
    return (
      <View>
        <Type>Error! {error}</Type>
      </View>
    );
  }

  const incompleteThreadBanner = localFallback ? <IncompleteThread /> : null;

  return (
    <FlatList
      data={focusedThread}
      renderItem={renderItem}
      style={styles.container}
      contentInset={{bottom: 40}}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchThread} />
      }
      ListHeaderComponent={
        initialLoad && filtered.current ? LoadHeader : incompleteThreadBanner
      }
    />
  );
};

const IncompleteThread = () => (
  <InfoBanner>
    This thread could not be retrieved from the user's instance so you may be
    seeing a partial view of it.
  </InfoBanner>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
