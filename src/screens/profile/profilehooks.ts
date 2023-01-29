import {batch, opaqueObject} from '@legendapp/state';
import {useComputed, useSelector} from '@legendapp/state/react';
import {useCallback, useRef} from 'react';
import {
  useMyMastodonInstance,
  useRemoteActivityPubInstance,
  useRemoteMastodonInstance,
} from '../../api/hooks';
import {MastodonApiClient} from '../../api/mastodon';
import {globalStatuses} from '../../api/status.state';
import {timelines} from '../../api/timeline.state';
import {globalUsers, userMeta} from '../../api/user.state';
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
  const userFQN =
    account && account.acct?.includes('@')
      ? account.acct
      : `${accountHandle}@${host}`;
  const userTimelineRef = timelines[userFQN];
  const userRef = globalUsers[userFQN];
  const userMetaRef = userMeta[userFQN];
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
      recursionCount,
    }: {
      nextPageRecurse: string | undefined;
      profileRecurse: TAccount | undefined;
      existingStatuses: string[] | undefined;
      recursionCount?: number | undefined;
    } = {
      nextPageRecurse: undefined,
      profileRecurse: undefined,
      existingStatuses: undefined,
      recursionCount: undefined,
    },
  ) => {
    const idParts = getIdParts();
    const nextPage = userMetaRef.nextPage.peek();
    const loading = userMetaRef.loading.peek();
    const profile = userRef.peek();
    const nextPageUrl = nextPageRecurse ?? nextPage;
    const alreadyLoading = loading && !nextPageRecurse;
    const profileForMerge = profileRecurse ?? profile;

    if (!nextPageUrl || alreadyLoading || !profileForMerge || !idParts.host) {
      return;
    }

    userMetaRef.loading.set(true);

    const statuses = userTimelineRef.peek();

    try {
      const remoteActivityPub = getRemoteAPInstance(idParts.host);
      const response = await remoteActivityPub.getProfileTimeline(
        nextPageUrl,
        profileForMerge,
      );
      if (response) {
        let appendable: string[] = [];
        let newStatuses: string[] = [];

        batch(async () => {
          const unpinnedToots = response.result.filter(
            toot => !pinnedIds.current.includes(toot.id),
          );

          appendable = await unpinnedToots.reduce(async (chain, toot) => {
            const statusList = await chain;
            const resolvedStatus = await localOrAPFallback(
              toot,
              undefined,
              api,
            );
            const newStatus = {
              ...resolvedStatus,
              emojis: emojis.current,
            };
            const statusId = newStatus.url ?? newStatus.uri;
            globalStatuses[statusId].set(newStatus);
            return statusList.concat(statusId);
          }, Promise.resolve([]) as Promise<string[]>);

          newStatuses = (existingStatuses ?? statuses).concat(appendable);
          userTimelineRef.set(newStatuses);
          userMetaRef.nextPage.set(response.pageInfo?.next ?? false);
        });

        if (
          (!recursionCount || recursionCount < 2) &&
          !!appendable.length &&
          appendable.length < 3 &&
          response.pageInfo?.next
        ) {
          fetchTimeline({
            nextPageRecurse: response.pageInfo.next,
            profileRecurse,
            existingStatuses: newStatuses,
            recursionCount:
              typeof recursionCount === 'number' ? recursionCount + 1 : 1,
          });
          return;
        }
      }
    } catch (e: unknown) {
      console.error(e);
      userMetaRef.error.set(opaqueObject(e as Error));
    } finally {
      userMetaRef.loading.set(false);
    }
  };

  const fetchAccountAndTimeline = () =>
    batch(async () => {
      const idParts = getIdParts();

      if (!idParts.host || !idParts.handle) {
        userMetaRef.loading.set(false);
        return;
      }

      const profile = userRef.peek();
      if (profile) {
        userMetaRef.refreshing.set(true);
      }

      userMetaRef.loading.set(true);

      try {
        const userIdent = `${idParts.handle}@${idParts.host}`;
        let localAccount: TAccount | undefined;
        let localTimeline: TStatusMapped[] | undefined;
        let localTimelineByIdUrl: Record<string, TStatusMapped> = {};
        localAccount = await api.findAccount(userIdent);
        if (localAccount?.id) {
          const relationship = await api.getRelationship(localAccount.id);
          userMetaRef.localId.set(localAccount.id);
          userMetaRef.following.set(!!relationship?.following);
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
            userMetaRef.nextPage.set(remoteResult.pageInfo?.next ?? false);
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
          userMetaRef.loading.set(false);
          userMetaRef.error.set(opaqueObject(e as Error));
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

        const timelineStatusIds = [] as string[];
        if (timeline) {
          timeline.forEach(status => {
            const statusId = status.url ?? status.uri;
            timelineStatusIds.push(statusId);
            globalStatuses[statusId].set(status);
          });
          userTimelineRef.set(Array.from(timelineStatusIds));
        }

        userMetaRef.profileSource.set(mergeSource);
        userRef.set(remoteOrLocalProfile);

        if (
          remoteOrLocalProfile &&
          timeline &&
          timeline.length < 3 &&
          remoteResult?.ok &&
          remoteResult.pageInfo?.next
        ) {
          userMetaRef.refreshing.set(false);
          fetchTimeline({
            nextPageRecurse: remoteResult.pageInfo.next,
            profileRecurse: remoteOrLocalProfile,
            existingStatuses: timelineStatusIds,
          });
          return;
        }
      } catch (e: unknown) {
        console.error(e);
        userMetaRef.error.set(opaqueObject(e as Error));
      } finally {
        userMetaRef.refreshing.set(false);
        userMetaRef.loading.set(false);
      }
    });

  const onToggleFollow = useCallback(async () => {
    const localId = userMetaRef.localId.peek();
    if (!localId) {
      return;
    }
    userMetaRef.followLoading.set(true);
    if (userMetaRef.following.peek()) {
      const ok = await api.unfollow(localId);
      if (ok) {
        userMetaRef.following.set(false);
      }
    } else {
      const ok = await api.follow(localId);
      if (ok) {
        userMetaRef.following.set(true);
      }
    }
    userMetaRef.followLoading.set(false);
  }, [userMetaRef, api]);

  useMount(() => {
    fetchAccountAndTimeline();
  });

  const {
    error,
    following,
    followLoading,
    hasMore,
    loading,
    localId,
    profile,
    profileSource,
    refreshing,
    statusIds,
  } = useSelector(() => {
    const _error = userMetaRef.error.get();
    const _following = userMetaRef.following.get();
    const _followLoading = userMetaRef.followLoading.get();
    const _loading = userMetaRef.loading.get();
    const _localId = userMetaRef.localId.get();
    const _nextPage = userMetaRef.nextPage.get();
    const _profile = userRef.get();
    const _profileSource = userMetaRef.profileSource.get();
    const _refreshing = userMetaRef.refreshing.get();
    const _timeline = userTimelineRef.get() ?? [];
    return {
      error: _error,
      following: _following,
      followLoading: _followLoading,
      hasMore: _nextPage !== false,
      hasStatuses: !!_timeline.length,
      loading: _loading,
      localId: _localId,
      profile: _profile,
      profileSource: _profileSource,
      refreshing: _refreshing,
      statusIds: _timeline,
      reloading:
        typeof _nextPage === 'undefined' && _loading && !!_timeline.length,
    };
  });

  const loadingMore = useComputed(
    () => !!userMetaRef.nextPage.get() && !!userMetaRef.loading.get(),
  );

  return {
    profile,
    profileSource,
    statusIds,
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
