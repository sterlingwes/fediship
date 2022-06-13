import React, {useState} from 'react';
import {RootStackParamList, TPeerInfo} from '../types';
import {useMount} from '../utils/hooks';
import {Pressable, ScrollView} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useThemeStyle} from '../theme/utils';
import {StyleCreator} from '../theme';
import {Type} from '../components/Type';
import {thousandsNumber} from '../utils/numbers';
import {AvatarImage} from '../components/AvatarImage';
import {useRemoteMastodonInstance} from '../api/hooks';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {useAuth} from '../storage/auth';
import {useInstanceTrends} from '../api/explore.hooks';
import {Box} from '../components/Box';
import {RichText} from '../components/RichText';

export const PeerProfile = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'PeerProfile'>) => {
  const auth = useAuth();
  const styles = useThemeStyle(styleCreator);
  const {host} = route.params;
  const getApi = useRemoteMastodonInstance();
  const [instanceInfo, setInstanceInfo] = useState<TPeerInfo>();
  const {tags, loadingTags} = useInstanceTrends(host);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useMount(() => {
    if (!route.params) {
      return;
    }

    const fetchInstanceProfile = async () => {
      const api = getApi(host);
      setLoading(true);
      let info: TPeerInfo | undefined;
      try {
        info = await api.getInstanceInfo();

        if (info) {
          setInstanceInfo(info);
        } else {
          setError('Failed to fetch instance info.');
        }
      } catch (e) {
        setError('This instance is unresponsive.');
      }
      setLoading(false);
    };

    fetchInstanceProfile();

    navigation.setOptions({headerTitle: host});
  });

  if (loading || loadingTags) {
    return (
      <Box mt={50} c>
        <LoadingSpinner />
      </Box>
    );
  }

  if (error || !instanceInfo) {
    return (
      <Box mt={20} mh={10}>
        <Type scale="S">{error}</Type>
      </Box>
    );
  }

  const {thumbnail, description, stats, languages} = instanceInfo;

  const onPressTag = (tag: string) => {
    navigation.push('TagTimeline', {host, tag});
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AvatarImage uri={thumbnail} style={styles.avatar} />
      <Box mt={20}>
        {auth.host === host && (
          <Type scale="S" semiBold>
            (you are here)
          </Type>
        )}
        <Type scale="S">Users: {thousandsNumber(stats.user_count)}</Type>
      </Box>
      <Box mv={10}>
        <Type scale="S">Statuses: {thousandsNumber(stats.status_count)}</Type>
      </Box>
      <Box mv={10}>
        <Type scale="S">Peers: {thousandsNumber(stats.domain_count)}</Type>
      </Box>
      <Box mt={20} mb={10}>
        <RichText
          emojis={[]}
          html={description}
          onMentionPress={profileParams =>
            navigation.push('Profile', profileParams)
          }
          onTagPress={tagParams => navigation.push('TagTimeline', tagParams)}
        />
      </Box>
      <Box mt={10} mb={30}>
        <Type scale="S">Languages: {languages.join(', ')}</Type>
      </Box>
      {!!tags.length && (
        <Box style={styles.trendBox} pt={30}>
          <Type scale="S" semiBold>
            Trending tags:
          </Type>
          <Box mv={10}>
            {tags.map(tag => (
              <Pressable style={styles.tagRow} onPress={() => onPressTag(tag)}>
                <Type
                  key={tag}
                  scale="S"
                  style={styles.tagLink}>{`#${tag}`}</Type>
              </Pressable>
            ))}
          </Box>
        </Box>
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
  tagRow: {
    marginVertical: 8,
  },
  tagLink: {
    color: getColor('primary'),
  },
  trendBox: {
    borderTopColor: getColor('baseHighlight'),
    borderTopWidth: 1,
  },
});
