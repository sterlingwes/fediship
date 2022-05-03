import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {TPoll} from '../types';

const widthPct = (value: number, total: number) =>
  `${Math.round((value / total) * 100) || 1}%`;

const VoteAmountLine = (props: {value: number; total: number}) => (
  <View style={styles.amountLineContainer}>
    <View
      style={[styles.amountLine, {width: widthPct(props.value, props.total)}]}
    />
  </View>
);

const PollOption = (props: TPoll['options'][0] & {total: number}) => (
  <View style={styles.pollOption}>
    <Text style={styles.pollText}>{props.title}</Text>
    <VoteAmountLine value={props.votes_count} total={props.total} />
  </View>
);

export const Poll = (props: TPoll) => {
  return (
    <View style={styles.pollContainer}>
      {props.options.map(option => (
        <PollOption {...option} total={props.votes_count} />
      ))}
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
    flexDirection: 'column',
  },
  pollText: {
    color: 'white',
  },
  pollContainer: {
    marginTop: 15,
  },
});
