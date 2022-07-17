import {useCallback, useState} from 'react';
import {TSearchResults} from '../types';
import {useMount} from '../utils/hooks';
import {
  useMyMastodonInstance,
  useRemoteActivityPubInstance,
  useRemoteMastodonInstance,
} from './hooks';

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

const specificAccountSearch = (term: string) =>
  term.trim().split(/[@.]/).length >= 3 && term.trim().includes(' ') === false;

export const useSearch = () => {
  const api = useMyMastodonInstance();
  const getRemoteApi = useRemoteActivityPubInstance();
  const [searching, setSearching] = useState(false);
  const [searchResults, setResults] = useState<TSearchResults>();

  const search = useCallback(
    async (query: string) => {
      setSearching(true);
      if (specificAccountSearch(query)) {
        const [handle, host] = query.trim().split('@');
        const remoteApi = getRemoteApi(host);
        const accountResponse = await remoteApi.getAccountByHandle(
          host,
          handle,
        );
        if (accountResponse.ok) {
          setResults({
            accounts: [accountResponse.account!],
            statuses: [],
            hashtags: [],
          });
          setSearching(false);
          return;
        }
      }
      const results = await api.search(query);
      if (results) {
        setResults(results);
      }
      setSearching(false);
    },
    [api, setResults, getRemoteApi],
  );

  const clearResults = useCallback(() => {
    setResults(undefined);
  }, [setResults]);

  return {search, clearResults, searchResults, searching};
};
