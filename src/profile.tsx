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
import {useProfile} from './api';
import {BackButton} from './components/BackButton';
import {HTMLView} from './components/HTMLView';
import {Status} from './components/Status';
import {Type} from './components/Type';
import {screenHeight} from './dimensions';
import {StyleCreator} from './theme';
import {useThemeStyle} from './theme/utils';
import {RootStackParamList, TAccount, TStatus} from './types';
import {useBackHandler} from './utils/hooks';

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
        <Image
          source={{uri: props.profile.avatar}}
          style={styles.headerAvatar}
        />
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
        style={[styles.headerBackBtn, {top}]}
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
        onPressAvatar={() => {
          navigation.navigate('Profile', {statusUrl: nextStatusUrl});
        }}
      />
    );
  };

export const Profile = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Profile'>) => {
  const {statusUrl} = route.params;
  const styles = useThemeStyle(styleCreator);
  const {profile, statuses, loading, fetchTimeline} = useProfile(statusUrl);

  useBackHandler(() => {
    navigation.navigate('Timeline');
    return true;
  });

  const renderItem = useMemo(
    () => createProfileTimelineRenderer(navigation),
    [navigation],
  );

  return (
    <View style={styles.container}>
      <ProfileHeader profile={profile} />
      <FlatList
        data={statuses}
        renderItem={renderItem}
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchTimeline} />
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
    minHeight: screenHeight / 2 - 50,
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
    width: 100,
    height: 100,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: getColor('secondary'),
    shadowColor: getColor('base'),
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
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
