import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {useMyMastodonInstance} from '../api/hooks';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {TPoll} from '../types';
import {OutlineButton} from './OutlineButton';
import {Type} from './Type';

const widthPct = (value: number, total: number) =>
  `${Math.round((value / total) * 100) || 1}%`;

const VoteAmountLine = (props: {
  value: number;
  total: number;
  selected: boolean;
}) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <View style={styles.amountLineContainer}>
      <View
        style={[
          styles.amountLine,
          {width: widthPct(props.value, props.total)},
          props.selected && styles.pollOptionVoteLine,
        ]}
      />
    </View>
  );
};

const PollOptionReadOnly = (
  props: TPoll['options'][0] & {total: number; selected: boolean},
) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <View style={styles.pollOptionReadOnly}>
      <Type style={props.selected && styles.pollOptionVote}>{props.title}</Type>
      <VoteAmountLine
        value={props.votes_count}
        total={props.total}
        selected={props.selected}
      />
    </View>
  );
};

const PollOption = (
  props: TPoll['options'][0] & {total: number; selected: boolean},
) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <View style={styles.pollOption}>
      <View style={styles.pollOptionIcon}>
        <Type>{props.selected ? '✅' : '🔘'}</Type>
      </View>
      <View style={styles.pollOptionDetail}>
        <Type>{props.title}</Type>
      </View>
    </View>
  );
};

export const Poll = (props: TPoll) => {
  const api = useMyMastodonInstance();
  const styles = useThemeStyle(styleCreator);
  const [voted, setVoted] = useState(props.voted);
  const [voting, setVoting] = useState(false);
  const [voteResult, setVoteResult] = useState<TPoll>();
  const [selections, setSelections] = useState<number[]>(props.own_votes || []);

  const poll = voteResult ?? props;

  const PollItem = poll.expired || poll.voted ? PollOptionReadOnly : PollOption;

  const onSelect = (optionIndex: number) => {
    if (!poll.multiple) {
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
      setVoteResult(response.body);
      setSelections([]);
    }
  };

  return (
    <View style={styles.pollContainer}>
      {poll.options.map((option, optionIndex) => (
        <Pressable
          disabled={poll.expired}
          onPress={() => onSelect(optionIndex)}>
          <PollItem
            key={option.title}
            {...option}
            selected={
              selections.includes(optionIndex) ||
              poll.own_votes.includes(optionIndex)
            }
            total={poll.votes_count}
          />
        </Pressable>
      ))}
      {!voted && !poll.expired && (
        <OutlineButton onPress={onVote}>Vote!</OutlineButton>
      )}
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
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
  pollOptionReadOnly: {
    flexDirection: 'column',
  },
  pollOptionIcon: {
    marginRight: 10,
  },
  pollOptionVote: {
    color: getColor('primary'),
  },
  pollOptionVoteLine: {
    backgroundColor: getColor('primary'),
  },
  pollOptionDetail: {
    flex: 1,
  },
  pollContainer: {
    marginTop: 15,
  },
});
