import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {FlatList, ListRenderItem, RefreshControl} from 'react-native';
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
          navigation.navigate('Thread', {statusUrl: nextStatusUrl});
        }}
        onPressAvatar={account => {
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
