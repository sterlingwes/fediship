import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {Alert, FlatList, ListRenderItem, RefreshControl} from 'react-native';
import {useTimeline} from '../api';
import {Status} from '../components/Status';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {RootStackParamList, TStatus} from '../types';

const createTimelineRenderer =
  (
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>,
  ): ListRenderItem<TStatus> =>
  row => {
    const status = row.item;
    const nextStatusUrl = status.reblog ? status.reblog.url : status.url;
    return (
      <Status
        key={status.id}
        {...status}
        onPress={() => {
          if (nextStatusUrl.includes('/notes/')) {
            Alert.alert(
              '',
              'Viewing threads on Misskey posts is not yet supported.',
            );
            return;
          }

          navigation.navigate('Thread', {statusUrl: nextStatusUrl});
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

export const Timeline = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Home'>) => {
  const styles = useThemeStyle(styleCreator);
  const {statuses, loading, fetchTimeline, reloadTimeline} =
    useTimeline('home');

  const renderItem = useMemo(
    () => createTimelineRenderer(navigation),
    [navigation],
  );

  return (
    <FlatList
      data={statuses}
      renderItem={renderItem}
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={reloadTimeline} />
      }
      onEndReached={() => fetchTimeline()}
    />
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    flex: 1,
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
