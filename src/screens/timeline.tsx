import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
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
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {RootStackParamList, TStatus} from '../types';

const createTimelineRenderer =
  (
    navigation: NativeStackNavigationProp<
      RootStackParamList,
      'Local' | 'Federated'
    >,
  ): ListRenderItem<TStatus> =>
  row => {
    const status = row.item;
    const nextStatusUrl = status.reblog ? status.reblog.uri : status.uri;
    return (
      <Status
        key={status.id}
        isLocal
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

export const Timeline = forwardRef(
  (
    {
      navigation,
      route,
    }: NativeStackScreenProps<RootStackParamList, 'Local' | 'Federated'>,
    ref,
  ) => {
    const scrollOffsetRef = useRef(0);
    const scrollRef = useRef<FlatList<TStatus> | null>();
    const styles = useThemeStyle(styleCreator);
    const {statuses, loading, loadingMore, fetchTimeline, reloadTimeline} =
      useTimeline(route.params.timeline);

    useImperativeHandle(ref, () => ({
      scrollToTop: () => scrollRef.current?.scrollToOffset({offset: 0}),
    }));

    const renderItem = useMemo(
      () => createTimelineRenderer(navigation),
      [navigation],
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
      <View style={styles.screen}>
        <FlatList
          ref={nodeRef => (scrollRef.current = nodeRef)}
          data={statuses}
          renderItem={renderItem}
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={reloadTimeline} />
          }
          onScroll={event => {
            scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
          }}
          ListFooterComponent={statuses.length ? LoadFooter : null}
        />
      </View>
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
