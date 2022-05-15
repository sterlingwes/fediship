import {useState} from 'react';
import {mastoBearerToken} from './constants';
import {TAccount, TPeerInfo, TStatus, TStatusContext, TThread} from './types';
import {useMount} from './utils/hooks';
import {getPeerStorageKeys, savePeerInfo} from './screens/explore/peer-storage';
import {useMyMastodonInstance} from './api/hooks';

const localBase = 'https://swj.io/api/v1';

/**
 * parses strings in the format of:
 * <https://swj.io/api/v1/accounts/2/following?max_id=6>; rel="next", <https://swj.io/api/v1/accounts/2/following?since_id=61>; rel="prev"
 */
const parseLink = (linkHeaderValue: string | undefined | null) => {
  if (!linkHeaderValue) {
    return {};
  }

  const parts = linkHeaderValue.split(/[<>,;\s]+/);
  parts.shift(); // blank string
  if (parts.length === 4) {
    const [next, , prev] = parts;
    return {
      next,
      prev,
    };
  }

  return {
    prev: parts[0],
  };
};

export const getFollowers = async (nextPage?: string | boolean) => {
  const url =
    typeof nextPage === 'string'
      ? nextPage
      : 'https://swj.io/api/v1/accounts/2/following';
  const response = await fetch(url, {
    headers: {Authorization: `Bearer ${mastoBearerToken}`},
  });
  const linkHeader = response.headers.get('link');
  const json = await response.json();
  return {
    followers: json,
    pageInfo: parseLink(linkHeader),
  };
};

export const useFollowers = () => {
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
      const result = await getFollowers(nextPage);
      if (reset) {
        setAccounts(result.followers);
      } else {
        setAccounts([...accounts, ...result.followers]);
      }
      setNextPage(result.pageInfo.next ?? false);
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

export const getPeers = async () => {
  const response = await fetch('https://swj.io/api/v1/instance/peers');
  const json = await response.json();
  return json as string[];
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
  const [loading, setLoading] = useState(true);
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
      const peerList = await getPeers();
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

  useMount(() => {
    fetchPeers();
  });

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

const parseStatusUrl = (url: string) => {
  const uriParts = url.split('/');
  const statusId = uriParts.pop();
  const protocol = uriParts.shift();
  uriParts.shift(); // empty string
  const host = uriParts.shift();
  return {host, statusId, protocol};
};

const statusUrlToApiUrl = (url: string): string => {
  const {host, protocol, statusId} = parseStatusUrl(url);
  return `${protocol}//${host}/api/v1/statuses/${statusId}`;
};

const fetchStatus = async (statusApiUrl: string) => {
  const detailResponse = await fetch(statusApiUrl);
  const statusDetail = await detailResponse.json();
  return statusDetail as TStatus;
};

interface ProfileResult {
  account: TAccount;
  timeline: TStatus[];
}

const getProfileByStatusUrl = async (url: string) => {
  const {host, protocol, statusId} = parseStatusUrl(url);
  const detailUrl = `${protocol}//${host}/api/v1/statuses/${statusId}`;
  const statusDetail = await fetchStatus(detailUrl);
  const accountId = statusDetail.account.id;
  const accountTimelineUrl = `${protocol}//${host}/api/v1/accounts/${accountId}/statuses`;
  const timelineResponse = await fetch(accountTimelineUrl);
  const timeline = await timelineResponse.json();
  const accountUrl = `${protocol}//${host}/api/v1/accounts/${accountId}`;
  const accountResponse = await fetch(accountUrl);
  const account = await accountResponse.json();
  return {account, timeline} as ProfileResult;
};

const getProfileByAccountId = async (accountId: string) => {
  const accountTimelineUrl = `https://swj.io/api/v1/accounts/${accountId}/statuses`;
  const timelineResponse = await fetch(accountTimelineUrl);
  const timeline = await timelineResponse.json();
  const accountUrl = `https://swj.io/api/v1/accounts/${accountId}`;
  const accountResponse = await fetch(accountUrl);
  const account = await accountResponse.json();
  return {account, timeline} as ProfileResult;
};

export const useProfile = (
  statusUrl: string | undefined,
  accountId: string | undefined,
) => {
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
      let result: ProfileResult | undefined;
      if (statusUrl) {
        result = await getProfileByStatusUrl(statusUrl);
      }
      if (!result && accountId) {
        result = await getProfileByAccountId(accountId);
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

/**
 * returns post surrounding selected status by its GUI url
 * @param statusUrl ie: https://mstdn.social/@username/108235334317391891
 */
const getThread = async (statusUrl: string, localId: string) => {
  const detailUri = statusUrlToApiUrl(statusUrl);
  const statusDetail = await fetchStatus(detailUri);

  const localStatuses: Record<string, TStatus> = {};
  try {
    const localContextResponse = await fetch(
      `${localBase}/statuses/${localId}/context`,
    );
    const {ancestors, descendants}: TStatusContext =
      await localContextResponse.json();
    [...ancestors, ...descendants].forEach(status => {
      localStatuses[status.uri] = status;
    });
  } catch (e) {
    console.error('localContext fetch error', e);
  }

  const contextResponse = await fetch(`${detailUri}/context`);
  if (!contextResponse.ok) {
    let errorMessage = 'unknown';
    try {
      const jsonError = await contextResponse.json();
      if (jsonError.error) {
        errorMessage = jsonError.error;
      }
    } catch (_) {
      errorMessage = `response status ${contextResponse.status}`;
    }
    return {
      type: 'error',
      error: `getThread error: ${errorMessage}`,
    };
  }
  const statusContext = await contextResponse.json();

  return {
    type: 'success',
    response: {
      status: statusDetail,
      localStatuses,
      ...statusContext,
    } as TThread,
  };
};

export const useThread = (statusUrl: string, localId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thread, setThread] = useState<TThread>();

  const fetchThread = async () => {
    setLoading(true);
    try {
      const result = await getThread(statusUrl, localId);
      if (result.type === 'error' && result.error) {
        setError(result.error);
      } else {
        setThread(result.response);
      }
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
