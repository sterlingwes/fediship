import {formatDuration, intervalToDuration} from 'date-fns';
import React, {useState} from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';

import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {TMediaAttachment, TStatus} from '../types';
import {HTMLView} from './HTMLView';
import {Poll} from './Poll';
import {Type} from './Type';

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
  const styles = useThemeStyle(styleCreator);
  const [collapsed, setCollapsed] = useState(true);

  return (
    <View>
      <Type style={styles.spoilerText}>{props.spoiler_text}</Type>
      <TouchableOpacity
        onPress={() => setCollapsed(!collapsed)}
        style={styles.collapsedButton}>
        <Type style={styles.buttonLabel}>
          {collapsed ? 'Show more' : 'Show less'}
        </Type>
      </TouchableOpacity>
      {!collapsed && (
        <>
          <HTMLView emojis={props.emojis} value={props.content} />
          {props.poll && <Poll {...props.poll} />}
          {props.media_attachments && (
            <MediaAttachments media={props.media_attachments} />
          )}
        </>
      )}
    </View>
  );
};

const dimensProps = ({width, height}: TMediaAttachment['meta']['small']) => ({
  width,
  height,
});

const Media = (props: TMediaAttachment) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <View>
      {props.type === 'image' ? (
        <Image
          source={{uri: props.preview_url, ...dimensProps(props.meta.small)}}
          style={[
            styles.mediaImg,
            {
              ...dimensProps(props.meta.small),
              aspectRatio: props.meta.small.aspect,
            },
          ]}
        />
      ) : (
        <Type>?</Type>
      )}
    </View>
  );
};

export const MediaAttachments = (props: {media: TMediaAttachment[]}) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <View style={styles.media}>
      {props.media.map(attachment => (
        <Media key={attachment.id} {...attachment} />
      ))}
    </View>
  );
};

const timeAgo = (props: TStatus) => {
  const time = new Date(props.created_at);
  const duration = intervalToDuration({start: time, end: new Date()});
  return formatDuration(duration, {format: ['hours', 'minutes']});
};

export const Status = (
  props: TStatus & {onPress: () => void; onPressAvatar?: () => void},
) => {
  const styles = useThemeStyle(styleCreator);

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
            <>
              <HTMLView emojis={mainStatus.emojis} value={mainStatus.content} />
              {mainStatus.poll && <Poll {...mainStatus.poll} />}
              {mainStatus.media_attachments && (
                <MediaAttachments media={mainStatus.media_attachments} />
              )}
            </>
          )}

          <Type style={styles.statusUser} scale="XS">
            {timeAgo(props)} • @{mainStatus.account.username}({getType(props)})
          </Type>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    flex: 1,
    minHeight: 100,
  },
  textColor: {
    color: getColor('baseTextColor'),
  },
  emoji: {
    width: 20,
    height: 20,
  },
  media: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mediaImg: {
    resizeMode: 'cover',
    maxWidth: '100%',
  },
  collapsedButton: {
    borderColor: getColor('baseAccent'),
    borderWidth: 1,
    padding: 5,
    borderRadius: 2,
    width: '50%',
    marginVertical: 8,
  },
  buttonLabel: {
    color: getColor('baseTextColor'),
    textAlign: 'center',
  },
  spoilerText: {
    color: getColor('baseTextColor'),
  },
  statusContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingLeft: 15,
    borderBottomColor: getColor('baseAccent'),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statusUser: {
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
