import React, {
  ComponentProps,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  FlatList,
  ListRenderItem,
  InteractionManager,
  RefreshControl,
  View,
} from 'react-native';
import {useTimeline} from '../api';
import {LoadMoreFooter} from './LoadMoreFooter';
import {Status} from './Status';
import {useAuth} from '../storage/auth';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {RootStackParamList} from '../types';
import {EmptyList} from './EmptyList';
import {ErrorBoundary} from './ErrorBoundary';
import {ReactiveStatus} from './ReactiveStatus';
import {useComputed, useSelector} from '@legendapp/state/react';

type StatusOverrides = Partial<ComponentProps<typeof Status>>;
type ThreadParamOverrides = Partial<RootStackParamList['Thread']>;

const createTimelineRenderer =
  (
    host: string | undefined,
    statusOverrides?: StatusOverrides,
    threadParamOverrides?: ThreadParamOverrides,
  ): ListRenderItem<any> =>
  ({item: statusId}) =>
    (
      <ReactiveStatus
        {...{statusId, host, statusOverrides, threadParamOverrides}}
      />
    );

interface StatusListProps extends ReturnType<typeof useTimeline> {
  showDetail?: boolean;
  showThreadFavouritedBy?: boolean;
  statusOverrides?: StatusOverrides;
}

export const StatusList = forwardRef(
  (
    {
      timeline,
      metaRef,
      showDetail,
      showThreadFavouritedBy,
      statusOverrides,
      fetchTimeline,
      reloadTimeline,
    }: StatusListProps,
    ref,
  ) => {
    const auth = useAuth();
    const scrollOffsetRef = useRef(0);
    const scrollRef = useRef<FlatList | null>();
    const styles = useThemeStyle(styleCreator);
    const {getColor} = useThemeGetters();

    useImperativeHandle(ref, () => ({
      scrollToTop: () => scrollRef.current?.scrollToOffset({offset: 0}),
      getIsAtTop: () => scrollOffsetRef.current === 0,
    }));

    const renderItem = useMemo(
      () =>
        createTimelineRenderer(
          auth.host,
          {
            ...statusOverrides,
            showDetail,
          },
          {showThreadFavouritedBy},
        ),
      [auth, statusOverrides, showDetail, showThreadFavouritedBy],
    );

    const {loading, reloading, statusIds, hasMore, hasStatuses} = useSelector(
      () => {
        const _timeline = timeline.get() ?? [];
        const _loading = metaRef.loading.get();
        const _nextPage = metaRef.nextPage.get();
        return {
          statusIds: _timeline,
          loading: _loading,
          hasMore: _nextPage !== false,
          hasStatuses: !!_timeline.length,
          reloading:
            typeof _nextPage === 'undefined' && _loading && !!_timeline.length,
        };
      },
    );

    const loadingMore = useComputed(
      () => !!metaRef.nextPage.get() && metaRef.loading.get(),
    );

    const LoadFooter = (
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
    );

    const renderNonce = useSelector(() => metaRef.renderNonce.get());

    return (
      <ErrorBoundary>
        <View style={styles.screen}>
          <FlatList
            ref={nodeRef => (scrollRef.current = nodeRef)}
            data={statusIds}
            renderItem={renderItem}
            extraData={renderNonce}
            refreshControl={
              <RefreshControl
                tintColor={getColor('primary')}
                colors={[getColor('primary')]}
                refreshing={reloading}
                onRefresh={reloadTimeline}
              />
            }
            keyExtractor={statusId => statusId}
            onScroll={event => {
              scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
            }}
            ListEmptyComponent={() => <EmptyList loading={loading} />}
            ListFooterComponent={hasStatuses && hasMore ? LoadFooter : null}
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
