import React, {useMemo, useState} from 'react';
import {Image, StyleSheet, Pressable, View, ImageStyle} from 'react-native';
import {useMyMastodonInstance} from '../api/hooks';
import {useRecentFavourites} from '../storage/recent-favourites';

import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {Emoji, TAccount, TStatus} from '../types';
import {timeAgo} from '../utils/dates';
import {HTMLView} from './HTMLView';
import {ChevronInverted} from './icons/Chevron';
import {LockIcon} from './icons/LockIcon';
import {StarIcon} from './icons/StarIcon';
import {LoadingSpinner} from './LoadingSpinner';
import {MediaAttachments} from './MediaAttachments';
import {Poll} from './Poll';
import {ReplyLine} from './ReplyLine';
import {getType} from './status.util';
import {Type} from './Type';

const CollapsedStatus = (props: TStatus & {collapsed: boolean}) => {
  const styles = useThemeStyle(styleCreator);
  const spoilerText = (props.spoiler_text ?? '').trim();
  return (
    <View>
      {!!spoilerText && (
        <Type style={styles.spoilerText} scale="S">
          ⚠️ {props.spoiler_text}
        </Type>
      )}
      {!props.collapsed && (
        <>
          <HTMLView emojis={props.emojis ?? []} value={props.content} />
          {props.poll && <Poll {...props.poll} />}
          {props.media_attachments && (
            <MediaAttachments media={props.media_attachments} />
          )}
        </>
      )}
      {props.collapsed && <ViewMoreButton left={!spoilerText} />}
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
  pinned: boolean | undefined;
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
            <Type key={i} scale="S">
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
            {props.booster.replace(/\s?:[a-z]+:\s?/g, '')}{' '}
            <Type scale="XS" style={styles.statusHeaderType}>
              boosted
            </Type>
          </Type>
        )}
        {props.pinned && (
          <Type
            scale="XS"
            semiBold
            style={styles.statusHeaderBooster}
            numberOfLines={1}>
            📌 Pinned
          </Type>
        )}
        <Type scale="S" semiBold numberOfLines={1}>
          <EmojiName
            name={props.displayName || props.username || ''}
            emojis={props.userEmojis}
          />{' '}
          <Type scale="S" style={styles.statusHeaderType}>
            {props.tootTypeMessage}
          </Type>
        </Type>
      </View>
      <Type scale="XS">{timeAgo(props.sendDate)}</Type>
    </View>
  );
};

const ViewMoreButton = ({left}: {left?: boolean}) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  return (
    <View style={[styles.viewMore, left && styles.viewMoreLeft]}>
      <Type scale="XS" semiBold style={styles.viewMoreText}>
        View More
      </Type>
      <ChevronInverted color={getColor('primary')} width="18" />
    </View>
  );
};

const lockIconWidth = 18;

const AvatarLock = () => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  return (
    <View style={styles.avatarLock}>
      <LockIcon
        width={lockIconWidth + ''}
        height={lockIconWidth + ''}
        color={getColor('primary')}
      />
    </View>
  );
};

export const Status = (
  props: TStatus & {
    isLocal: boolean;
    focused?: boolean;
    hasReplies?: boolean;
    lastStatus?: boolean;
    collapsed?: boolean;
    onPress: () => void;
    onPressAvatar?: (account: TAccount) => void;
  },
) => {
  const api = useMyMastodonInstance();
  const {favourites, trackStatusFavourite} = useRecentFavourites();
  const mainStatus = props.reblog ? props.reblog : props;
  const recentFav = favourites[mainStatus.url ?? mainStatus.uri];
  const [faved, setFaved] = useState(mainStatus.favourited);
  const favourited = recentFav || faved;
  const [loadingFav, setLoadingFav] = useState(false);
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();

  const onPressAvatar =
    typeof props.onPressAvatar === 'function'
      ? () => props.onPressAvatar!(mainStatus.account)
      : undefined;

  const replying = !!props.in_reply_to_id;

  const onFavourite = async () => {
    setLoadingFav(true);
    const success = faved
      ? await api.unfavourite(mainStatus.id)
      : await api.favourite(mainStatus.id);
    if (success) {
      trackStatusFavourite(mainStatus.url ?? mainStatus.uri, !faved);
      setFaved(!faved);
    }
    setLoadingFav(false);
  };

  const [content, truncated] = useMemo(() => {
    const plainText = (mainStatus.content ?? '').replace(/<\/?[^<>]+>/g, '');

    if (props.focused) {
      return [mainStatus.content, false];
    }

    if (plainText.length < 500) {
      return [mainStatus.content, false];
    }

    return [mainStatus.content.slice(0, 500) + '...', true];
  }, [mainStatus.content, props.focused]);

  const emojis = useMemo(
    () => [...(mainStatus.emojis ?? []), ...(mainStatus.account.emojis ?? [])],
    [mainStatus],
  );

  return (
    <Pressable onPress={props.onPress} style={styles.container}>
      <View
        style={[
          styles.statusContainer,
          props.lastStatus !== false && styles.statusThreadTerminated,
          props.focused && styles.statusFocused,
        ]}>
        <View style={styles.statusLeftColumn}>
          <ReplyLine
            height={15}
            visible={replying}
            style={styles.replyLineLeader}
          />
          <Pressable onPress={onPressAvatar}>
            <Image
              source={{
                uri: mainStatus.account.avatar,
              }}
              style={[styles.avatar, props.focused && styles.avatarFocused]}
            />
            {mainStatus.account.locked && <AvatarLock />}
          </Pressable>
          <View style={styles.statusLeftButtons}>
            <ReplyLine
              stretch
              visible={
                props.hasReplies || (replying && props.lastStatus === false)
              }
            />
            {props.isLocal && (
              <Pressable
                disabled={loadingFav}
                onPress={onFavourite}
                style={[
                  styles.starButton,
                  favourited && styles.starButtonFaved,
                ]}>
                {loadingFav ? (
                  <LoadingSpinner />
                ) : (
                  <StarIcon
                    width="18"
                    height="18"
                    stroke={favourited ? 'transparent' : getColor('baseAccent')}
                    fill={favourited ? getColor('goldAccent') : undefined}
                  />
                )}
              </Pressable>
            )}
          </View>
        </View>
        <View style={styles.statusMessage}>
          <StatusHeader
            username={mainStatus.account.username || mainStatus.account.acct}
            displayName={mainStatus.account.display_name}
            userEmojis={mainStatus.account.emojis}
            sendDate={new Date(mainStatus.created_at)}
            tootTypeMessage={getType(mainStatus)}
            booster={props.reblog ? props.account.display_name : undefined}
            pinned={props.pinned}
          />
          {mainStatus.sensitive ? (
            <CollapsedStatus
              {...mainStatus}
              collapsed={props.collapsed ?? true}
            />
          ) : (
            <>
              <HTMLView emojis={emojis} value={content} />
              {!truncated && (
                <>
                  {mainStatus.poll && <Poll {...mainStatus.poll} />}
                  {mainStatus.media_attachments && (
                    <MediaAttachments media={mainStatus.media_attachments} />
                  )}
                </>
              )}
            </>
          )}
          {!mainStatus.sensitive && truncated && <ViewMoreButton />}
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
    marginBottom: 10,
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
    backgroundColor: getColor('baseAccent'),
  },
  avatarLock: {
    position: 'absolute',
    bottom: -8,
    right: 8,
    backgroundColor: getColor('base'),
    borderRadius: lockIconWidth,
    padding: 4,
    opacity: 0.9,
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
  statusLeftButtons: {
    flex: 1,
    alignItems: 'center',
    marginRight: 15,
    minHeight: 50,
  },
  starButton: {
    position: 'absolute',
    top: 8,
    padding: 4,
    backgroundColor: getColor('base'),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: getColor('baseAccent'),
  },
  starButtonFaved: {
    borderColor: getColor('goldAccent'),
  },
  replyLineLeader: {
    marginRight: 15,
  },
  viewMore: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  viewMoreLeft: {
    justifyContent: 'flex-start',
  },
  viewMoreText: {
    marginRight: 2,
    marginBottom: 1,
    color: getColor('primary'),
  },
});
