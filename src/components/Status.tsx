import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import HTMLView from 'react-native-htmlview';
import {TStatus} from '../types';

const nodeStyles = {
  p: {color: 'white'},
  span: {color: 'white'},
};

const getType = (props: TStatus) => {
  if (props.in_reply_to_id) {
    return 'reply';
  }
  if (props.reblog) {
    return 'reblog';
  }
  return 'toot';
};

export const Status = (props: TStatus & {onPress: () => void}) => {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View style={styles.statusContainer}>
        <HTMLView value={props.content} stylesheet={nodeStyles} />
        <Text style={styles.statusUser}>
          @
          {props.reblog
            ? props.reblog.account.username
            : props.account.username}
          ({getType(props)})
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
  },
  statusUser: {
    color: 'grey',
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'right',
  },
});
