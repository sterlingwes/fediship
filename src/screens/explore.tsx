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
  SectionList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  SectionListRenderItem,
} from 'react-native';
import {usePeers} from '../api';
import {useInstanceTrends, useSearch} from '../api/explore.hooks';
import {Box} from '../components/Box';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {ProfileRowItem} from '../components/ProfileRowItem';
import {Searchbar} from '../components/SearchBar';
import {SimpleListRow} from '../components/SimpleListRow';
import {Status} from '../components/Status';
import {Type} from '../components/Type';
import {screenWidth} from '../dimensions';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {
  RootStackParamList,
  TAccount,
  TPeerTagTrend,
  TSearchResults,
  TStatusMapped,
} from '../types';

interface MenuSection {
  key: string;
  title: string;
  data: MenuItem[];
}

interface Item {
  key: string;
}

interface Status extends Item {
  type: 'status';
  status: TStatusMapped;
}

interface Account extends Item {
  type: 'account';
  account: TAccount;
}

interface TrendTag extends Item {
  type: 'tag';
  trendTag: TPeerTagTrend;
}

interface PeerInstance extends Item {
  type: 'peer';
  host: string;
}

interface Search extends Item {
  type: 'search';
}

type MenuItem = Status | Account | TrendTag | PeerInstance | Search;

const sectionSearchTypes: Array<keyof TSearchResults> = [
  'accounts',
  'statuses',
  'hashtags',
];

const titleForType = (type: keyof TSearchResults) => {
  switch (type) {
    case 'accounts':
      return 'Accounts';
    case 'statuses':
      return 'Statuses';
    case 'hashtags':
      return 'Hashtags';
    default:
      throw new Error(`Unsupported search result type ${type}`);
  }
};

const transformSearchResults = (
  searchResults: TSearchResults | undefined,
): MenuSection[] => {
  if (!searchResults) {
    return [] as MenuSection[];
  }

  return sectionSearchTypes.reduce((sections, type) => {
    if (!searchResults?.[type].length) {
      return sections;
    }

    const data = searchResults[type].map(item => {
      switch (type) {
        case 'accounts':
          return {
            key: item.url,
            type: 'account',
            account: item,
          } as Account;
        case 'statuses':
          return {
            key: item.url,
            type: 'status',
            status: item,
          } as Status;
        case 'hashtags':
          return {
            key: item.url,
            type: 'tag',
            trendTag: item,
          } as TrendTag;
        default:
          throw new Error(`Unsupported search result type ${type}`);
      }
    });
    return sections.concat({key: type, title: titleForType(type), data});
  }, [] as MenuSection[]);
};

export const Explore = forwardRef(
  (
    {navigation}: NativeStackScreenProps<RootStackParamList, 'Explore'>,
    ref,
  ) => {
    const scrollRef = useRef<SectionList<MenuItem, MenuSection> | null>();
    const scrollOffsetRef = useRef(0);
    const styles = useThemeStyle(styleCreator);
    const {getColor} = useThemeGetters();
    const {loading, peers, fetchPeers, filterPeers} = usePeers();
    const {loadingTags, tags} = useInstanceTrends('mastodon.online');
    const [searchQuery, setSearchQuery] = useState('');
    const {search, clearResults, searchResults, searching} = useSearch();

    useImperativeHandle(ref, () => ({
      scrollToTop: () =>
        scrollRef.current?.scrollToLocation({
          sectionIndex: 0,
          itemIndex: 0,
          viewPosition: 0,
        }),
      getIsAtTop: () => scrollOffsetRef.current === 0,
    }));

    const sectionData = useMemo(
      (): MenuSection[] => [
        {
          key: 'search',
          title: '',
          data: [{type: 'search'}],
        },
        ...transformSearchResults(searchResults),
        {
          key: 'peers',
          title: 'Peer Instances',
          data: peers.map(host => ({type: 'peer', host})),
        },
      ],
      [peers, searchResults],
    );

    const renderSection: SectionListRenderItem<MenuItem, MenuSection> = ({
      section,
    }) => {
      if (!section.title || !section.data.length) {
        return null;
      }

      return (
        <Box pv={12} ph={10} style={styles.header}>
          <Type semiBold color={getColor('primary')} scale="S">
            {section.title}
          </Type>
        </Box>
      );
    };

    const onSearch = () => {
      if (!searchQuery || searching) {
        return;
      }
      search(searchQuery);
    };

    const renderItem: ListRenderItem<MenuItem> = ({item}) => {
      if (item.type === 'search') {
        return (
          <View style={styles.header}>
            <Searchbar
              placeholder="Search accounts, statuses, tags & instances"
              onSearch={onSearch}
              onChangeText={text => {
                setSearchQuery(text);
                filterPeers(text);
              }}
              onClear={() => {
                setSearchQuery('');
                filterPeers('');
                clearResults();
              }}
              value={searchQuery}
              searching={searching}
            />
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
                      <Type
                        key={tag}
                        scale="S"
                        style={styles.tag}
                        onPress={() => onTagPress(tag)}>
                        #{tag}{' '}
                      </Type>
                    ))}
                  </Text>
                </View>
              )}
            </Box>
          </View>
        );
      }

      if (item.type === 'peer') {
        return (
          <SimpleListRow
            onPress={() =>
              navigation.navigate('PeerProfile', {host: item.host})
            }
            label={item.host}
          />
        );
      }

      if (item.type === 'status') {
        return (
          <Status
            {...item.status}
            onPress={() => {
              const {status} = item;
              const nextStatusUrl = status.reblog
                ? status.reblog.uri
                : status.uri;
              const nextId = status.reblog ? status.reblog.id : status.id;
              navigation.push('Thread', {statusUrl: nextStatusUrl, id: nextId});
            }}
            isLocal
          />
        );
      }

      if (item.type === 'account') {
        return (
          <ProfileRowItem
            item={item.account}
            onPress={() => navigation.push('Profile', {account: item.account})}
          />
        );
      }

      if (item.type === 'tag') {
        return (
          <SimpleListRow
            label={`#${item.trendTag.name}`}
            onPress={() => {
              const [, , host] = item.trendTag.url.split('/');
              navigation.push('TagTimeline', {tag: item.trendTag.name, host});
            }}
          />
        );
      }

      return null;
    };

    const onTagPress = useCallback(
      (tag: string) =>
        navigation.push('TagTimeline', {host: 'mastodon.online', tag}),
      [navigation],
    );

    return (
      <View>
        <SectionList
          ref={nodeRef => (scrollRef.current = nodeRef)}
          sections={sectionData}
          renderItem={renderItem}
          // @ts-expect-error type issue with renderSectionItem param values we don't use
          renderSectionHeader={renderSection}
          contentInsetAdjustmentBehavior="automatic"
          onScroll={event => {
            scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
          }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchPeers} />
          }
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
    borderTopColor: getColor('base'),
    borderTopWidth: 2,
    backgroundColor: getColor('baseHighlight'),
  },
  peerListHeader: {
    flex: 1,
    flexDirection: 'row',
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
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  searchClearBtn: {
    position: 'absolute',
    top: 7,
    right: 10,
  },
  searchSubmit: {
    flexShrink: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: getColor('base'),
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    color: getColor('baseTextColor'),
  },
  tag: {
    lineHeight: 30,
  },
});
