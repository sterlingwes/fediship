import {useState} from 'react';
import {TAccount, TPeerInfo, TProfileResult, TStatus, TThread} from './types';
import {useMount} from './utils/hooks';
import {getPeerStorageKeys, savePeerInfo} from './screens/explore/peer-storage';
import {useMyMastodonInstance, useRemoteMastodonInstance} from './api/hooks';
import {parseStatusUrl} from './api/api.utils';
import {MastodonApiClient} from './api/mastodon';

export const useFollowers = () => {
  const api = useMyMastodonInstance();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<TAccount[]>([]);
  const [nextPage, setNextPage] = useState<string | false>();

  const fetchFollowers = async (reset?: boolean) => {
    if (nextPage === false || loading) {
      return;
    }

    setLoading(true);
    try {
      const result = await api.getFollowers(nextPage);
      if (reset) {
        setAccounts(result.list);
      } else {
        setAccounts([...accounts, ...result.list]);
      }
      setNextPage(result?.pageInfo?.next ?? false);
    } catch (e: unknown) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const reloadFollowers = () => {
    setNextPage(undefined);
    return fetchFollowers(true);
  };

  useMount(() => {
    fetchFollowers(true);
  });

  return {accounts, fetchFollowers, reloadFollowers, error, loading};
};

export const getPeerInfo = async (peer: string) => {
  try {
    const abortControl = new AbortController();
    const abortTimeout = setTimeout(() => abortControl.abort(), 2500);
    const response = await fetch(`https://${peer}/api/v1/instance`, {
      signal: abortControl.signal,
    });
    clearTimeout(abortTimeout);
    const json = await response.json();
    return json as TPeerInfo;
  } catch {
    return null;
  }
};

export const getPeerInfos = async (
  peers: string[],
  updateProgress: (count: number, of: number) => void,
  savePeer: (peer: string, info: TPeerInfo | null) => void,
) => {
  let fetchCount = 0;
  const existingPeerInfo = getPeerStorageKeys();
  const filteredPeers = peers.filter(
    peer => existingPeerInfo.includes(peer) === false,
  );
  return filteredPeers.reduce(async (chain, peer) => {
    await chain;
    const result = await getPeerInfo(peer);
    fetchCount++;
    updateProgress(fetchCount, filteredPeers.length);
    savePeer(peer, result);
  }, Promise.resolve() as unknown);
};

export const usePeers = () => {
  const api = useMyMastodonInstance();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [peers, setPeers] = useState<string[]>([]);
  const [peerInfoFetchProgress, setProgress] = useState(0);
  const [peersToFetch, setPeersToFetch] = useState(0);

  const progressCallback = (count: number, total: number) => {
    setProgress(count);
    if (total !== peersToFetch) {
      setPeersToFetch(total);
    }
  };

  const fetchPeers = async () => {
    setLoading(true);
    try {
      const peerList = await api.getInstancePeers();
      setPeers(peerList);
      await getPeerInfos(peerList, progressCallback, savePeerInfo);
    } catch (e: unknown) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  let progressMessage = '';
  if (loading) {
    if (peersToFetch) {
      progressMessage = `Found ${peersToFetch} new peer instances`;
    } else {
      progressMessage = 'Fetching peers...';
    }

    if (peerInfoFetchProgress) {
      progressMessage = `Fetching peer info ${peerInfoFetchProgress} of ${peersToFetch}`;
    }
  }

  return {peers, fetchPeers, error, loading, progressMessage};
};

export const useTimeline = (timeline: 'home' | 'public') => {
  const api = useMyMastodonInstance();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statuses, setStatuses] = useState<TStatus[]>([]);
  const [nextPage, setNextPage] = useState<string | false>();

  const fetchTimeline = async (reset?: boolean) => {
    if (nextPage === false || loading) {
      return;
    }

    setLoading(true);
    try {
      const result = await api.getTimeline(timeline, nextPage);
      if (reset) {
        setStatuses(result.list);
      } else {
        setStatuses(statuses.concat(result.list));
      }
      setNextPage(result?.pageInfo?.next ?? false);
    } catch (e: unknown) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const reloadTimeline = () => {
    setNextPage(undefined);
    return fetchTimeline(true);
  };

  useMount(() => {
    fetchTimeline(true);
  });

  const loadingMore = !!nextPage && loading;

  return {statuses, fetchTimeline, reloadTimeline, error, loading, loadingMore};
};

const getProfileByStatusUrl = async (
  url: string,
  getRemoteInstance: (host: string) => MastodonApiClient,
) => {
  const {host, statusId} = parseStatusUrl(url);
  if (!host || !statusId) {
    return;
  }
  const api = getRemoteInstance(host);
  const statusDetail = await api.getStatus(statusId);
  if (!statusDetail) {
    return;
  }
  const accountId = statusDetail.account.id;
  return api.getProfile(accountId);
};

export const useProfile = (
  statusUrl: string | undefined,
  accountId: string | undefined,
) => {
  const api = useMyMastodonInstance();
  const getRemoteInstance = useRemoteMastodonInstance();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<TAccount>();
  const [statuses, setStatuses] = useState<TStatus[]>([]);

  const fetchTimeline = async () => {
    if (!statusUrl && !accountId) {
      setLoading(false);
      return;
    }

    if (profile) {
      setRefreshing(true);
    }
    setLoading(true);
    try {
      let result: TProfileResult | undefined;
      if (statusUrl) {
        result = await getProfileByStatusUrl(statusUrl, getRemoteInstance);
      }
      if (!result && accountId) {
        result = await api.getProfile(accountId);
      }
      if (!result) {
        setLoading(false);
        return;
      }
      setStatuses(result.timeline);
      setProfile(result.account);
    } catch (e: unknown) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useMount(() => {
    fetchTimeline();
  });

  return {profile, statuses, fetchTimeline, error, loading, refreshing};
};

export const useThread = (statusUrl: string, localId: string) => {
  const api = useMyMastodonInstance();
  const getRemoteMasto = useRemoteMastodonInstance();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thread, setThread] = useState<TThread>();

  const fetchThread = async () => {
    const {host, statusId} = parseStatusUrl(statusUrl);
    if (!host || !statusId) {
      throw new Error('Cannot fetch thread with missing host & statusId');
    }
    setLoading(true);
    try {
      const remoteResult = await getRemoteMasto(host).getThread(statusId, {
        skipTargetStatus: true,
      });

      if (remoteResult.type === 'error' && remoteResult.error) {
        setError(remoteResult.error);
        return;
      }

      const localResult = await api.getThread(localId);
      const localStatuses: Record<string, TStatus> = {};
      if (localResult.response) {
        const {ancestors, descendants} = localResult.response;
        [
          ...(localResult.response.status ? [localResult.response.status] : []),
          ...(ancestors ?? []),
          ...(descendants ?? []),
        ].forEach(status => {
          localStatuses[status.uri] = status;
        });
      }

      if (localResult.type === 'error' && localResult.error) {
        setError(localResult.error);
        return;
      }

      const result = {
        ...remoteResult,
        response: {
          ...remoteResult.response,
          status: localResult.response?.status,
          localStatuses,
        },
      };

      setThread(result.response);
    } catch (e: unknown) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useMount(() => {
    fetchThread();
  });

  return {thread, fetchThread, error, loading};
};
