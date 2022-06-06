import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  RefreshControl,
  FlatList,
  ListRenderItem,
  View,
  Image,
  InteractionManager,
} from 'react-native';
import {useErrorReporter} from '../api/worker.hooks';
import {AvatarImage} from '../components/AvatarImage';
import {Box} from '../components/Box';
import {EmojiName} from '../components/EmojiName';
import {EmptyList} from '../components/EmptyList';
import {FloatingHeader} from '../components/FloatingHeader';
import {HTMLView} from '../components/HTMLView';
import {CheckCircleIcon} from '../components/icons/CheckCircleIcon';
import {LockIcon} from '../components/icons/LockIcon';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {LoadMoreFooter} from '../components/LoadMoreFooter';
import {SolidButton} from '../components/SolidButton';
import {Status} from '../components/Status';
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
import {useAPProfile} from './profile/profilehooks';

interface ProfileHeaderProps {
  profile: TAccount | undefined;
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
  const {getColor} = useThemeGetters();
  const styles = useThemeStyle(styleCreator);

  useEffect(() => {
    if (!profileImages.avatar && props.profile?.avatar) {
      setImages({header: props.profile.header, avatar: props.profile.avatar});
    }
  }, [props.profile, profileImages]);

  if (!props.profile) {
    return (
      <View style={[styles.header, styles.centered]}>
        <LoadingSpinner />
      </View>
    );
  }

  const {display_name, note, emojis, username, url, bot} = props.profile;

  return (
    <View style={styles.header}>
      {!!profileImages.header ? (
        <Image
          source={{uri: profileImages.header}}
          style={styles.headerBgImage}
        />
      ) : (
        <View style={styles.headerSpacer} />
      )}
      <View style={styles.headerBio}>
        {!!profileImages.avatar && (
          <AvatarImage uri={profileImages.avatar} style={styles.headerAvatar} />
        )}
        {typeof props.following === 'boolean' && (
          <SolidButton
            style={styles.followBtn}
            disabled={props.followToggleLoading}
            onPress={props.onToggleFollow}>
            {props.following ? 'Unfollow' : 'Follow'}
          </SolidButton>
        )}
        {props.following === false && props.profile.locked && (
          <View style={styles.approvalRequiredContainer}>
            <LockIcon
              width="12"
              height="12"
              color={getColor('baseTextColor')}
            />
            <Type scale="XS" style={styles.approvalRequired}>
              requires approval
            </Type>
          </View>
        )}
        <View style={styles.headerDisplayName}>
          <Type scale="S" numberOfLines={1}>
            <EmojiName name={display_name} emojis={emojis} />
          </Type>
        </View>
        <Type scale="S" medium style={styles.headerUsername}>
          {bot ? '🤖 ' : ''}@{username}@{instanceHostName(url)}
        </Type>
        <HTMLView value={note} emojis={emojis} />
        <ProfileFields
          fields={props.profile.fields}
          emojis={props.profile.emojis}
        />
      </View>
    </View>
  );
};

const createProfileTimelineRenderer =
  (
    navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>,
  ): ListRenderItem<TStatusMapped> =>
  row => {
    const status = row.item;
    const nextStatusUrl = status.reblog ? status.reblog.uri : status.uri;
    const nextId = status.reblog ? status.reblog.id : status.id;
    return (
      <Status
        isLocal={false}
        key={status.id}
        {...status}
        onPress={() => {
          navigation.push('Thread', {statusUrl: nextStatusUrl, id: nextId});
        }}
        onPressAvatar={
          (/*account */) => {
            // TODO: re-enable when we enable profile boosts
          }
        }
      />
    );
  };

const headerOpacityVerticalBreakpoint = 120;

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
        <HTMLView
          value={`<p>This user appears to be on an instance that uses "secure mode". To view their profile, please visit <a href="${url}">${url}</a></p>`}
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
  headerOpaque,
  showHeader,
}: {
  error: Error;
  host: string | undefined;
  account?: TAccount | undefined;
  headerOpaque: boolean;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  showHeader?: boolean;
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
            transparent: !headerOpaque,
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
      {fields.map(field => (
        <Box fd="row" mv={5}>
          <Box mr={10} f={1} style={{overflow: 'hidden'}} cv>
            <HTMLView value={field.name} emojis={emojis} />
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
            <HTMLView value={field.value} emojis={emojis} />
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
  const [headerOpaque, setHeaderOpaque] = useState(false);
  const {account, self} = route.params;
  const styles = useThemeStyle(styleCreator);

  const {host, accountHandle} = useMemo(() => {
    if (!route.params.self) {
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
    loading,
    statuses,
    refreshing,
    loadingMore,
    hasMore,
    fetchTimeline,
    fetchAccountAndTimeline,
    following,
    followLoading,
    onToggleFollow,
  } = useAPProfile(host, accountHandle, account);

  const renderItem = useMemo(
    () => createProfileTimelineRenderer(navigation),
    [navigation],
  );

  const headerComponent = useMemo(
    () => (
      <ProfileHeader
        profile={profile ?? account}
        following={self ? undefined : following}
        followToggleLoading={followLoading}
        onToggleFollow={onToggleFollow}
      />
    ),
    [self, profile, account, following, followLoading, onToggleFollow],
  );

  useEffect(() => {
    if (initialLoad.current && !loading && profile && !statuses.length) {
      initialLoad.current = false;
      fetchTimeline();
    }
  }, [initialLoad, loading, profile, statuses, fetchTimeline]);

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

  if (error && !account) {
    return (
      <ProfileError {...{error, host, headerOpaque, navigation}} showHeader />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={ref => (scrollRef.current = ref)}
        data={statuses}
        renderItem={renderItem}
        style={styles.container}
        onScroll={event => {
          scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
          const aboveBreakpoint =
            event.nativeEvent.contentOffset.y <=
            headerOpacityVerticalBreakpoint;
          if (aboveBreakpoint && headerOpaque) {
            setHeaderOpaque(false);
          }
          if (aboveBreakpoint) {
            return;
          }
          if (headerOpaque) {
            return;
          }
          setHeaderOpaque(true);
        }}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={statuses.length && hasMore ? LoadFooter : null}
        ListEmptyComponent={() =>
          error ? (
            <ProfileError
              {...{error, host, account, headerOpaque, navigation}}
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
          title: '',
          transparent: !headerOpaque,
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
    backgroundColor: getColor('baseAccent'),
    minHeight: screenHeight / 3,
  },
  headerBgImage: {
    flex: 1,
    minHeight: 170,
    resizeMode: 'cover',
  },
  headerSpacer: {
    minHeight: 130,
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
