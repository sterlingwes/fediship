import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {FlatList, ListRenderItem, StyleSheet, View} from 'react-native';
import {RootStackParamList} from '../../types';
import {LikeCountStateKey, likeCountState} from '../../api/like-count.state';
import {Type} from '../../components/Type';
import {Box} from '../../components/Box';

type VoteRow = {
  id: string;
  label: string;
  votes?: number;
};

export const VoteList = ({}: NativeStackScreenProps<
  RootStackParamList,
  'VoteList'
>) => {
  const voteList = useMemo(() => {
    return Object.keys(likeCountState).reduce((acc, type) => {
      acc.push({id: `${type}-`, label: type});
      const rows: VoteRow[] = [];
      Object.keys(likeCountState[type as LikeCountStateKey]).forEach(name => {
        rows.push({
          id: `${type}-${name}`,
          label: name,
          votes: likeCountState[type as LikeCountStateKey][name],
        });
      });
      rows.sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
      return acc.concat(rows);
    }, [] as VoteRow[]);
  }, []);

  const renderItem: ListRenderItem<VoteRow> = ({item}) => (
    <Box
      fd="row"
      p={10}
      style={{
        borderBottomColor: 'black',
        borderBottomWidth: StyleSheet.hairlineWidth,
      }}>
      <Box f={1}>
        <Type>{item.label}</Type>
      </Box>
      <Box>
        <Type
          color={
            item.votes
              ? item.id.includes('Dislike')
                ? 'magenta'
                : 'gold'
              : 'black'
          }>
          {item.votes ? (item.id.includes('Dislike') ? '-' : '+') : ''}
          {item.votes ?? '~~~~~~'}
        </Type>
      </Box>
    </Box>
  );

  return (
    <View>
      <FlatList
        data={voteList}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};
