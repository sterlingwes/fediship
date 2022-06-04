import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {usePeers} from '../api';
import {useRemoteMastodonInstance} from '../api/hooks';
import {Box} from '../components/Box';
import {ChevronInverted} from '../components/icons/Chevron';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {Type} from '../components/Type';
import {screenWidth} from '../dimensions';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {RootStackParamList} from '../types';
import {useMount} from '../utils/hooks';

export const Explore = forwardRef(
  (
    {navigation}: NativeStackScreenProps<RootStackParamList, 'Explore'>,
    ref,
  ) => {
    const api = useRemoteMastodonInstance();
    const scrollRef = useRef<FlatList<string> | null>();
    const styles = useThemeStyle(styleCreator);
    const {getColor} = useThemeGetters();
    const {loading, peers, fetchPeers, filterPeers} = usePeers();
    const [loadingTags, setLoadingTags] = useState(false);
    const [tags, setTags] = useState<string[]>([]);

    useImperativeHandle(ref, () => ({
      scrollToTop: () => scrollRef.current?.scrollToOffset({offset: 0}),
    }));

    useMount(() => {
      const fetchTrends = async () => {
        try {
          setLoadingTags(true);
          const tagTrends = await api('mastodon.online').getInstanceTrends();
          const tagNames = tagTrends.map(trend => trend.name);
          setTags(tagNames);
        } catch (e) {
          console.warn('Could not load tags from instance');
        }
        setLoadingTags(false);
      };

      fetchTrends();
    });

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

    const onTagPress = useCallback(
      (tag: string) =>
        navigation.push('TagTimeline', {host: 'mastodon.online', tag}),
      [navigation],
    );

    const PeerListHeader = useMemo(() => {
      return (
        <View style={styles.header}>
          <Box p={10}>
            {loadingTags ? (
              <LoadingSpinner />
            ) : (
              <View style={styles.trends}>
                <Box mb={10}>
                  <Type semiBold scale="S" color={getColor('primary')}>
                    Trends Today
                  </Type>
                </Box>
                <Text>
                  {tags.map(tag => (
                    <Type scale="S" onPress={() => onTagPress(tag)}>
                      #{tag}{' '}
                    </Type>
                  ))}
                </Text>
              </View>
            )}
          </Box>
          <View style={styles.peerListHeader}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              clearButtonMode="always"
              onChangeText={text => filterPeers(text)}
            />
          </View>
        </View>
      );
    }, [filterPeers, styles, tags, onTagPress, loadingTags]);

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
  header: {
    backgroundColor: getColor('baseHighlight'),
  },
  peerListHeader: {
    padding: 15,
    borderTopColor: getColor('base'),
    borderTopWidth: 2,
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
