import {useState} from 'react';
import {useMount} from '../utils/hooks';
import {useRemoteMastodonInstance} from './hooks';

export const useInstanceTrends = (host: string) => {
  const getApi = useRemoteMastodonInstance();
  const [loadingTags, setLoadingTags] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  useMount(() => {
    const fetchTrends = async () => {
      try {
        setLoadingTags(true);
        const tagTrends = await getApi(host).getInstanceTrends();
        const tagNames = tagTrends.map(trend => trend.name);
        setTags(tagNames);
      } catch (e) {
        console.warn('Could not load tags from instance');
      }
      setLoadingTags(false);
    };

    fetchTrends();
  });

  return {loadingTags, tags};
};
