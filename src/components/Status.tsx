import React, {useState} from 'react';
import {Image, StyleSheet, Pressable, View} from 'react-native';

import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {TAccount, TStatus} from '../types';
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
  username: string;
  sendDate: Date;
  tootTypeMessage: string;
  booster: string | undefined;
}

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
          {props.username}{' '}
          <Type scale="XS" style={styles.statusHeaderType}>
            {props.tootTypeMessage}
          </Type>
        </Type>
      </View>
      <Type scale="XS">{timeAgo(props.sendDate)}</Type>
    </View>
  );
};

export const Status = (
  props: TStatus & {
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

  return (
    <Pressable onPress={props.onPress} style={styles.container}>
      <View style={styles.statusContainer}>
        <Pressable onPress={onPressAvatar}>
          <Image
            source={{
              uri: mainStatus.account.avatar,
            }}
            style={styles.avatar}
          />
        </Pressable>
        <View style={styles.statusMessage}>
          <StatusHeader
            username={mainStatus.account.display_name}
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
});
