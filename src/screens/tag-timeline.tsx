import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React, {useMemo, useRef} from 'react';
import {
  FlatList,
  InteractionManager,
  ListRenderItem,
  RefreshControl,
  View,
} from 'react-native';
import {useTagTimeline} from '../api';
import {EmptyList} from '../components/EmptyList';
import {LoadMoreFooter} from '../components/LoadMoreFooter';
import {SaveTimelineButton} from '../components/SaveTimelineButton';
import {Status} from '../components/Status';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {RootStackParamList, TStatus} from '../types';
import {useMount} from '../utils/hooks';

const createTimelineRenderer =
  (
    navigation: NativeStackNavigationProp<RootStackParamList, 'TagTimeline'>,
  ): ListRenderItem<TStatus> =>
  row => {
    const status = row.item;
    const nextStatusUrl = status.reblog ? status.reblog.uri : status.uri;
    return (
      <Status
        key={status.id}
        isLocal={false}
        {...status}
        onPress={() => {
          navigation.push('Thread', {statusUrl: nextStatusUrl, id: status.id});
        }}
        onPressAvatar={account => {
          navigation.push('Profile', {
            account,
          });
        }}
      />
    );
  };

export const TagTimeline = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'TagTimeline'>) => {
  const scrollOffsetRef = useRef(0);
  const scrollRef = useRef<FlatList<TStatus> | null>();
  const styles = useThemeStyle(styleCreator);
  const {host, tag} = route.params;
  const {
    statuses,
    loading,
    loadingMore,
    fetchTimeline,
    reloadTimeline,
    hasMore,
  } = useTagTimeline(host, tag);

  const renderItem = useMemo(
    () => createTimelineRenderer(navigation),
    [navigation],
  );

  useMount(() => {
    const name = `${tag} ${host}`;
    navigation.setOptions({
      headerTitle: `#${name}`,
      headerRight: () => (
        <SaveTimelineButton params={{name, tag: {tag, host}}} />
      ),
    });
  });

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
    <View style={styles.screen}>
      <FlatList
        ref={ref => (scrollRef.current = ref)}
        data={statuses}
        renderItem={renderItem}
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loadingMore} onRefresh={reloadTimeline} />
        }
        onScroll={event => {
          scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
        }}
        ListFooterComponent={statuses.length && hasMore ? LoadFooter : null}
        ListEmptyComponent={() => <EmptyList loading={loading} />}
      />
    </View>
  );
};

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
