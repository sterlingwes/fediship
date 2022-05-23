import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFollowers} from '../../api';
import {Type} from '../../components/Type';
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
        <ActivityIndicator />
      </View>
    );
  }

  const renderItem: ListRenderItem<TAccount> = ({item}) => (
    <TouchableOpacity
      style={styles.listRow}
      activeOpacity={0.5}
      onPress={() =>
        navigation.navigate('Profile', {...getHostAndHandle(item)})
      }>
      <Type scale="S" style={styles.userName} medium numberOfLines={1}>
        {item.display_name || item.username}
      </Type>
      {!!item.display_name && !!item.username && (
        <Type scale="S">{item.acct}</Type>
      )}
    </TouchableOpacity>
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

const styleCreator: StyleCreator = ({getColor}) => ({
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

  listRow: {
    justifyContent: 'center',
    minHeight: 65,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomColor: getColor('baseAccent'),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  userName: {
    marginBottom: 5,
  },
});
