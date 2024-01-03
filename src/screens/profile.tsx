import {useNavigation} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  RefreshControl,
  FlatList,
  ListRenderItem,
  View,
  Image,
  InteractionManager,
  ViewStyle,
} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

import {useErrorReporter} from '../api/worker.hooks';
import {AvatarImage} from '../components/AvatarImage';
import {Box} from '../components/Box';
import {EmojiName} from '../components/EmojiName';
import {EmptyList} from '../components/EmptyList';
import {FloatingHeader} from '../components/FloatingHeader';
import {CheckCircleIcon} from '../components/icons/CheckCircleIcon';
import {LockIcon} from '../components/icons/LockIcon';
import {InfoBanner} from '../components/InfoBanner';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {LoadMoreFooter} from '../components/LoadMoreFooter';
import {ReactiveStatus} from '../components/ReactiveStatus';
import {RichText} from '../components/RichText';
import {SolidButton} from '../components/SolidButton';
import {Type} from '../components/Type';
import {screenHeight} from '../dimensions';
import {getActiveApp, getActiveUserProfile} from '../storage/auth';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {
  Emoji,
  RootStackParamList,
  TAccount,
  TField,
  TStatusMapped,
} from '../types';
import {getUserFQNFromAccount} from '../utils/mastodon';
import {useAPProfile} from './profile/profilehooks';

interface ProfileHeaderProps {
  profile: TAccount | undefined;
  profileSource: 'local' | 'merged' | 'remote';
  apProfile: TAccount | undefined;
  following?: boolean | undefined;
  followToggleLoading?: boolean;
  onToggleFollow: () => any;
}

const instanceHostName = (url: string | undefined) => {
  if (!url) {
    return '?';
  }
  const [, , host] = url.split('/');
  return host;
};

interface ProfileImages {
  header?: string;
  avatar?: string;
}

const ProfileHeader = (props: ProfileHeaderProps) => {
  const [profileImages, setImages] = useState<ProfileImages>({
    header: props.profile?.header,
    avatar: props.profile?.avatar,
  });
  const fallbackHeaderPending = useRef<boolean>();
  const {getColor} = useThemeGetters();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const styles = useThemeStyle(styleCreator);

  const tryFallbackHeader = useCallback(() => {
    if (fallbackHeaderPending.current === false) {
      return;
    }

    if (
      profileImages.header &&
      props.apProfile?.header &&
      profileImages.header !== props.apProfile.header
    ) {
      setImages({...profileImages, header: props.apProfile.header});
      fallbackHeaderPending.current = false;
    } else if (fallbackHeaderPending.current == null) {
      fallbackHeaderPending.current = true;
    }
  }, [profileImages, props.apProfile]);

  useEffect(() => {
    if (!profileImages.avatar && props.profile?.avatar) {
      setImages({header: props.profile.header, avatar: props.profile.avatar});
    }

    if (fallbackHeaderPending.current && props.apProfile?.header) {
      fallbackHeaderPending.current = false;
      setImages({...profileImages, header: props.apProfile?.header});
    }
  }, [props.profile, props.apProfile, profileImages, fallbackHeaderPending]);

  if (!props.profile) {
    return (
      <View style={[styles.header, styles.centered]}>
        <LoadingSpinner />
      </View>
    );
  }

  const {display_name, note, emojis, username, url, bot} = props.profile;

  return (
    <>
      <View style={styles.header}>
        {!!profileImages.header ? (
          <Image
            source={{uri: profileImages.header}}
            style={styles.headerBgImage}
            onError={tryFallbackHeader}
          />
        ) : (
          <View style={styles.headerSpacer} />
        )}
        <View style={styles.headerBio}>
          {!!profileImages.avatar && (
            <AvatarImage
              uri={profileImages.avatar}
              style={styles.headerAvatar}
            />
          )}
          {typeof props.following === 'boolean' && (
            <SolidButton
              style={styles.followBtn}
              disabled={props.followToggleLoading}
              onPress={props.onToggleFollow}>
              {props.following ? 'Unfollow' : 'Follow'}
            </SolidButton>
          )}
          <View style={styles.approvalRequiredContainer}>
            {props.following === false && props.profile.locked && (
              <>
                <LockIcon
                  width="12"
                  height="12"
                  color={getColor('baseTextColor')}
                />
                <Type scale="XS" style={styles.approvalRequired}>
                  requires approval
                </Type>
              </>
            )}
          </View>
          <View style={styles.headerDisplayName}>
            <Type scale="S" numberOfLines={1}>
              <EmojiName name={display_name} emojis={emojis} />
            </Type>
          </View>
          <Type scale="S" medium style={styles.headerUsername}>
            {bot ? '🤖 ' : ''}@{username}@{instanceHostName(url)}
          </Type>
          <RichText
            emojis={emojis ?? []}
            html={note}
            onMentionPress={profileParams =>
              navigation.push('Profile', profileParams)
            }
            onTagPress={tagParams => navigation.push('TagTimeline', tagParams)}
          />
          <ProfileFields
            fields={props.profile.fields}
            emojis={props.profile.emojis}
          />
        </View>
      </View>
      {props.profileSource === 'local' && (
        <InfoBanner>
          This user's profile could not be retrieved from their instance so you
          may have a partial or stale view.
        </InfoBanner>
      )}
    </>
  );
};

const createProfileTimelineRenderer =
  (
    navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>,
    host: string | undefined,
    fromProfileAcct: string | undefined,
  ): ListRenderItem<string> =>
  row => {
    return (
      <ReactiveStatus
        statusId={row.item}
        host={host}
        fromProfileAcct={fromProfileAcct}
      />
    );
  };

const errorMessage = (
  error: Error,
  host: string | undefined,
  account: TAccount | undefined,
) => {
  if (error.message.includes('Network request failed')) {
    return `Unable to reach ${
      host ?? instanceHostName(account?.url)
    } (this user's instance). Please try again later!`;
  }

  if (error.message.includes('not authorized')) {
    const url = account ? account.url : `https://${host}`;
    return (
      <View>
        <Type style={{marginBottom: 10}} scale="L">
          Sorry :(
        </Type>
        <RichText
          emojis={[]}
          html={`<p>This user appears to be on an instance that uses "secure mode". To view their profile, please visit <a href="${url}">${url}</a></p>`}
        />
      </View>
    );
  }

  if (typeof error !== 'string') {
    return error.message;
  }

  return error;
};

const ProfileError = ({
  error,
  host,
  account,
  navigation,
  showHeader,
  headerStyle,
}: {
  error: Error;
  host: string | undefined;
  account?: TAccount | undefined;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  showHeader?: boolean;
  headerStyle?: ViewStyle;
}) => {
  const {loading, sent, sendErrorReport} = useErrorReporter();
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  const message = errorMessage(error, host, account);
  return (
    <>
      <Box m={20} style={[styles.container, styles.centered]}>
        <Box mv={10}>
          <Type semiBold color={getColor('error')}>
            Sorry, an error occurred.
          </Type>
        </Box>
        {typeof message === 'string' ? (
          <Type scale="S">{message}</Type>
        ) : (
          message
        )}
        <Box mv={20}>
          <SolidButton
            disabled={loading || sent}
            loading={loading}
            onPress={() =>
              sendErrorReport(error, {hasAccount: !!account, host})
            }>
            {sent ? 'Sent ✅' : 'Send Report'}
          </SolidButton>
        </Box>
      </Box>
      {showHeader && (
        <FloatingHeader
          {...{
            navigation,
            title: '',
            style: headerStyle,
          }}
        />
      )}
    </>
  );
};

const ProfileFields = ({
  fields,
  emojis,
}: {
  fields: TField[];
  emojis: Emoji[];
}) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();

  const hasVerified = useMemo(
    () => fields.find(f => !!f.verified_at),
    [fields],
  );

  if (!fields.length) {
    return null;
  }

  return (
    <Box mt={10} pt={15} style={styles.fieldsContainer}>
      {fields.map((field, i) => (
        <Box fd="row" mv={5} key={i}>
          <Box mr={10} f={1} style={{overflow: 'hidden'}} cv>
            <RichText emojis={emojis ?? []} html={field.name} />
          </Box>
          {hasVerified && (
            <Box style={{minWidth: 30}} cv>
              {field.verified_at && (
                <CheckCircleIcon
                  color={getColor('contrastTextColor')}
                  width={18}
                  height={18}
                />
              )}
            </Box>
          )}
          <Box mr={10} f={2} cv>
            <RichText emojis={emojis ?? []} html={field.value} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export const Profile = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Profile'>) => {
  const initialLoad = useRef(true);
  const scrollRef = useRef<FlatList<TStatusMapped> | null>();
  const scrollOffsetRef = useRef(0);
  const {account, self} = route.params;
  const styles = useThemeStyle(styleCreator);

  const {host, accountHandle} = useMemo(() => {
    if (
      !route.params.self ||
      (route.params.host && route.params.accountHandle)
    ) {
      return route.params;
    }
    const appHost = getActiveApp();
    const user = getActiveUserProfile();
    if (!user || !appHost) {
      console.error(
        'No active user profile or host is saved to view profile for',
      );
      return {accountHandle: user?.username, host: appHost};
    }
    const actorDetails = {
      host: appHost,
      accountHandle: user.username,
    } as {host?: string; accountHandle?: string};
    return actorDetails;
  }, [route.params]);

  const {
    error,
    profile,
    profileSource,
    loading,
    statusIds,
    refreshing,
    loadingMore,
    hasMore,
    fetchTimeline,
    fetchAccountAndTimeline,
    following,
    followLoading,
    onToggleFollow,
  } = useAPProfile(host, accountHandle, account);

  const fromProfileAcct = useMemo(() => {
    const userAccount = profile ?? account;
    if (!userAccount) {
      return `${accountHandle}@${host}`;
    }
    return getUserFQNFromAccount(userAccount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, account]);

  const renderItem = useMemo(
    () => createProfileTimelineRenderer(navigation, host, fromProfileAcct),
    [navigation, host, fromProfileAcct],
  );

  const headerComponent = useMemo(
    () => (
      <ProfileHeader
        profile={profile ?? account}
        profileSource={profileSource}
        apProfile={profile}
        following={self ? undefined : following}
        followToggleLoading={followLoading}
        onToggleFollow={onToggleFollow}
      />
    ),
    [
      self,
      profile,
      profileSource,
      account,
      following,
      followLoading,
      onToggleFollow,
    ],
  );

  useEffect(() => {
    if (initialLoad.current && !loading && profile && !statusIds.length) {
      initialLoad.current = false;
      fetchTimeline();
    }
  }, [initialLoad, loading, profile, statusIds, fetchTimeline]);

  const LoadFooter = useMemo(
    () => (
      <LoadMoreFooter
        noSafeArea={self}
        onPress={() =>
          fetchTimeline().then(() =>
            InteractionManager.runAfterInteractions(() => {
              setTimeout(() => {
                scrollRef.current?.scrollToOffset({
                  animated: true,
                  offset: scrollOffsetRef.current + 250,
                });
              }, 10);
            }),
          )
        }
        loading={loadingMore}
      />
    ),
    [fetchTimeline, loadingMore, scrollOffsetRef, scrollRef, self],
  );

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: e => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const animatedStyles = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [50, 250], [0, 1]);
    return {
      opacity,
    };
  });

  if (error && !account) {
    return (
      <ProfileError
        {...{error, host, headerStyle: animatedStyles, navigation}}
        showHeader
      />
    );
  }

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={statusIds}
        renderItem={renderItem}
        style={styles.container}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={statusIds.length && hasMore ? LoadFooter : null}
        ListEmptyComponent={() =>
          error ? (
            <ProfileError
              {...{
                error,
                host,
                headerStyle: animatedStyles,
                account,
                navigation,
              }}
            />
          ) : (
            <EmptyList loading={loading} />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchAccountAndTimeline}
          />
        }
      />
      <FloatingHeader
        {...{
          navigation,
          title: accountHandle ?? account?.acct,
          style: animatedStyles,
        }}
      />
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    overflow: 'hidden',
    backgroundColor: getColor('baseHighlight'),
    minHeight: screenHeight / 3,
  },
  headerBgImage: {
    flex: 1,
    minHeight: 170,
    resizeMode: 'cover',
  },
  headerSpacer: {
    minHeight: 140,
  },
  headerAvatar: {
    position: 'absolute',
    top: -50,
    left: 15,
  },
  headerDisplayName: {
    marginBottom: 5,
  },
  headerUsername: {
    marginBottom: 10,
  },
  headerBio: {
    padding: 15,
    paddingTop: 60,
  },
  followBtn: {
    position: 'absolute',
    right: 10,
  },
  loadingMoreBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 5,
    alignItems: 'center',
    backgroundColor: getColor('contrastTextColor'),
  },
  approvalRequiredContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: -8,
    minHeight: 20,
  },
  approvalRequired: {
    textAlign: 'right',
    marginLeft: 4,
  },
  fieldsContainer: {
    borderTopColor: getColor('baseHighlight'),
    borderTopWidth: 1,
  },
});
