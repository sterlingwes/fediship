import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useMyMastodonInstance} from '../api/hooks';
import {TPoll} from '../types';
import {OutlineButton} from './OutlineButton';
import {Type} from './Type';

const widthPct = (value: number, total: number) =>
  `${Math.round((value / total) * 100) || 1}%`;

const VoteAmountLine = (props: {value: number; total: number}) => (
  <View style={styles.amountLineContainer}>
    <View
      style={[styles.amountLine, {width: widthPct(props.value, props.total)}]}
    />
  </View>
);

const PollOptionReadOnly = (props: TPoll['options'][0] & {total: number}) => (
  <View style={styles.pollOption}>
    <Type>{props.title}</Type>
    <VoteAmountLine value={props.votes_count} total={props.total} />
  </View>
);

const PollOption = (
  props: TPoll['options'][0] & {total: number; selected: boolean},
) => (
  <View style={styles.pollOption}>
    <View style={styles.pollOptionIcon}>
      <Type>{props.selected ? '✅' : '🔘'}</Type>
    </View>
    <View style={styles.pollOptionDetail}>
      <Type>{props.title}</Type>
      <VoteAmountLine value={props.votes_count} total={props.total} />
    </View>
  </View>
);

export const Poll = (props: TPoll) => {
  const api = useMyMastodonInstance();
  const [voted, setVoted] = useState(props.voted);
  const [voting, setVoting] = useState(false);
  const [selections, setSelections] = useState<number[]>(props.own_votes || []);
  const PollItem = props.expired ? PollOptionReadOnly : PollOption;

  const onSelect = (optionIndex: number) => {
    if (!props.multiple) {
      setSelections([optionIndex]);
      return;
    }

    const selectionSet = new Set<number>(selections);
    if (selectionSet.has(optionIndex)) {
      selectionSet.delete(optionIndex);
    } else {
      selectionSet.add(optionIndex);
    }
    setSelections(Array.from(selectionSet));
  };

  const onVote = async () => {
    if (voting) {
      return;
    }
    setVoting(true);
    const response = await api.vote(props.id, selections);
    setVoting(false);
    if (response.ok) {
      setVoted(true);
    }
  };

  return (
    <View style={styles.pollContainer}>
      {props.options.map((option, optionIndex) => (
        <Pressable
          disabled={props.expired}
          onPress={() => onSelect(optionIndex)}>
          <PollItem
            key={option.title}
            {...option}
            selected={selections.includes(optionIndex)}
            total={props.votes_count}
          />
        </Pressable>
      ))}
      {!voted && !props.expired && (
        <OutlineButton onPress={onVote}>Vote!</OutlineButton>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  amountLineContainer: {
    flex: 1,
    marginTop: 5,
    marginBottom: 10,
  },
  amountLine: {
    height: 5,
    backgroundColor: 'lightgrey',
    borderRadius: 3,
  },
  pollOption: {
    flexDirection: 'row',
  },
  pollOptionIcon: {
    marginRight: 10,
  },
  pollOptionDetail: {
    flex: 1,
  },
  pollContainer: {
    marginTop: 15,
  },
});
