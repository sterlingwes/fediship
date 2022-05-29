import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {forwardRef, useImperativeHandle, useMemo, useRef} from 'react';
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {usePeers} from '../api';
import {ChevronInverted} from '../components/icons/Chevron';
import {Type} from '../components/Type';
import {screenWidth} from '../dimensions';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {RootStackParamList} from '../types';

export const Explore = forwardRef(
  (
    {navigation}: NativeStackScreenProps<RootStackParamList, 'Explore'>,
    ref,
  ) => {
    const scrollRef = useRef<FlatList<string> | null>();
    const styles = useThemeStyle(styleCreator);
    const {getColor} = useThemeGetters();
    const {loading, peers, fetchPeers, filterPeers} = usePeers();

    useImperativeHandle(ref, () => ({
      scrollToTop: () => scrollRef.current?.scrollToOffset({offset: 0}),
    }));

    const renderItem: ListRenderItem<string> = ({item}) => (
      <TouchableOpacity
        style={styles.listRow}
        activeOpacity={0.5}
        onPress={() => navigation.navigate('PeerProfile', {host: item})}>
        <Type scale="S" style={styles.peerName} numberOfLines={1}>
          {item}
        </Type>
        <ChevronInverted color={getColor('primary')} />
      </TouchableOpacity>
    );

    const PeerListHeader = useMemo(() => {
      return (
        <View style={styles.peerListHeader}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            clearButtonMode="always"
            onChangeText={text => filterPeers(text)}
          />
        </View>
      );
    }, [filterPeers, styles]);

    return (
      <View>
        <FlatList
          ref={nodeRef => (scrollRef.current = nodeRef)}
          data={peers}
          renderItem={renderItem}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchPeers} />
          }
          ListHeaderComponent={PeerListHeader}
        />
      </View>
    );
  },
);

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
    backgroundColor: getColor('baseHighlight'),
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
  searchInput: {
    backgroundColor: getColor('base'),
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    color: getColor('baseTextColor'),
  },
});
