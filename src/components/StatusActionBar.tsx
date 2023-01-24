import React, {useCallback, useMemo} from 'react';
import {Share, Platform} from 'react-native';
import {Show, useSelector} from '@legendapp/state/react';
import type {Observable} from '@legendapp/state';
import {screenWidth} from '../dimensions';
import {StyleCreator, ValidColor} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {Box} from './Box';
import {BookmarkIcon} from './icons/BookmarkIcon';
import {BoostIcon} from './icons/BoostIcon';
import {MessageIcon} from './icons/MessageIcon';
import {ShareBoxIcon} from './icons/ShareBoxIcon';
import {ShareGraphIcon} from './icons/ShareGraphIcon';
import {StarIcon} from './icons/StarIcon';
import {LoadingSpinner} from './LoadingSpinner';
import {Type} from './Type';

const IconButton = ({
  type,
  loading,
  detailed,
  count,
  active,
  onPress,
}: {
  type: 'boost' | 'bookmarkOrReplies' | 'favouriteOrShare';
  loading?: Observable<boolean>;
  detailed?: boolean;
  count?: number;
  active?: Observable<boolean>;
  onPress: () => any;
}) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  const isActive = useSelector(() => active?.get() ?? false);

  let icon: JSX.Element | undefined;
  let iconColor: ValidColor = detailed ? 'primary' : 'blueAccent';
  let detailedIcon: JSX.Element | undefined;

  if (isActive) {
    iconColor = 'success';
  }

  const commonIconProps = useMemo(
    () => ({
      color: getColor('blueAccent'),
      width: 20,
      height: 20,
    }),
    [getColor],
  );

  switch (type) {
    case 'boost':
      icon = (
        <BoostIcon
          {...commonIconProps}
          color={getColor(iconColor)}
          onPress={onPress}
        />
      );
      break;
    case 'bookmarkOrReplies':
      icon = (
        <BookmarkIcon
          {...commonIconProps}
          stroke={getColor(iconColor)}
          onPress={onPress}
        />
      );

      detailedIcon = (
        <MessageIcon {...commonIconProps} color={getColor('primary')} />
      );
      break;
    case 'favouriteOrShare':
      icon =
        Platform.OS === 'ios' ? (
          <ShareBoxIcon {...commonIconProps} onPress={onPress} />
        ) : (
          <ShareGraphIcon {...commonIconProps} onPress={onPress} />
        );

      detailedIcon = (
        <StarIcon {...commonIconProps} stroke={getColor('primary')} />
      );
      break;
    default:
    //
  }

  return (
    <Box fd="row" style={[styles.statsBox, detailed && styles.statsBoxEqual]}>
      <Show
        if={() => loading}
        else={detailed && detailedIcon ? detailedIcon : icon}>
        <LoadingSpinner />
      </Show>
      {detailed && typeof count === 'number' && (
        <Box ml={6}>
          <Type scale="XS">{count}</Type>
        </Box>
      )}
    </Box>
  );
};

export const StatusActionBar = ({
  detailed,
  reblogged,
  reblogCount,
  favouriteCount,
  replyCount,
  bookmarked,
  loadingBookmark,
  loadingReblog,
  shareUrl,
  hasMedia,
  onReblog,
  onBookmark,
}: {
  detailed: boolean | undefined;
  reblogged: Observable<boolean>;
  reblogCount: number | undefined;
  replyCount: number | undefined;
  favouriteCount: number | undefined;
  bookmarked: Observable<boolean>;
  loadingBookmark: Observable<boolean>;
  loadingReblog: Observable<boolean>;
  shareUrl: string;
  hasMedia?: boolean;
  onReblog?: () => void;
  onBookmark: () => void;
}) => {
  const onShare = useCallback(() => {
    Share.share({url: shareUrl});
  }, [shareUrl]);

  return (
    <Box mb={10} pt={detailed ? 10 : hasMedia ? 10 : 0} fd="row" f={1}>
      {onReblog && (
        <IconButton
          type="boost"
          onPress={onReblog}
          active={reblogged}
          loading={loadingReblog}
          detailed={detailed}
          count={reblogCount}
        />
      )}
      <IconButton
        type="favouriteOrShare"
        onPress={onShare}
        detailed={detailed}
        count={favouriteCount}
      />
      <IconButton
        type="bookmarkOrReplies"
        onPress={onBookmark}
        active={bookmarked}
        loading={loadingBookmark}
        detailed={detailed}
        count={replyCount}
      />
    </Box>
  );
};

const styleCreator: StyleCreator = () => ({
  statsBox: {
    justifyContent: 'center',
    minWidth: 80,
    paddingBottom: 4,
  },
  statsBoxEqual: {
    minWidth: screenWidth / 3,
  },
});
