import React, {useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import HTMLView, {HTMLViewNode} from 'react-native-htmlview';
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

const contentWithEmojis = (props: TStatus) =>
  props.emojis.reduce((content, emoji) => {
    return content.replace(
      `:${emoji.shortcode}:`,
      `<emoji src="${emoji.url}" />`,
    );
  }, props.content);

const renderNode = (node: HTMLViewNode) => {
  if (node.name === 'emoji') {
    return <Image source={{uri: node.attribs.src}} style={styles.emoji} />;
  }
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
      {!collapsed && (
        <HTMLView
          value={contentWithEmojis(props)}
          stylesheet={nodeStyles}
          renderNode={renderNode}
        />
      )}
    </View>
  );
};

export const Status = (
  props: TStatus & {onPress: () => void; onPressAvatar?: () => void},
) => {
  const mainStatus = props.reblog ? props.reblog : props;

  return (
    <TouchableOpacity onPress={props.onPress} style={styles.container}>
      <View style={styles.statusContainer}>
        <TouchableOpacity onPress={props.onPressAvatar}>
          <Image
            source={{
              uri: mainStatus.account.avatar,
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <View style={styles.statusMessage}>
          {mainStatus.sensitive ? (
            <CollapsedStatus {...mainStatus} />
          ) : (
            <HTMLView
              value={contentWithEmojis(mainStatus)}
              stylesheet={nodeStyles}
              renderNode={renderNode}
            />
          )}
          {mainStatus.poll && <Poll {...mainStatus.poll} />}
          <Text style={styles.statusUser}>
            @{mainStatus.account.username}({getType(props)})
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
  emoji: {
    width: 20,
    height: 20,
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
