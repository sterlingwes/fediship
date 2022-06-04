import React, {useState} from 'react';
import {RootStackParamList, TPeerInfo} from '../types';
import {useMount} from '../utils/hooks';
import {Pressable, ScrollView, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useThemeStyle} from '../theme/utils';
import {StyleCreator} from '../theme';
import {Type} from '../components/Type';
import {thousandsNumber} from '../utils/numbers';
import {HTMLView} from '../components/HTMLView';
import {AvatarImage} from '../components/AvatarImage';
import {useRemoteMastodonInstance} from '../api/hooks';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {useAuth} from '../storage/auth';

export const PeerProfile = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'PeerProfile'>) => {
  const auth = useAuth();
  const styles = useThemeStyle(styleCreator);
  const {host} = route.params;
  const getApi = useRemoteMastodonInstance();
  const [instanceInfo, setInstanceInfo] = useState<TPeerInfo>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useMount(() => {
    if (!route.params) {
      return;
    }

    const fetchInstanceProfile = async () => {
      const api = getApi(host);
      setLoading(true);
      const info = await api.getInstanceInfo();
      if (info) {
        setInstanceInfo(info);
      } else {
        setError('Failed to fetch instance info.');
      }
      setLoading(false);
    };

    fetchInstanceProfile();

    navigation.setOptions({headerTitle: host});
  });

  if (loading) {
    return (
      <View style={{justifyContent: 'center', marginTop: 50}}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error || !instanceInfo) {
    return (
      <View style={{marginTop: 20, marginHorizontal: 10}}>
        <Type scale="S">{error}</Type>
      </View>
    );
  }

  const {thumbnail, description, stats, languages} = instanceInfo;
  const tags: string[] = [];

  const onPressTag = (tag: string) => {
    navigation.push('TagTimeline', {host, tag});
  };

  const Spacer = () => <View style={styles.spacer} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AvatarImage uri={thumbnail} style={styles.avatar} />
      <Spacer />
      <Spacer />
      {auth.host === host && (
        <>
          <Type scale="S" semiBold>
            (you are here)
          </Type>
          <Spacer />
        </>
      )}
      <Type scale="S">Users: {thousandsNumber(stats.user_count)}</Type>
      <Spacer />
      <Type scale="S">Statuses: {thousandsNumber(stats.status_count)}</Type>
      <Spacer />
      <Type scale="S">Peers: {thousandsNumber(stats.domain_count)}</Type>
      <Spacer />
      <Spacer />
      <HTMLView value={description} />
      <Spacer />
      <Type scale="S">Languages: {languages.join(', ')}</Type>
      <Spacer />
      <Spacer />
      <Spacer />
      {!!tags.length && (
        <>
          <Type scale="S">Trending tags:</Type>
          <View>
            {tags.map(tag => (
              <Pressable style={styles.tagRow} onPress={() => onPressTag(tag)}>
                <Type
                  key={tag}
                  scale="S"
                  style={styles.tagLink}>{`#${tag}`}</Type>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  spacer: {
    height: 10,
  },
  tagRow: {
    marginVertical: 8,
  },
  tagLink: {
    color: getColor('primary'),
  },
});
