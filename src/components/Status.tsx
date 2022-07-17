import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useMemo, useRef, useState} from 'react';
import {Image, StyleSheet, Pressable, View} from 'react-native';
import {useMyMastodonInstance} from '../api/hooks';
import {useRecentFavourites} from '../storage/recent-favourites';
import {retrieveMediaStatusAllPref} from '../storage/settings/appearance';

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
import {MediaStatus} from './MediaStatus';
import {Poll} from './Poll';
import {ReplyLine} from './ReplyLine';
import {RichText} from './RichText';
import {getType, getUsername, truncateHtmlText} from './status.util';
import {StatusActionBar} from './StatusActionBar';
import {StatusFavouritedByList} from './StatusFavouritedByList';
import {Type} from './Type';
import {ViewMoreButton} from './ViewMoreButton';

const CollapsedStatus = (props: TStatus & {collapsed: boolean}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const spoilerText = (props.spoiler_text ?? '').trim();
  return (
    <View>
      {!!spoilerText && (
        <Box mb={10}>
          <RichText emojis={props.emojis ?? []} html={`${spoilerText}`} />
        </Box>
      )}
      {!props.collapsed && (
        <>
          <RichText
            emojis={props.emojis ?? []}
            html={props.content}
            onMentionPress={({host, accountHandle}) =>
              navigation.push('Profile', {host, accountHandle})
            }
            onTagPress={({host, tag}) =>
              navigation.push('TagTimeline', {host, tag})
            }
          />
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

const StatusHeader = (props: StatusHeaderProps) => {
  const styles = useThemeStyle(styleCreator);
  const {displayName, username} = props;
  return (
    <View style={styles.statusHeader}>
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
  const {
    favourites,
    reblogs,
    bookmarks,
    trackStatusFavourite,
    trackReblog,
    trackBookmark,
  } = useRecentFavourites();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const mainStatus = props.reblog ? props.reblog : props;
  const lastId = useRef(mainStatus.uri);
  const recentFav = favourites[mainStatus.url ?? mainStatus.uri];
  const recentReblog = reblogs[mainStatus.url ?? mainStatus.uri];
  const recentBookmark = bookmarks[mainStatus.url ?? mainStatus.uri];
  const [faved, setFaved] = useState(mainStatus.favourited);
  const [reblogged, setReblogged] = useState(mainStatus.reblogged);
  const [bookmarked, setBookmarked] = useState(mainStatus.bookmarked);
  const wasReblogged = recentReblog || reblogged;
  const wasBookmarked = recentBookmark || bookmarked;
  const [loadingFav, setLoadingFav] = useState(false);
  const [loadingReblog, setLoadingReblog] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const styles = useThemeStyle(styleCreator);

  if (lastId.current !== mainStatus.uri) {
    lastId.current = mainStatus.uri;
    setFaved(mainStatus.favourited || recentFav);
    setReblogged(mainStatus.reblogged);
    setBookmarked(mainStatus.bookmarked);
    setLoadingFav(false);
    setLoadingReblog(false);
    setLoadingBookmark(false);
  }

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
    props.onPressFavourite?.();
  };

  const onReblog = async () => {
    setLoadingReblog(true);
    const success = reblogged
      ? await api.unreblog(mainStatus.id)
      : await api.reblog(mainStatus.id);
    if (success) {
      trackReblog(mainStatus.url ?? mainStatus.uri, !reblogged);
      setReblogged(!reblogged);
    }
    setLoadingReblog(false);
  };

  const onBookmark = async () => {
    setLoadingBookmark(true);
    const success = bookmarked
      ? await api.unbookmark(mainStatus.id)
      : await api.bookmark(mainStatus.id);
    if (success) {
      trackBookmark(mainStatus.url ?? mainStatus.uri, !bookmarked);
      setBookmarked(!bookmarked);
    }
    setLoadingBookmark(false);
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

  if (retrieveMediaStatusAllPref() && mainStatus.media_attachments?.length) {
    return <MediaStatus {...props} />;
  }

  return (
    <Pressable onPress={props.onPress} style={styles.container}>
      <Box
        c
        style={[
          props.lastStatus !== false && styles.statusThreadTerminated,
          props.focused && styles.statusFocused,
        ]}>
        <View style={[styles.statusContainer]}>
          <View style={styles.statusLeftColumn}>
            <ReplyLine
              height={15}
              visible={replying}
              style={styles.replyLineLeader}
            />
            <Pressable onPress={onPressAvatar} style={styles.avatar}>
              {!!mainStatus.account.avatar && (
                <Image
                  source={{
                    uri: mainStatus.account.avatar,
                  }}
                  style={[
                    styles.avatar,
                    styles.avatarImg,
                    props.focused && styles.avatarFocused,
                  ]}
                />
              )}
              {mainStatus.account.locked && <AvatarLock />}
            </Pressable>
            <View style={styles.statusLeftButtons}>
              <ReplyLine
                stretch
                visible={
                  props.lastStatus === false && (props.hasReplies || replying)
                }
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
                  active={priorityAction === 'favourite' ? faved : bookmarked}
                />
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
            {props.focused && props.isLocal && (
              <StatusActionBar
                {...{
                  detailed: false,
                  reblogged: wasReblogged,
                  reblogCount: props.reblogs_count,
                  favouriteCount: props.favourites_count,
                  replyCount: props.replies_count,
                  onReblog,
                  loadingReblog,
                  shareUrl: mainStatus.url ?? mainStatus.uri,
                  bookmarked: wasBookmarked,
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
          </View>
        </View>
        {props.showDetail && props.isLocal && (
          <StatusActionBar
            detailed
            {...{
              reblogged: wasReblogged,
              reblogCount: props.reblogs_count,
              favouriteCount: props.favourites_count,
              replyCount: props.replies_count,
              onReblog,
              loadingReblog,
              shareUrl: mainStatus.url ?? mainStatus.uri,
              bookmarked: wasBookmarked,
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
    marginRight: 15,
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
  replyLineLeader: {
    marginRight: 15,
  },
});
