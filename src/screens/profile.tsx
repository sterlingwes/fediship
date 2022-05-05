import {NavigationProp, useNavigation} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {
  RefreshControl,
  FlatList,
  ListRenderItem,
  View,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useProfile} from '../api';
import {AvatarImage} from '../components/AvatarImage';
import {BackButton} from '../components/BackButton';
import {HTMLView} from '../components/HTMLView';
import {Status} from '../components/Status';
import {Type} from '../components/Type';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {RootStackParamList, TAccount, TStatus} from '../types';

interface ProfileHeaderProps {
  profile: TAccount | undefined;
}

const instanceHostName = (url: string) => {
  const [, , host] = url.split('/');
  return host;
};

const ProfileHeader = (props: ProfileHeaderProps) => {
  const {top} = useSafeAreaInsets();
  const styles = useThemeStyle(styleCreator);
  const navigation = useNavigation();

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
      <Image
        source={{uri: props.profile.header}}
        style={styles.headerBgImage}
      />
      <View style={styles.headerBio}>
        <AvatarImage uri={props.profile.avatar} style={styles.headerAvatar} />
        <Type scale="L" semiBold style={styles.headerDisplayName}>
          {display_name}
        </Type>
        <Type scale="S" medium style={styles.headerUsername}>
          @{username}@{instanceHostName(url)}
        </Type>
        <HTMLView value={note} emojis={emojis} />
      </View>
      <BackButton
        onPress={() => navigation.goBack()}
        style={[styles.headerBackBtn, {top: top || 20}]}
      />
    </View>
  );
};

const createProfileTimelineRenderer =
  (navigation: NavigationProp<RootStackParamList>): ListRenderItem<TStatus> =>
  row => {
    const status = row.item;
    const nextStatusUrl = status.reblog ? status.reblog.url : status.url;
    return (
      <Status
        key={status.id}
        {...status}
        onPress={() => {
          navigation.navigate('Thread', {statusUrl: nextStatusUrl});
        }}
        onPressAvatar={account => {
          navigation.navigate('Profile', {
            statusUrl: nextStatusUrl,
            account,
          });
        }}
      />
    );
  };

export const Profile = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Profile'>) => {
  const {statusUrl, account} = route.params;
  const styles = useThemeStyle(styleCreator);
  const {profile, statuses, refreshing, fetchTimeline} = useProfile(statusUrl);

  const renderItem = useMemo(
    () => createProfileTimelineRenderer(navigation),
    [navigation],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={statuses}
        renderItem={renderItem}
        style={styles.container}
        contentInset={{bottom: 40}}
        ListHeaderComponent={() => (
          <ProfileHeader profile={profile ?? account} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchTimeline} />
        }
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
  },
  headerBackBtn: {
    position: 'absolute',
    left: 20,
  },
  headerBgImage: {
    flex: 1,
    minHeight: 170,
    resizeMode: 'cover',
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
});
