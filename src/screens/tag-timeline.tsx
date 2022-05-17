import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useRef} from 'react';
import {
  Alert,
  FlatList,
  InteractionManager,
  ListRenderItem,
  RefreshControl,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTagTimeline} from '../api';
import {Status} from '../components/Status';
import {Type} from '../components/Type';
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
          if (nextStatusUrl.includes('/notes/')) {
            Alert.alert(
              '',
              'Viewing threads on Misskey posts is not yet supported.',
            );
            return;
          }

          navigation.push('Thread', {statusUrl: nextStatusUrl, id: status.id});
        }}
        onPressAvatar={account => {
          if (nextStatusUrl.includes('/notes/')) {
            Alert.alert('', 'Viewing Misskey profiles is not yet supported.');
            return;
          }

          navigation.push('Profile', {
            statusUrl: nextStatusUrl,
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
  const scrollRef = React.createRef<FlatList<TStatus>>();
  const lastStatusLenRef = useRef(0);
  const styles = useThemeStyle(styleCreator);
  const {host, tag} = route.params;
  const {statuses, loading, loadingMore, fetchTimeline, reloadTimeline} =
    useTagTimeline(host, tag);

  const renderItem = useMemo(
    () => createTimelineRenderer(navigation),
    [navigation],
  );

  useMount(() => {
    navigation.setOptions({
      headerTitle: `${host} #${tag}`,
    });
  });

  useEffect(() => {
    if (
      lastStatusLenRef.current > 0 &&
      statuses.length > lastStatusLenRef.current
    ) {
      setTimeout(
        () =>
          InteractionManager.runAfterInteractions(() =>
            scrollRef.current?.scrollToOffset({
              animated: true,
              offset: scrollOffsetRef.current + 200,
            }),
          ),
        100,
      );
    }

    lastStatusLenRef.current = statuses.length;
  }, [lastStatusLenRef, scrollRef, statuses]);

  return (
    <View style={styles.screen}>
      <FlatList
        ref={scrollRef}
        data={statuses}
        renderItem={renderItem}
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={reloadTimeline} />
        }
        onScroll={event => {
          scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
        }}
        onEndReached={() => fetchTimeline()}
      />
      {loadingMore && (
        <View style={styles.loadingMoreBar}>
          <SafeAreaView edges={['bottom']}>
            <Type scale="S" medium>
              Loading More...
            </Type>
          </SafeAreaView>
        </View>
      )}
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
