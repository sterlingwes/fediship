import {useCallback, useState} from 'react';
import {TSearchResults} from '../types';
import {useMount} from '../utils/hooks';
import {useMyMastodonInstance, useRemoteMastodonInstance} from './hooks';

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

export const useSearch = () => {
  const api = useMyMastodonInstance();
  const [searching, setSearching] = useState(false);
  const [searchResults, setResults] = useState<TSearchResults>();

  const search = useCallback(
    async (query: string) => {
      setSearching(true);
      const results = await api.search(query);
      if (results) {
        setResults(results);
      }
      setSearching(false);
    },
    [api, setResults],
  );

  return {search, searchResults, searching};
};
