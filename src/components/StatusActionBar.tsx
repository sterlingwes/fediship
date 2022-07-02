import React, {useMemo} from 'react';
import {Share, Platform} from 'react-native';
import {screenWidth} from '../dimensions';
import {StyleCreator} from '../theme';
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
  reblogged: boolean | undefined;
  reblogCount: number | undefined;
  replyCount: number | undefined;
  favouriteCount: number | undefined;
  bookmarked: boolean | undefined;
  loadingBookmark: boolean;
  loadingReblog: boolean;
  shareUrl: string;
  hasMedia?: boolean;
  onReblog?: () => void;
  onBookmark: () => void;
}) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();

  const commonIconProps = useMemo(
    () => ({
      color: getColor('blueAccent'),
      width: 20,
      height: 20,
    }),
    [getColor],
  );

  const onShare = () => {
    Share.share({url: shareUrl});
  };

  const boostIconColor = detailed
    ? 'primary'
    : reblogged
    ? 'success'
    : 'blueAccent';

  const bookmarkIconColor = detailed
    ? 'primary'
    : bookmarked
    ? 'success'
    : 'blueAccent';

  return (
    <Box mb={10} pt={detailed ? 10 : hasMedia ? 10 : 0} fd="row" f={1}>
      {onReblog && (
        <Box
          fd="row"
          style={[styles.statsBox, detailed && styles.statsBoxEqual]}>
          {loadingReblog ? (
            <LoadingSpinner />
          ) : (
            <BoostIcon
              {...commonIconProps}
              color={getColor(boostIconColor)}
              onPress={onReblog}
            />
          )}
          {detailed && typeof reblogCount === 'number' && (
            <Box ml={6}>
              <Type scale="XS">{reblogCount}</Type>
            </Box>
          )}
        </Box>
      )}
      <Box fd="row" style={[styles.statsBox, detailed && styles.statsBoxEqual]}>
        {detailed ? (
          <>
            <StarIcon {...commonIconProps} stroke={getColor('primary')} />
            {detailed && typeof favouriteCount === 'number' && (
              <Box ml={6}>
                <Type scale="XS">{favouriteCount}</Type>
              </Box>
            )}
          </>
        ) : Platform.OS === 'ios' ? (
          <ShareBoxIcon {...commonIconProps} onPress={onShare} />
        ) : (
          <ShareGraphIcon {...commonIconProps} onPress={onShare} />
        )}
      </Box>
      <Box fd="row" style={[styles.statsBox, detailed && styles.statsBoxEqual]}>
        {detailed ? (
          <>
            <MessageIcon {...commonIconProps} color={getColor('primary')} />
            {detailed && typeof replyCount === 'number' && (
              <Box ml={6}>
                <Type scale="XS">{replyCount}</Type>
              </Box>
            )}
          </>
        ) : loadingBookmark ? (
          <LoadingSpinner />
        ) : (
          <BookmarkIcon
            {...commonIconProps}
            stroke={getColor(bookmarkIconColor)}
            onPress={onBookmark}
          />
        )}
      </Box>
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
