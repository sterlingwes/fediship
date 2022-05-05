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
import {useFollowers} from '../api';
import {Type} from '../components/Type';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {RootStackParamList, TAccount} from '../types';

const ListHeader = () => {
  const styles = useThemeStyle(styleCreator);
  return (
    <View style={styles.listHeader}>
      <Type semiBold>Follows</Type>
    </View>
  );
};

export const User = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Explore'>) => {
  const styles = useThemeStyle(styleCreator);
  const {loading, accounts, fetchFollowers, reloadFollowers} = useFollowers();

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
      onPress={() => navigation.navigate('Profile', {account: item})}>
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
        ListHeaderComponent={ListHeader}
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
  listHeader: {
    padding: 15,
    backgroundColor: getColor('baseAccent'),
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
