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
  ActivityIndicator,
  Image,
} from 'react-native';
import {AvatarImage} from '../components/AvatarImage';
import {EmptyList} from '../components/EmptyList';
import {FloatingHeader} from '../components/FloatingHeader';
import {HTMLView} from '../components/HTMLView';
import {SolidButton} from '../components/SolidButton';
import {Status} from '../components/Status';
import {Type} from '../components/Type';
import {screenHeight} from '../dimensions';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {RootStackParamList, TAccount, TStatus} from '../types';
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
  const styles = useThemeStyle(styleCreator);

  useEffect(() => {
    if (!profileImages.avatar && props.profile?.avatar) {
      setImages({header: props.profile.header, avatar: props.profile.avatar});
    }
  }, [props.profile, profileImages]);

  if (!props.profile) {
    return (
      <View style={[styles.header, styles.centered]}>
        <ActivityIndicator />
      </View>
    );
  }

  const {display_name, note, emojis, username, url} = props.profile;

  return (
    <View style={styles.header}>
      {profileImages.header ? (
        <Image
          source={{uri: profileImages.header}}
          style={styles.headerBgImage}
        />
      ) : (
        <View style={styles.headerSpacer} />
      )}
      <View style={styles.headerBio}>
        {profileImages.avatar && (
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
        <View style={styles.headerDisplayName}>
          <HTMLView value={display_name} emojis={emojis} />
        </View>
        <Type scale="S" medium style={styles.headerUsername}>
          @{username}@{instanceHostName(url)}
        </Type>
        <HTMLView value={note} emojis={emojis} />
      </View>
    </View>
  );
};

const createProfileTimelineRenderer =
  (
    navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>,
  ): ListRenderItem<TStatus> =>
  row => {
    const status = row.item;
    const nextStatusUrl = status.reblog ? status.reblog.uri : status.uri;
    return (
      <Status
        isLocal={false}
        key={status.id}
        {...status}
        onPress={() => {
          navigation.push('Thread', {statusUrl: nextStatusUrl, id: status.id});
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
  error: string,
  host: string | undefined,
  account: TAccount | undefined,
) => {
  if (error.includes('Network request failed')) {
    return `Unable to reach ${
      host ?? instanceHostName(account?.url)
    } (this user's instance). Please try again later!`;
  }

  if (error.includes('not authorized')) {
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
  error: string;
  host: string | undefined;
  account?: TAccount | undefined;
  headerOpaque: boolean;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  showHeader?: boolean;
}) => {
  const styles = useThemeStyle(styleCreator);
  const message = errorMessage(error, host, account);
  return (
    <>
      <View style={[styles.container, styles.centered, {margin: 20}]}>
        {typeof message === 'string' ? <Type>{message}</Type> : message}
      </View>
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

export const Profile = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Profile'>) => {
  const initialLoad = useRef(true);
  const [headerOpaque, setHeaderOpaque] = useState(false);
  const {account, host, accountHandle, self} = route.params;
  const styles = useThemeStyle(styleCreator);
  const {
    error,
    profile,
    loading,
    statuses,
    refreshing,
    loadingMore,
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

  if (error && !account) {
    return (
      <ProfileError {...{error, host, headerOpaque, navigation}} showHeader />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={statuses}
        renderItem={renderItem}
        style={styles.container}
        contentInset={{bottom: 40}}
        onScroll={event => {
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
        ListEmptyComponent={() =>
          error ? (
            <ProfileError
              {...{error, host, account, headerOpaque, navigation}}
            />
          ) : (
            <EmptyList loading={loading} />
          )
        }
        onEndReached={fetchTimeline}
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
      {loadingMore && (
        <View style={styles.loadingMoreBar}>
          <Type scale="S" medium>
            Loading More...
          </Type>
        </View>
      )}
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
});
