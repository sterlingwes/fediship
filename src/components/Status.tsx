import React, {useMemo, useState} from 'react';
import {Image, StyleSheet, Pressable, View, ImageStyle} from 'react-native';

import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {Emoji, TAccount, TStatus} from '../types';
import {timeAgo} from '../utils/dates';
import {HTMLView} from './HTMLView';
import {MediaAttachments} from './MediaAttachments';
import {Poll} from './Poll';
import {Type} from './Type';

const getType = (props: TStatus) => {
  if (props.in_reply_to_id) {
    return 'replied';
  }
  if (props.reblog) {
    return 'boosted';
  }
  return '';
};

const CollapsedStatus = (props: TStatus) => {
  const styles = useThemeStyle(styleCreator);
  const [collapsed, setCollapsed] = useState(true);

  return (
    <View>
      <Type style={styles.spoilerText} scale="S">
        {props.spoiler_text}
      </Type>
      <Pressable
        onPress={() => setCollapsed(!collapsed)}
        style={styles.collapsedButton}>
        <Type style={styles.buttonLabel} scale="XS">
          {collapsed ? 'Show more' : 'Show less'}
        </Type>
      </Pressable>
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

interface StatusHeaderProps {
  username: string | undefined;
  displayName: string | undefined;
  userEmojis: Emoji[] | undefined;
  sendDate: Date;
  tootTypeMessage: string;
  booster: string | undefined;
}

const emojiImgStyle = {width: 15, height: 15} as ImageStyle;

const EmojiName = ({
  name,
  emojis,
}: {
  name: string;
  emojis: Emoji[] | undefined;
}) => {
  const splitParts = useMemo(() => {
    const emojiLookup = (emojis ?? []).reduce((acc, emoji) => {
      return {
        ...acc,
        [emoji.shortcode]: emoji,
      };
    }, {} as Record<string, Emoji>);
    return name.split(':').map(part => {
      const emojiMatch = emojiLookup[part];
      if (emojiMatch) {
        return emojiMatch;
      }
      return part;
    });
  }, [name, emojis]);

  return (
    <>
      {splitParts.map((part, i) => {
        if (typeof part === 'string') {
          return (
            <Type key={i} scale="XS">
              {part}
            </Type>
          );
        } else {
          return (
            <Image
              key={i}
              source={{uri: part.static_url}}
              style={emojiImgStyle}
            />
          );
        }
      })}
    </>
  );
};

const StatusHeader = (props: StatusHeaderProps) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <View style={styles.statusHeader}>
      <View style={styles.statusHeaderActorsLabels}>
        {props.booster && (
          <Type
            scale="XS"
            semiBold
            style={styles.statusHeaderBooster}
            numberOfLines={1}>
            {props.booster}{' '}
            <Type scale="XS" style={styles.statusHeaderType}>
              boosted
            </Type>
          </Type>
        )}
        <Type scale="XS" semiBold numberOfLines={1}>
          <EmojiName
            name={props.displayName || props.username || ''}
            emojis={props.userEmojis}
          />{' '}
          <Type scale="XS" style={styles.statusHeaderType}>
            {props.tootTypeMessage}
          </Type>
        </Type>
      </View>
      <Type scale="XS">{timeAgo(props.sendDate)}</Type>
    </View>
  );
};

const ReplyLine = ({
  stretch,
  height,
  visible,
}: {
  height?: number;
  stretch?: boolean;
  visible?: boolean;
}) => {
  const styles = useThemeStyle(styleCreator);

  return (
    <View
      style={[
        styles.replyLineContainer,
        stretch && styles.replyLineStretch,
        height && {height},
      ]}>
      {visible && <View style={styles.replyLine} />}
    </View>
  );
};

export const Status = (
  props: TStatus & {
    focused?: boolean;
    hasReplies?: boolean;
    lastStatus?: boolean;
    onPress: () => void;
    onPressAvatar?: (account: TAccount) => void;
  },
) => {
  const styles = useThemeStyle(styleCreator);

  const mainStatus = props.reblog ? props.reblog : props;
  const onPressAvatar =
    typeof props.onPressAvatar === 'function'
      ? () => props.onPressAvatar!(mainStatus.account)
      : undefined;

  const replying = props.hasReplies || !!props.in_reply_to_id;

  return (
    <Pressable onPress={props.onPress} style={styles.container}>
      <View
        style={[
          styles.statusContainer,
          props.lastStatus !== false && styles.statusThreadTerminated,
          props.focused && styles.statusFocused,
        ]}>
        <View style={styles.statusLeftColumn}>
          <ReplyLine height={15} visible={replying} />
          <Pressable onPress={onPressAvatar}>
            <Image
              source={{
                uri: mainStatus.account.avatar,
              }}
              style={[styles.avatar, props.focused && styles.avatarFocused]}
            />
          </Pressable>
          <ReplyLine stretch visible={replying && !props.lastStatus} />
        </View>
        <View style={styles.statusMessage}>
          <StatusHeader
            username={mainStatus.account.username || mainStatus.account.acct}
            displayName={mainStatus.account.display_name}
            userEmojis={mainStatus.account.emojis}
            sendDate={new Date(mainStatus.created_at)}
            tootTypeMessage={getType(mainStatus)}
            booster={props.reblog ? props.account.display_name : undefined}
          />
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
        </View>
      </View>
    </Pressable>
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
    paddingHorizontal: 20,
    paddingLeft: 15,
  },
  statusFocused: {
    backgroundColor: getColor('baseHighlight'),
  },
  statusThreadTerminated: {
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
    borderRadius: 5,
  },
  avatarFocused: {
    borderWidth: 2,
    borderColor: getColor('secondary'),
  },
  statusMessage: {
    flex: 1,
    paddingVertical: 10,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusHeaderActorsLabels: {
    paddingRight: 10,
  },
  statusHeaderType: {
    color: getColor('primary'),
  },
  statusHeaderBooster: {
    marginBottom: 4,
    color: getColor('primary'),
  },
  statusLeftColumn: {
    flexDirection: 'column',
  },
  replyLineContainer: {
    alignItems: 'center',
    paddingRight: 15,
  },
  replyLineStretch: {
    flex: 1,
  },
  replyLine: {
    width: StyleSheet.hairlineWidth,
    flex: 1,
    backgroundColor: getColor('baseAccent'),
  },
});
