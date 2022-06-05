import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {forwardRef, useImperativeHandle, useMemo, useRef} from 'react';
import {
  FlatList,
  InteractionManager,
  ListRenderItem,
  RefreshControl,
  View,
} from 'react-native';
import {useTimeline} from '../api';
import {LoadMoreFooter} from '../components/LoadMoreFooter';
import {Status} from '../components/Status';
import {useAuth} from '../storage/auth';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {RootStackParamList, TStatusMapped} from '../types';
import {EmptyList} from './EmptyList';
import {ErrorBoundary} from './ErrorBoundary';

const createTimelineRenderer =
  (
    navigation: NativeStackNavigationProp<RootStackParamList>,
    host: string | undefined,
  ): ListRenderItem<TStatusMapped> =>
  row => {
    const status = row.item;
    const nextStatusUrl = status.reblog ? status.reblog.uri : status.uri;
    const nextId = status.reblog ? status.reblog.id : status.id;
    return (
      <Status
        key={status.id}
        isLocal={status.sourceHost === host}
        {...status}
        onPress={() => {
          navigation.push('Thread', {statusUrl: nextStatusUrl, id: nextId});
        }}
        onPressAvatar={account => {
          navigation.push('Profile', {
            account,
          });
        }}
      />
    );
  };

interface StatusListProps extends ReturnType<typeof useTimeline> {}

export const StatusList = forwardRef(
  (
    {
      hasMore,
      statuses,
      loading,
      loadingMore,
      reloading,
      fetchTimeline,
      reloadTimeline,
    }: StatusListProps,
    ref,
  ) => {
    const auth = useAuth();
    const navigation =
      useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const scrollOffsetRef = useRef(0);
    const scrollRef = useRef<FlatList<TStatusMapped> | null>();
    const styles = useThemeStyle(styleCreator);

    useImperativeHandle(ref, () => ({
      scrollToTop: () => scrollRef.current?.scrollToOffset({offset: 0}),
    }));

    const renderItem = useMemo(
      () => createTimelineRenderer(navigation, auth.host),
      [navigation, auth],
    );

    const LoadFooter = useMemo(
      () => (
        <LoadMoreFooter
          onPress={() =>
            fetchTimeline().then(() =>
              InteractionManager.runAfterInteractions(() => {
                setTimeout(() => {
                  scrollRef.current?.scrollToOffset({
                    animated: true,
                    offset: scrollOffsetRef.current + 250,
                  });
                }, 10);
              }),
            )
          }
          loading={loadingMore}
        />
      ),
      [fetchTimeline, loadingMore, scrollOffsetRef, scrollRef],
    );

    return (
      <ErrorBoundary>
        <View style={styles.screen}>
          <FlatList
            ref={nodeRef => (scrollRef.current = nodeRef)}
            data={statuses}
            renderItem={renderItem}
            style={styles.container}
            refreshControl={
              <RefreshControl
                refreshing={reloading}
                onRefresh={reloadTimeline}
              />
            }
            onScroll={event => {
              scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
            }}
            ListEmptyComponent={() => <EmptyList loading={loading} />}
            ListFooterComponent={statuses.length && hasMore ? LoadFooter : null}
          />
        </View>
      </ErrorBoundary>
    );
  },
);

const styleCreator: StyleCreator = ({getColor}) => ({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingMoreBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 5,
    alignItems: 'center',
    backgroundColor: getColor('contrastTextColor'),
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
