import {useCallback, useRef, useState} from 'react';
import {
  useMyMastodonInstance,
  useRemoteActivityPubInstance,
  useRemoteMastodonInstance,
} from '../../api/hooks';
import {MastodonApiClient} from '../../api/mastodon';
import {Emoji, TAccount, TStatusMapped} from '../../types';
import {useMount} from '../../utils/hooks';
import {getHostAndHandle} from '../../utils/mastodon';

const mergeRemoteIntoLocalProfile = (
  remote: TAccount | undefined,
  local: TAccount | undefined,
  emojis: Emoji[] | undefined,
): [TAccount, 'local' | 'merged' | 'remote'] => {
  if (!remote && local) {
    return [local, 'local'];
  }

  if (remote && local) {
    return [
      {
        ...local,
        // select some values we'd prefer from the remote instance
        // since they'll be fresher
        note: remote.note,
        avatar: remote.avatar,
        avatar_static: remote.avatar_static,
        header: remote.header,
        header_static: remote.header_static,
        emojis: [
          ...(local.emojis ?? []),
          ...(remote.emojis ?? []),
          ...(emojis ?? []),
        ],
      },
      'merged',
    ];
  }

  if (!remote) {
    throw new Error('No account profile available (network error).');
  }

  return [remote, 'remote'];
};

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
  const [profileSource, setProfileSource] = useState<
    'local' | 'merged' | 'remote'
  >('remote');
  const [refreshing, setRefreshing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [following, setFollowing] = useState<boolean | undefined>();
  const [error, setError] = useState<Error>();
  const [profile, setProfile] = useState<TAccount>();
  const [statuses, setStatuses] = useState<TStatusMapped[]>([]);
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
    if (emojis.current.length) {
      return emojis.current;
    }
    const remoteMasto = getRemoteMasto(remoteHost);
    emojis.current = await remoteMasto.getEmojis();
    return emojis.current;
  };

  const fetchTimeline = async (
    {
      nextPageRecurse,
      profileRecurse,
      existingStatuses,
    }: {
      nextPageRecurse: string | undefined;
      profileRecurse: TAccount | undefined;
      existingStatuses: TStatusMapped[] | undefined;
    } = {
      nextPageRecurse: undefined,
      profileRecurse: undefined,
      existingStatuses: undefined,
    },
  ) => {
    const idParts = getIdParts();
    const nextPageUrl = nextPageRecurse ?? nextPage;
    const alreadyLoading = loading && !nextPageRecurse;
    const profileForMerge = profileRecurse ?? profile;

    if (!nextPageUrl || alreadyLoading || !profileForMerge || !idParts.host) {
      return;
    }

    setLoading(true);

    try {
      const remoteActivityPub = getRemoteAPInstance(idParts.host);
      const response = await remoteActivityPub.getProfileTimeline(
        nextPageUrl,
        profileForMerge,
      );
      if (response) {
        let appendable = response.result.filter(
          toot => !pinnedIds.current.includes(toot.id),
        );

        appendable = await appendable.reduce(async (chain, toot) => {
          const statusList = await chain;
          const resolvedStatus = await localOrAPFallback(toot, undefined, api);
          return statusList.concat({
            ...resolvedStatus,
            emojis: emojis.current,
          });
        }, Promise.resolve([]) as Promise<TStatusMapped[]>);
        const newStatuses = (existingStatuses ?? statuses).concat(appendable);
        setStatuses(newStatuses);
        setNextPage(response.pageInfo?.next ?? false);

        if (appendable.length < 3 && response.pageInfo?.next) {
          fetchTimeline({
            nextPageRecurse: response.pageInfo.next,
            profileRecurse,
            existingStatuses: newStatuses,
          });
          return;
        }
      }
    } catch (e: unknown) {
      console.error(e);
      setError(e as Error);
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
      const userIdent = `${idParts.handle}@${idParts.host}`;
      let localAccount: TAccount | undefined;
      let localTimeline: TStatusMapped[] | undefined;
      let localTimelineByIdUrl: Record<string, TStatusMapped> = {};
      localAccount = await api.findAccount(userIdent);
      if (localAccount?.id) {
        const relationship = await api.getRelationship(localAccount.id);
        setLocalId(localAccount.id);
        setFollowing(relationship?.following);
        localTimeline = await api.getProfileTimeline(localAccount.id);
        localTimelineByIdUrl = localTimeline.reduce(
          (acc, status) => ({
            ...acc,
            [status.uri]: status,
          }),
          {} as Record<string, TStatusMapped>,
        );
      }

      let remoteResult:
        | Awaited<ReturnType<typeof remoteActivityPub['getProfileByHandle']>>
        | undefined;

      const remoteActivityPub = getRemoteAPInstance(idParts.host);
      try {
        remoteResult = await remoteActivityPub.getProfileByHandle(
          idParts.host,
          idParts.handle,
        );

        if (remoteResult.ok) {
          pinnedIds.current = remoteResult.pinnedIds;
          setNextPage(remoteResult.pageInfo?.next ?? false);
        }
      } catch (e: any) {
        if (e.message.includes('not signed') === false) {
          throw e;
        }
      }

      const instanceEmojis = await fetchEmojis(idParts.host);

      if (!remoteResult?.ok && !localAccount) {
        const e = new Error(
          remoteResult?.error ??
            'Error fetching user profile which was also not accessible via your instance',
        );
        // @ts-ignore
        e.meta = {userIdent};
        setLoading(false);
        setError(e);
        return;
      }

      const [remoteOrLocalProfile, mergeSource] = mergeRemoteIntoLocalProfile(
        remoteResult?.ok ? remoteResult.account : undefined,
        localAccount,
        instanceEmojis,
      );

      const timeline = remoteResult?.ok
        ? await remoteResult.timeline.reduce(async (chain, toot) => {
            const statusList = await chain;
            const resolvedStatus = await localOrAPFallback(
              toot,
              localTimelineByIdUrl[toot.id],
              api,
            );
            return statusList.concat({
              ...resolvedStatus,
              emojis: instanceEmojis,
            });
          }, Promise.resolve([]) as Promise<TStatusMapped[]>)
        : localTimeline?.map(toot => ({
            ...toot,
            emojis: instanceEmojis,
          }));

      if (timeline) {
        setStatuses(timeline);
      }

      setProfileSource(mergeSource);
      setProfile(remoteOrLocalProfile);

      if (
        remoteOrLocalProfile &&
        timeline &&
        timeline.length < 3 &&
        remoteResult?.ok &&
        remoteResult.pageInfo?.next
      ) {
        setRefreshing(false);
        fetchTimeline({
          nextPageRecurse: remoteResult.pageInfo.next,
          profileRecurse: remoteOrLocalProfile,
          existingStatuses: timeline,
        });
        return;
      }
    } catch (e: unknown) {
      console.error(e);
      setError(e as Error);
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
  const hasMore = nextPage !== false;

  return {
    profile,
    profileSource,
    statuses,
    fetchTimeline,
    fetchAccountAndTimeline,
    error,
    loading,
    loadingMore,
    hasMore,
    refreshing,
    localId,
    following,
    followLoading,
    onToggleFollow,
  };
};

const localOrAPFallback = async (
  apStatus: TStatusMapped,
  localStatus: TStatusMapped | undefined,
  api: MastodonApiClient,
) => {
  if (localStatus) {
    return {...localStatus, pinned: apStatus?.pinned};
  }

  // resolve from local if status has media (for cover image)
  const video = (apStatus.media_attachments ?? []).find(
    media => media.type === 'video',
  );
  if (video) {
    let statusUrl = apStatus.id;
    if (statusUrl.endsWith('/activity')) {
      statusUrl = statusUrl.replace(/\/activity$/, '');
    }
    const status = await api.resolveStatus(statusUrl);
    if (status) {
      return {
        ...status,
        sourceHost: api.host,
      } as TStatusMapped;
    }
  }

  return apStatus;
};
