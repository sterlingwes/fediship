import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {FlashList, ListRenderItem} from '@shopify/flash-list';
import React, {
  ComponentProps,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {InteractionManager, RefreshControl, View} from 'react-native';
import {useTimeline} from '../api';
import {LoadMoreFooter} from '../components/LoadMoreFooter';
import {Status} from '../components/Status';
import {useAuth} from '../storage/auth';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {RootStackParamList, TStatusMapped} from '../types';
import {EmptyList} from './EmptyList';
import {ErrorBoundary} from './ErrorBoundary';

type StatusOverrides = Partial<ComponentProps<typeof Status>>;
type ThreadParamOverrides = Partial<RootStackParamList['Thread']>;

const createTimelineRenderer =
  (
    navigation: NativeStackNavigationProp<RootStackParamList>,
    host: string | undefined,
    statusOverrides?: StatusOverrides,
    threadParamOverrides?: ThreadParamOverrides,
  ): ListRenderItem<TStatusMapped> =>
  row => {
    const status = row.item;
    const nextStatusUrl = status.reblog ? status.reblog.uri : status.uri;
    const nextId = status.reblog ? status.reblog.id : status.id;
    return (
      <Status
        isLocal={status.sourceHost === host}
        {...status}
        {...statusOverrides}
        onPress={() => {
          // TODO: nextId should only be a localId, right now we're passing remote ids
          // which is leading to failed requests to the local instance
          navigation.push('Thread', {
            focusedStatusPreload: status,
            statusUrl: nextStatusUrl,
            id: nextId,
            ...threadParamOverrides,
          });
        }}
        onPressAvatar={account => {
          navigation.push('Profile', {
            account,
          });
        }}
      />
    );
  };

interface StatusListProps extends ReturnType<typeof useTimeline> {
  showDetail?: boolean;
  showThreadFavouritedBy?: boolean;
  statusOverrides?: StatusOverrides;
}

export const StatusList = forwardRef(
  (
    {
      hasMore,
      statuses,
      loading,
      loadingMore,
      reloading,
      showDetail,
      showThreadFavouritedBy,
      statusOverrides,
      fetchTimeline,
      reloadTimeline,
    }: StatusListProps,
    ref,
  ) => {
    const auth = useAuth();
    const navigation =
      useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const scrollOffsetRef = useRef(0);
    const scrollRef = useRef<FlashList<TStatusMapped> | null>();
    const styles = useThemeStyle(styleCreator);
    const {getColor} = useThemeGetters();

    useImperativeHandle(ref, () => ({
      scrollToTop: () => scrollRef.current?.scrollToOffset({offset: 0}),
      getIsAtTop: () => scrollOffsetRef.current === 0,
    }));

    const renderItem = useMemo(
      () =>
        createTimelineRenderer(
          navigation,
          auth.host,
          {
            ...statusOverrides,
            showDetail,
          },
          {showThreadFavouritedBy},
        ),
      [navigation, auth, statusOverrides, showDetail, showThreadFavouritedBy],
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
          <FlashList
            ref={nodeRef => (scrollRef.current = nodeRef)}
            data={statuses}
            renderItem={renderItem}
            estimatedItemSize={100}
            refreshControl={
              <RefreshControl
                tintColor={getColor('primary')}
                colors={[getColor('primary')]}
                refreshing={reloading}
                onRefresh={reloadTimeline}
              />
            }
            keyExtractor={item => item.uri ?? item.id}
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
