import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {FlatList, ListRenderItem} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {usePeers} from '../../api';
import {Box} from '../../components/Box';
import {EmptyList} from '../../components/EmptyList';
import {Searchbar} from '../../components/SearchBar';
import {SimpleListRow} from '../../components/SimpleListRow';
import {getPickedPeer, setPickedPeer} from '../../storage/saved-timelines';
import {StyleCreator} from '../../theme';
import {useThemeStyle} from '../../theme/utils';
import {RootStackParamList} from '../../types';
import {flex} from '../../utils/styles';

export const PeerPicker = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'PeerPicker'>) => {
  const [query, setQuery] = useState(getPickedPeer() ?? '');
  const {peers, loading, filterPeers} = usePeers(false, getPickedPeer());
  const styles = useThemeStyle(styleCreator);

  const renderItem: ListRenderItem<string> = ({item}) => {
    return (
      <SimpleListRow
        hideChevron
        onPress={() => {
          setPickedPeer(item);
          navigation.goBack();
        }}
        label={item}
      />
    );
  };

  const onSearch = (text: string) => {
    setQuery(text);
    filterPeers(text);
  };

  const onClear = () => {
    setQuery('');
    filterPeers('');
  };

  return (
    <SafeAreaView edges={['bottom']} style={flex}>
      <Box style={styles.search}>
        <Searchbar
          onChangeText={onSearch}
          onClear={onClear}
          value={query}
          placeholder="Search"
        />
      </Box>
      <FlatList
        data={peers}
        renderItem={renderItem}
        ListEmptyComponent={() => <EmptyList loading={loading} />}
        style={flex}
      />
    </SafeAreaView>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  search: {
    backgroundColor: getColor('baseHighlight'),
  },
});
