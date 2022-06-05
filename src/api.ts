import {useCallback, useRef, useState} from 'react';
import {TAccount, TStatusContext, TStatusMapped, TThread} from './types';
import {useMount} from './utils/hooks';
import {useMyMastodonInstance, useRemoteMastodonInstance} from './api/hooks';
import {parseStatusUrl} from './api/api.utils';
import {useAuth} from './storage/auth';

export const useFollowers = (source = 'mine') => {
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
      const method = source === 'mine' ? 'getFollowers' : 'getFollowing';
      const result = await api[method](reset ? undefined : nextPage);
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

export const usePeers = () => {
  const auth = useAuth();
  const api = useMyMastodonInstance();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fullPeersList = useRef<string[]>([]);
  const [peers, setPeers] = useState<string[]>([]);

  const fetchPeers = async () => {
    setLoading(true);
    try {
      const peerList = await api.getInstancePeers();
      const baseHosts = [];
      if (auth.host) {
        baseHosts.push(auth.host);
      }
      fullPeersList.current = baseHosts.concat(peerList).sort();
    } catch (e: unknown) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filterPeers = useCallback(
    (q: string) => {
      if (!q) {
        setPeers([]);
        return;
      }

      if (!fullPeersList.current.length) {
        fullPeersList.current = peers.slice(0);
      }

      setPeers(
        fullPeersList.current.filter(peer =>
          peer.toLowerCase().includes(q.toLowerCase()),
        ),
      );
    },
    [peers, setPeers],
  );

  useMount(() => {
    fetchPeers();
  });

  return {peers, fetchPeers, filterPeers, error, loading};
};

export const useTimeline = (timeline: 'home' | 'public') => {
  const api = useMyMastodonInstance();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statuses, setStatuses] = useState<TStatusMapped[]>([]);
  const [nextPage, setNextPage] = useState<string | false>();

  const fetchTimeline = async (reset?: boolean) => {
    if (nextPage === false || loading) {
      return;
    }

    setLoading(true);
    try {
      const result = await api.getTimeline(
        timeline,
        reset ? undefined : nextPage,
      );
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
    return fetchTimeline(true);
  };

  useMount(() => {
    fetchTimeline(true);
  });

  const reloading =
    typeof nextPage === 'undefined' && loading && !!statuses.length;
  const loadingMore = !!nextPage && loading;
  const hasMore = nextPage !== false;

  return {
    statuses,
    fetchTimeline,
    reloadTimeline,
    reloading,
    error,
    loading,
    loadingMore,
    hasMore,
  };
};

export const useTagTimeline = (host: string, tag: string) => {
  const getRemote = useRemoteMastodonInstance();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statuses, setStatuses] = useState<TStatusMapped[]>([]);
  const [nextPage, setNextPage] = useState<string | false>();

  const fetchTimeline = async (reset?: boolean) => {
    if (nextPage === false || loading) {
      return;
    }

    setLoading(true);
    try {
      const api = getRemote(host);
      const result = await api.getTagTimeline(
        tag,
        reset ? undefined : nextPage,
      );
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
  const reloading = typeof nextPage === 'undefined' && loading;
  const hasMore = nextPage !== false;

  return {
    statuses,
    fetchTimeline,
    reloadTimeline,
    error,
    loading,
    loadingMore,
    reloading,
    hasMore,
  };
};

export const useFavourites = (type: 'favourites' | 'bookmarks') => {
  const api = useMyMastodonInstance();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statuses, setStatuses] = useState<TStatusMapped[]>([]);
  const [nextPage, setNextPage] = useState<string | false>();

  const fetchTimeline = async (reset?: boolean) => {
    if (nextPage === false || loading) {
      return;
    }

    setLoading(true);
    try {
      const method = type === 'favourites' ? 'getFavourites' : 'getBookmarks';
      const result = await api[method](reset ? undefined : nextPage);
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

  const reloading = typeof nextPage === 'undefined' && loading;
  const loadingMore = !!nextPage && loading;

  return {
    statuses,
    fetchTimeline,
    reloadTimeline,
    reloading,
    error,
    loading,
    loadingMore,
  };
};

const mostDetailedContext = (
  localContext: TStatusContext | undefined,
  remoteContext: TStatusContext | undefined,
) => {
  if (!localContext && !remoteContext) {
    return undefined;
  }

  if (!localContext) {
    return remoteContext;
  }

  if (!remoteContext) {
    return remoteContext;
  }

  const localContextCount =
    (localContext.ancestors?.length ?? 0) +
    (localContext.descendants?.length ?? 0);
  const remoteContextCount =
    (remoteContext.ancestors?.length ?? 0) +
    (remoteContext.descendants?.length ?? 0);

  return localContextCount > remoteContextCount ? localContext : remoteContext;
};

export const useThread = (statusUrl: string, localId: string) => {
  const api = useMyMastodonInstance();
  const getRemoteMasto = useRemoteMastodonInstance();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thread, setThread] = useState<TThread>();
  const [localFallback, setLocalFallback] = useState(false);

  const fetchThread = async () => {
    const {host, statusId} = parseStatusUrl(statusUrl);
    if (!host || !statusId) {
      throw new Error('Cannot fetch thread with missing host & statusId');
    }
    setLoading(true);
    try {
      const localResult = localId.startsWith('http')
        ? undefined
        : await api.getThread(localId);
      const localStatuses: Record<string, TStatusMapped> = {};
      if (localResult && localResult.response) {
        const {ancestors, descendants} = localResult.response;
        [
          ...(localResult.response.status ? [localResult.response.status] : []),
          ...(ancestors ?? []),
          ...(descendants ?? []),
        ].forEach(status => {
          localStatuses[status.uri] = status;
        });
      }

      const remoteResult = await getRemoteMasto(host).getThread(statusId, {
        skipTargetStatus:
          !localResult || localResult.type === 'error' ? false : true,
      });

      const hasLocalThread = localResult?.type === 'success';
      const hasRemoteThread = remoteResult?.type === 'success';

      if (
        remoteResult.type === 'error' &&
        remoteResult.error &&
        !hasLocalThread
      ) {
        setError(remoteResult.error);
        return;
      }

      if (hasLocalThread && !hasRemoteThread) {
        setLocalFallback(true);
      }

      let localStatus = localResult?.response?.status;
      if (localStatus?.reblog) {
        localStatus = localStatus?.reblog;
      }

      const highestFidelityResult = mostDetailedContext(
        localResult?.response,
        remoteResult.response,
      );

      const result = {
        ...remoteResult,
        response: {
          ...highestFidelityResult,
          ...(localStatus ? {status: localStatus} : undefined),
          localStatuses,
          localResponse: localResult?.response,
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

  return {thread, fetchThread, error, loading, localFallback};
};
