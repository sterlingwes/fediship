import React, {useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import HTMLView from 'react-native-htmlview';
import {TStatus} from '../types';
import {Poll} from './Poll';

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

const CollapsedStatus = (props: TStatus) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <View>
      <Text style={styles.spoilerText}>{props.spoiler_text}</Text>
      <TouchableOpacity
        onPress={() => setCollapsed(!collapsed)}
        style={styles.collapsedButton}>
        <Text style={styles.buttonLabel}>
          {collapsed ? 'Show more' : 'Show less'}
        </Text>
      </TouchableOpacity>
      {!collapsed && <HTMLView value={props.content} stylesheet={nodeStyles} />}
    </View>
  );
};

export const Status = (
  props: TStatus & {onPress: () => void; onPressAvatar?: () => void},
) => {
  return (
    <TouchableOpacity onPress={props.onPress} style={styles.container}>
      <View style={styles.statusContainer}>
        <TouchableOpacity onPress={props.onPressAvatar}>
          <Image
            source={{
              uri: props.reblog
                ? props.reblog.account.avatar
                : props.account.avatar,
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <View style={styles.statusMessage}>
          {props.sensitive ? (
            <CollapsedStatus {...props} />
          ) : (
            <HTMLView value={props.content} stylesheet={nodeStyles} />
          )}
          {props.poll && <Poll {...props.poll} />}
          {props.reblog && props.reblog.poll && <Poll {...props.reblog.poll} />}
          <Text style={styles.statusUser}>
            @
            {props.reblog
              ? props.reblog.account.username
              : props.account.username}
            ({getType(props)})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 100,
  },
  collapsedButton: {
    backgroundColor: 'black',
    padding: 5,
    borderRadius: 2,
    width: '50%',
    marginVertical: 8,
  },
  buttonLabel: {
    color: 'grey',
    textAlign: 'center',
  },
  spoilerText: {
    color: 'white',
  },
  statusContainer: {
    flex: 1,
    flexDirection: 'row',
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
  avatar: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
    marginRight: 15,
    marginTop: 5,
    borderRadius: 5,
  },
  statusMessage: {
    flex: 1,
  },
});
