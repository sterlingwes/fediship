import {useCallback, useRef, useState} from 'react';
import {TAccount, TStatusContext, TStatusMapped, TThread} from './types';
import {useMount} from './utils/hooks';
import {useMyMastodonInstance, useRemoteMastodonInstance} from './api/hooks';
import {parseStatusUrl} from './api/api.utils';
import {useAuth} from './storage/auth';
import {timelineMeta, timelines} from './api/timeline.state';
import {batch} from '@legendapp/state';
import {globalStatuses} from './api/status.state';

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

export const usePeers = (startEmpty = true, initialFilter = '') => {
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
      if (!startEmpty) {
        setPeers(fullPeersList.current);
      }

      if (initialFilter) {
        filterPeers(initialFilter);
      }
    } catch (e: unknown) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filterPeers = useCallback(
    (q: string) => {
      if (startEmpty && !q) {
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
    [peers, startEmpty, setPeers],
  );

  useMount(() => {
    fetchPeers();
  });

  return {peers, fetchPeers, filterPeers, error, loading};
};

export const useTimeline = (timeline: 'home' | 'public') => {
  const api = useMyMastodonInstance();

  const timelineState = timelines[timeline];
  const metaRef = timelineMeta[timeline];

  const fetchTimeline = async (reset?: boolean) => {
    const nextPage = metaRef.nextPage.peek();

    if (nextPage === false || metaRef.loading.peek()) {
      return;
    }

    metaRef.loading.set(true);
    try {
      const result = await api.getTimeline(
        timeline,
        reset ? undefined : nextPage,
      );

      batch(() => {
        if (!metaRef.renderNonce.peek) {
          metaRef.renderNonce.set(1);
        }

        if (reset) {
          timelineState.set([]);
        }

        result.list.forEach(status => {
          const statusId = status.url || status.uri;
          globalStatuses[statusId].set(status);
          timelineState.push(statusId);
        });
      });

      metaRef.nextPage.set(result?.pageInfo?.next ?? false);
    } catch (e: unknown) {
      console.error(e);
      metaRef.error.set((e as Error).message);
    } finally {
      metaRef.loading.set(false);
    }
  };

  const reloadTimeline = () => {
    return fetchTimeline(true);
  };

  useMount(() => {
    fetchTimeline(true);
  });

  return {
    timeline: timelineState,
    metaRef,
    fetchTimeline,
    reloadTimeline,
  };
};

export const useTagTimeline = (host: string, tag: string) => {
  const mountRef = useRef(true);
  const timelineId = `${host}/${tag}`;
  const metaRef = timelineMeta[timelineId];
  const timeline = timelines[timelineId];

  const getRemote = useRemoteMastodonInstance();

  const fetchTimeline = async (reset?: boolean) => {
    const nextPage = metaRef.nextPage.peek();

    if (nextPage === false || metaRef.loading.peek()) {
      return;
    }

    metaRef.loading.set(true);

    try {
      const api = getRemote(host);
      const result = await api.getTagTimeline(
        tag,
        reset ? undefined : nextPage,
      );

      if (!mountRef.current) {
        return; // component unmounted before finish
      }

      batch(() => {
        if (reset) {
          timelines[timelineId].set([]);
        }

        result.list.forEach(status => {
          globalStatuses[status.url || status.uri].set(status);
          timelines[timelineId].push(status.url || status.uri);
        });
      });

      metaRef.nextPage.set(result?.pageInfo?.next ?? false);
    } catch (e: unknown) {
      console.error(e);
      metaRef.error.set((e as Error).message);
    } finally {
      metaRef.loading.set(false);
    }
  };

  const reloadTimeline = () => {
    metaRef.nextPage.set(undefined);
    return fetchTimeline(true);
  };

  useMount(() => {
    fetchTimeline(true);
    return () => {
      mountRef.current = false;
    };
  });

  return {
    timeline,
    metaRef,
    fetchTimeline,
    reloadTimeline,
  };
};

export const useFavourites = (type: 'favourites' | 'bookmarks') => {
  const api = useMyMastodonInstance();
  const metaRef = timelineMeta[type];
  const timeline = timelines[type];

  const fetchTimeline = async (reset?: boolean) => {
    const nextPage = metaRef.nextPage.peek();

    if (!reset && (nextPage === false || metaRef.loading.peek())) {
      return;
    }

    metaRef.loading.set(true);
    try {
      const method = type === 'favourites' ? 'getFavourites' : 'getBookmarks';
      const result = await api[method](
        reset ? undefined : nextPage || undefined,
      );

      batch(() => {
        if (reset) {
          timelines[type].set([]);
        }

        result.list.forEach(status => {
          const statusId = status.url || status.uri;
          globalStatuses[statusId].set(status);
          timelines[type].push(statusId);
        });
      });

      metaRef.nextPage.set(result?.pageInfo?.next ?? false);
    } catch (e: unknown) {
      console.error(e);
      metaRef.error.set((e as Error).message);
    } finally {
      metaRef.loading.set(false);
    }
  };

  const reloadTimeline = () => {
    metaRef.nextPage.set(undefined);
    return fetchTimeline(true);
  };

  useMount(() => {
    fetchTimeline(true);
  });

  return {
    timeline,
    metaRef,
    fetchTimeline,
    reloadTimeline,
  };
};

const mergeContexts = (
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

  if (localContextCount > remoteContextCount) {
    return localContext;
  } else {
    const remoteIds = (remoteContext.descendants ?? []).map(s => s.uri);

    const filteredLocalDescendants = (localContext.descendants ?? []).filter(
      s => remoteIds.includes(s.uri) === false,
    );

    return {
      ...remoteContext,
      descendants: [
        ...(remoteContext.descendants ?? []),
        ...filteredLocalDescendants,
      ],
    };
  }
};

export const useThread = (statusUrl: string, localStatusId: string) => {
  const api = useMyMastodonInstance();
  const getRemoteMasto = useRemoteMastodonInstance();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thread, setThread] = useState<TThread>();
  const [localId, setLocalId] = useState(localStatusId);
  const [localFallback, setLocalFallback] = useState(false);

  const fetchThread = async ({localIdOverride} = {localIdOverride: ''}) => {
    if (localIdOverride) {
      setLocalId(localIdOverride);
    }
    const {host, statusId} = parseStatusUrl(statusUrl);
    if (!host || !statusId) {
      throw new Error('Cannot fetch thread with missing host & statusId');
    }
    setLoading(true);
    try {
      const localIdInput = localIdOverride || localId;
      const localResult = localIdInput.startsWith('http')
        ? undefined
        : await api.getThread(localIdInput);
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

      const highestFidelityResult = mergeContexts(
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

  return {
    thread,
    fetchThread,
    error,
    loading,
    refreshing: !!thread && loading,
    localFallback,
  };
};
