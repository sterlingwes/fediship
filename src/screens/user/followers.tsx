import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {FlatList, ListRenderItem, RefreshControl, View} from 'react-native';
import {useFollowers} from '../../api';
import {LoadingSpinner} from '../../components/LoadingSpinner';
import {ProfileRowItem} from '../../components/ProfileRowItem';
import {StyleCreator} from '../../theme';
import {useThemeStyle} from '../../theme/utils';
import {RootStackParamList, TAccount} from '../../types';
import {useMount} from '../../utils/hooks';
import {getHostAndHandle} from '../../utils/mastodon';

export const FollowerList = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'FollowerList'>) => {
  const styles = useThemeStyle(styleCreator);
  const {source} = route.params;
  const {loading, accounts, fetchFollowers, reloadFollowers} =
    useFollowers(source);

  useMount(() => {
    navigation.setOptions({
      headerTitle: source === 'mine' ? 'Followers' : 'Following',
    });
  });

  if (loading && !accounts.length) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingSpinner />
      </View>
    );
  }

  const renderItem: ListRenderItem<TAccount> = ({item}) => (
    <ProfileRowItem
      onPress={() =>
        navigation.navigate('Profile', {...getHostAndHandle(item)})
      }
      item={item}
    />
  );

  return (
    <View>
      <FlatList
        data={accounts}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={!!accounts.length && loading}
            onRefresh={reloadFollowers}
          />
        }
        keyExtractor={item => `${item.id}-${item.acct}`}
        onEndReached={() => fetchFollowers()}
      />
    </View>
  );
};

const styleCreator: StyleCreator = () => ({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMessage: {
    marginTop: 20,
  },
});
