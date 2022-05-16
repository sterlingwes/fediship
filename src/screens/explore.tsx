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
import {usePeers} from '../api';
import {Type} from '../components/Type';
import {screenWidth} from '../dimensions';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {RootStackParamList, TPeerInfo} from '../types';
import {thousandsNumber} from '../utils/numbers';
import {getRankedPeers} from './explore/peer-stats';

const PeerListHeader = () => {
  const styles = useThemeStyle(styleCreator);
  return (
    <View style={styles.peerListHeader}>
      <Type semiBold>Islands</Type>
      <Type scale="S" style={styles.peerListHeaderSubTitle}>
        Fediverse communities with people you've interacted with, ranked by
        number of users.
      </Type>
    </View>
  );
};

export const Explore = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Explore'>) => {
  const styles = useThemeStyle(styleCreator);
  const {loading, progressMessage, fetchPeers} = usePeers();

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator />
        <Type semiBold style={styles.loadingMessage}>
          {progressMessage}
        </Type>
      </View>
    );
  }

  const renderItem: ListRenderItem<TPeerInfo> = ({item}) => (
    <TouchableOpacity
      style={styles.listRow}
      activeOpacity={0.5}
      onPress={() => navigation.navigate('PeerProfile', item)}>
      <Type scale="S" style={styles.peerName} numberOfLines={1}>
        {item.title}
      </Type>
      <Type scale="S">{thousandsNumber(item.stats.user_count)}</Type>
    </TouchableOpacity>
  );

  return (
    <View>
      <FlatList
        data={getRankedPeers()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchPeers} />
        }
        ListHeaderComponent={PeerListHeader}
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
  peerListHeader: {
    padding: 15,
    backgroundColor: getColor('baseAccent'),
  },
  peerListHeaderSubTitle: {
    marginTop: 5,
  },
  listRow: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: getColor('baseAccent'),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  peerName: {
    maxWidth: (screenWidth * 2) / 3,
  },
});
