import {useCallback, useRef, useState} from 'react';
import {
  useMyMastodonInstance,
  useRemoteActivityPubInstance,
  useRemoteMastodonInstance,
} from '../../api/hooks';
import {Emoji, TAccount, TStatus} from '../../types';
import {useMount} from '../../utils/hooks';
import {getHostAndHandle} from '../../utils/mastodon';

export const useAPProfile = (
  host: string | undefined,
  accountHandle: string | undefined,
  account: TAccount | undefined,
) => {
  const api = useMyMastodonInstance();
  const getRemoteAPInstance = useRemoteActivityPubInstance();
  const getRemoteMasto = useRemoteMastodonInstance();
  const emojis = useRef<Emoji[]>([]);
  const [loading, setLoading] = useState(true);
  const [localId, setLocalId] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [following, setFollowing] = useState<boolean | undefined>();
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<TAccount>();
  const [statuses, setStatuses] = useState<TStatus[]>([]);
  const [nextPage, setNextPage] = useState<string | false>();
  const pinnedIds = useRef<string[]>([]);

  const getIdParts = () => {
    let remoteHost = host;
    let remoteHandle = accountHandle;

    if (!remoteHost && account) {
      const handleParts = getHostAndHandle(account);
      remoteHost = handleParts?.host;
      remoteHandle = handleParts?.accountHandle;
    }

    return {
      host: remoteHost,
      handle: remoteHandle,
    };
  };

  const fetchEmojis = async (remoteHost: string) => {
    const remoteMasto = getRemoteMasto(remoteHost);
    emojis.current = await remoteMasto.getEmojis();
    return emojis.current;
  };

  const fetchTimeline = async () => {
    const idParts = getIdParts();

    if (!nextPage || loading || !profile || !idParts.host) {
      return;
    }

    setLoading(true);

    try {
      const remoteActivityPub = getRemoteAPInstance(idParts.host);
      const response = await remoteActivityPub.getProfileTimeline(
        nextPage,
        profile,
      );
      if (response) {
        setStatuses(
          statuses.concat(
            response.result
              .filter(toot => !pinnedIds.current.includes(toot.id))
              .map(toot => ({...toot, emojis: emojis.current})),
          ),
        );
        setNextPage(response.pageInfo.next);
      }
    } catch (e: unknown) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountAndTimeline = async () => {
    const idParts = getIdParts();

    if (!idParts.host || !idParts.handle) {
      setLoading(false);
      return;
    }

    if (profile) {
      setRefreshing(true);
    }

    setLoading(true);

    try {
      const remoteActivityPub = getRemoteAPInstance(idParts.host);
      const result = await remoteActivityPub.getProfileByHandle(
        idParts.host,
        idParts.handle,
      );
      if (result) {
        const localAccount = await api.findAccount(
          `${idParts.handle}@${idParts.host}`,
        );
        if (localAccount?.id) {
          const relationship = await api.getRelationship(localAccount.id);
          setLocalId(localAccount.id);
          setFollowing(relationship?.following);
        }

        pinnedIds.current = result.pinnedIds;
        setNextPage(result.pageInfo?.next);
      }

      await fetchEmojis(idParts.host);

      if (!result) {
        setLoading(false);
        return;
      }

      const profileWithEmojis = {...result.account, emojis: emojis.current};

      setStatuses(
        result.timeline.map(toot => ({...toot, emojis: emojis.current})),
      );
      setProfile(profileWithEmojis);
    } catch (e: unknown) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const onToggleFollow = useCallback(async () => {
    if (!localId) {
      return;
    }
    setFollowLoading(true);
    if (following) {
      const ok = await api.unfollow(localId);
      if (ok) {
        setFollowing(false);
      }
    } else {
      const ok = await api.follow(localId);
      if (ok) {
        setFollowing(true);
      }
    }
    setFollowLoading(false);
  }, [setFollowLoading, following, setFollowing, localId, api]);

  useMount(() => {
    fetchAccountAndTimeline();
  });

  const loadingMore = !!nextPage && loading;

  return {
    profile,
    statuses,
    fetchTimeline,
    fetchAccountAndTimeline,
    error,
    loading,
    loadingMore,
    refreshing,
    localId,
    following,
    followLoading,
    onToggleFollow,
  };
};
