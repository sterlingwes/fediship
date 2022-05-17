import {useState} from 'react';
import {useRemoteMastodonInstance} from '../../api/hooks';
import {MastodonApiClient} from '../../api/mastodon';
import {useMount} from '../../utils/hooks';

const getTags = async (api: MastodonApiClient) => {
  const trends = await api.getInstanceTrends();
  return trends.map(trend => trend.name);
};

export const usePeerTags = (host: string) => {
  const getRemote = useRemoteMastodonInstance();
  const [tags, setTags] = useState<string[]>([]);

  useMount(() => {
    const api = getRemote(host);
    getTags(api).then(setTags);
  });

  return {tags};
};
