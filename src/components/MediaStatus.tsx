import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useMemo, useState} from 'react';
import {Image, StyleSheet, Pressable, View} from 'react-native';
import {useMyMastodonInstance} from '../api/hooks';
import {useRecentFavourites} from '../storage/recent-favourites';

import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {Emoji, RootStackParamList, TAccount, TStatus} from '../types';
import {timeAgo} from '../utils/dates';
import {Box} from './Box';
import {EmojiName} from './EmojiName';
import {BookmarkIcon} from './icons/BookmarkIcon';
import {LockIcon} from './icons/LockIcon';
import {StarIcon} from './icons/StarIcon';
import {LoadingSpinner} from './LoadingSpinner';
import {MediaAttachments} from './MediaAttachments';
import {ReplyLine} from './ReplyLine';
import {RichText} from './RichText';
import {getType} from './status.util';
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

const PriorityAction = ({
  icon,
  active,
  loading,
  onPress,
}: {
  icon: 'bookmark' | 'favourite';
  active: boolean | undefined;
  loading: boolean;
  onPress: () => void;
}) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();

  const iconButton = useMemo(() => {
    switch (icon) {
      case 'favourite':
        return (
          <StarIcon
            width="18"
            height="18"
            stroke={active ? 'transparent' : getColor('baseAccent')}
            fill={active ? getColor('goldAccent') : undefined}
          />
        );
      case 'bookmark':
        return (
          <BookmarkIcon
            width="18"
            height="18"
            stroke={active ? 'transparent' : getColor('baseAccent')}
            fill={active ? getColor('goldAccent') : undefined}
          />
        );
    }
  }, [icon, getColor, active]);

  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={[styles.starButton, active && styles.starButtonFaved]}>
      {loading ? <LoadingSpinner /> : iconButton}
    </Pressable>
  );
};

export const MediaStatus = (
  props: TStatus & {
    isLocal: boolean;
    focused?: boolean;
    showDetail?: boolean;
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
  const {favourites, trackStatusFavourite, trackBookmark} =
    useRecentFavourites();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const mainStatus = props.reblog ? props.reblog : props;
  const recentFav = favourites[mainStatus.url ?? mainStatus.uri];
  const [faved, setFaved] = useState(mainStatus.favourited);
  const [bookmarked, setBookmarked] = useState(mainStatus.bookmarked);
  const favourited = recentFav || faved;
  const [loadingFav, setLoadingFav] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const styles = useThemeStyle(styleCreator);

  const onPressAvatar =
    typeof props.onPressAvatar === 'function'
      ? () => props.onPressAvatar!(mainStatus.account)
      : undefined;

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

  const [content, truncated] = useMemo(() => {
    const textChunks = mainStatus.content
      .replace(/^<p>/, '')
      .replace(/<\/p>$/, '')
      .split(/<\/p><p>/);

    let count = 0;
    const tooLongIndex = textChunks.findIndex(chunk => {
      count += chunk.length;
      if (count > 100) {
        return true;
      }
      return false;
    });

    console.log({textChunks, tooLongIndex, user: mainStatus.account.acct});

    if (tooLongIndex !== -1) {
      return [
        `<p>${textChunks.slice(0, tooLongIndex + 1).join('</p><p>')}</p>`,
        true,
      ];
    }

    return [mainStatus.content, false];
  }, [mainStatus.content]);

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
        <Box fd="row" f={1} pr={20} pl={15} mt={-6}>
          {props.isLocal && !props.showDetail && (
            <View style={styles.statusLeftButtons}>
              <ReplyLine
                stretch
                visible={props.lastStatus === false && props.hasReplies}
              />
              {props.isLocal && !props.showDetail && (
                <PriorityAction
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
                <Type scale="S" medium>
                  ⚠️ {mainStatus.spoiler_text}
                </Type>
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
          </Box>
        </Box>
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
  spoilerText: {
    color: getColor('baseTextColor'),
    marginBottom: 10,
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
