import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useMemo, useRef} from 'react';
import {Image, StyleSheet, Pressable, View} from 'react-native';
import {useMyMastodonInstance} from '../api/hooks';
import {globalStatuses, globalStatusMeta} from '../api/status.state';

import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {Emoji, RootStackParamList, TAccount, TStatus} from '../types';
import {timeAgo} from '../utils/dates';
import {parseAccountUrl} from '../utils/strings';
import {Box} from './Box';
import {EmojiName} from './EmojiName';
import {LockIcon} from './icons/LockIcon';
import {StatusActionButton} from './icons/StatusActionButton';
import {MediaAttachments} from './MediaAttachments';
import {ReplyLine} from './ReplyLine';
import {RichText} from './RichText';
import {getType, getUsername, truncateHtmlText} from './status.util';
import {StatusActionBar} from './StatusActionBar';
import {StatusFavouritedByList} from './StatusFavouritedByList';
import {Type} from './Type';
import {ViewMoreButton} from './ViewMoreButton';

interface StatusHeaderProps {
  username: string | undefined;
  displayName: string | undefined;
  userEmojis: Emoji[] | undefined;
  sendDate: Date;
  tootTypeMessage: string;
  booster: string | undefined;
  pinned: boolean | undefined;
  avatar: string | undefined;
  locked: boolean;
  onPressAvatar: (() => void) | undefined;
}

const StatusHeader = (props: StatusHeaderProps) => {
  const styles = useThemeStyle(styleCreator);
  const {displayName, username} = props;
  return (
    <Box fd="row" f={1} mb={10} pr={20} pl={15} sb>
      <Pressable onPress={props.onPressAvatar} style={styles.avatar}>
        {!!props.avatar && (
          <Image
            source={{
              uri: props.avatar,
            }}
            style={[styles.avatar, styles.avatarImg]}
          />
        )}
        {props.locked && <AvatarLock />}
      </Pressable>
      <View style={styles.statusHeaderActorsLabels}>
        {!!props.booster && (
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
            name={getUsername({displayName, username})}
            emojis={props.userEmojis}
          />{' '}
          <Type scale="S" style={styles.statusHeaderType}>
            {props.tootTypeMessage}
          </Type>
        </Type>
      </View>
      <Type scale="XS">{timeAgo(props.sendDate)}</Type>
    </Box>
  );
};

const lockIconWidth = 18;

const avatarWidth = 45;
const avatarRightMargin = 15;

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

export const MediaStatus = (
  props: TStatus & {
    isLocal: boolean;
    focused?: boolean;
    showDetail?: boolean;
    showFavouritedBy?: boolean;
    hasReplies?: boolean;
    lastStatus?: boolean;
    collapsed?: boolean;
    onPress: () => void;
    onPressAvatar?: (account: TAccount) => void;
    onPressBookmark?: () => void;
    onPressFavourite?: () => void;
  },
) => {
  const api = useMyMastodonInstance();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const mainStatus = props.reblog ? props.reblog : props;
  const statusUrl = mainStatus.url ?? mainStatus.uri;
  const lastId = useRef(mainStatus.uri);
  const {favourited, bookmarked, reblogged} = globalStatuses[statusUrl];
  const styles = useThemeStyle(styleCreator);

  const {loadingFav, loadingBookmark, loadingReblog} =
    globalStatusMeta[statusUrl];

  if (lastId.current !== mainStatus.uri) {
    lastId.current = mainStatus.uri;
  }

  const onPressAvatar =
    typeof props.onPressAvatar === 'function'
      ? () => props.onPressAvatar!(mainStatus.account)
      : undefined;

  const onFavourite = async () => {
    loadingFav.set(true);
    const success = favourited.peek()
      ? await api.unfavourite(mainStatus.id)
      : await api.favourite(mainStatus.id);
    if (success) {
      favourited.set(!favourited.peek());
    }
    loadingFav.set(false);
    props.onPressFavourite?.();
  };

  const onBookmark = async () => {
    loadingBookmark.set(true);
    const success = bookmarked
      ? await api.unbookmark(mainStatus.id)
      : await api.bookmark(mainStatus.id);
    if (success) {
      bookmarked.set(!bookmarked.peek());
    }
    loadingBookmark.set(false);
    props.onPressBookmark?.();
  };

  const priorityAction = props.onPressBookmark ? 'bookmark' : 'favourite';

  const [content, truncated] = useMemo(
    () =>
      truncateHtmlText({
        text: mainStatus.content,
        disable: (props.collapsed === false || props.focused) ?? false,
      }),
    [mainStatus.content, props.focused, props.collapsed],
  );

  const onPressFavAccount = (account: TAccount) => {
    const {host, accountHandle} = parseAccountUrl(account.url) ?? {};
    if (host && accountHandle) {
      navigation.push('Profile', {host, account, accountHandle});
    }
  };

  const emojis = useMemo(
    () => [...(mainStatus.emojis ?? []), ...(mainStatus.account.emojis ?? [])],
    [mainStatus],
  );

  return (
    <Pressable onPress={props.onPress} style={styles.container}>
      <Box
        pt={15}
        f={1}
        style={[
          props.lastStatus !== false && styles.statusThreadTerminated,
          props.focused && styles.statusFocused,
        ]}>
        <StatusHeader
          username={mainStatus.account.username || mainStatus.account.acct}
          displayName={mainStatus.account.display_name}
          userEmojis={mainStatus.account.emojis}
          sendDate={new Date(mainStatus.created_at)}
          tootTypeMessage={getType(mainStatus)}
          booster={props.reblog ? props.account.display_name : undefined}
          pinned={props.pinned}
          avatar={mainStatus.account.avatar}
          locked={mainStatus.account.locked}
          onPressAvatar={onPressAvatar}
        />
        {mainStatus.media_attachments && (
          <MediaAttachments media={mainStatus.media_attachments} large />
        )}
        <Box fd="row" f={1} pr={20} pl={15}>
          {props.isLocal && !props.showDetail && (
            <View style={styles.statusLeftButtons}>
              <ReplyLine
                stretch
                visible={props.lastStatus === false && props.hasReplies}
              />
              {props.isLocal && !props.showDetail && (
                <StatusActionButton
                  icon={priorityAction}
                  loading={
                    priorityAction === 'favourite'
                      ? loadingFav
                      : loadingBookmark
                  }
                  onPress={
                    priorityAction === 'favourite' ? onFavourite : onBookmark
                  }
                  active={
                    priorityAction === 'favourite' ? favourited : bookmarked
                  }
                />
              )}
            </View>
          )}
          <Box f={1} pt={10} pb={15}>
            {mainStatus.sensitive ||
              (!!mainStatus.spoiler_text && (
                <RichText
                  emojis={emojis}
                  html={`⚠️ ${mainStatus.spoiler_text}`}
                />
              ))}
            <RichText
              emojis={emojis}
              html={content}
              onMentionPress={({host, accountHandle}) =>
                navigation.push('Profile', {host, accountHandle})
              }
              onTagPress={({host, tag}) =>
                navigation.push('TagTimeline', {host, tag})
              }
            />
            {truncated && !!mainStatus.content && <ViewMoreButton />}
            {props.focused && props.isLocal && (
              <StatusActionBar
                {...{
                  detailed: false,
                  reblogged,
                  reblogCount: props.reblogs_count,
                  favouriteCount: props.favourites_count,
                  replyCount: props.replies_count,
                  loadingReblog,
                  shareUrl: mainStatus.url ?? mainStatus.uri,
                  bookmarked,
                  loadingBookmark,
                  onBookmark,
                  hasMedia: !!mainStatus.media_attachments?.length,
                }}
              />
            )}
            {props.focused && props.showFavouritedBy && props.isLocal && (
              <StatusFavouritedByList
                statusId={mainStatus.id}
                onPressAccount={onPressFavAccount}
              />
            )}
          </Box>
        </Box>
        {props.showDetail && props.isLocal && (
          <StatusActionBar
            detailed
            {...{
              reblogged,
              reblogCount: props.reblogs_count,
              favouriteCount: props.favourites_count,
              replyCount: props.replies_count,
              loadingReblog,
              shareUrl: mainStatus.url ?? mainStatus.uri,
              bookmarked,
              loadingBookmark,
              onBookmark,
            }}
          />
        )}
      </Box>
    </Pressable>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    flex: 1,
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
    width: avatarWidth,
    height: avatarWidth,
    marginRight: avatarRightMargin,
    borderRadius: 5,
    backgroundColor: getColor('baseAccent'),
  },
  avatarImg: {
    resizeMode: 'cover',
  },
  avatarLock: {
    position: 'absolute',
    bottom: -8,
    right: -4,
    backgroundColor: getColor('base'),
    borderRadius: lockIconWidth,
    padding: 4,
    opacity: 0.9,
  },
  avatarFocused: {
    borderWidth: 2,
    borderColor: getColor('secondary'),
  },

  statusHeaderActorsLabels: {
    flex: 1,
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
    alignItems: 'center',
    width: 60,
    marginRight: 15,
    minHeight: 50,
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
