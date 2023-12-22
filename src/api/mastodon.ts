import {oauthScopes} from '../constants';
import {
  Emoji,
  NotificationType,
  TAccount,
  TAccountRelationship,
  TApp,
  TNotification,
  TPeerInfo,
  TPeerTagTrend,
  TProfileResult,
  TSearchResults,
  TStatus,
  TStatusContext,
  TStatusMapped,
  TThread,
  TToken,
  Visibility,
} from '../types';

import {HTTPClient, ClientOptions} from './http-client';

interface MastoClientOptions extends ClientOptions {
  apiVersion?: number;
  actorId?: string;
}

export class MastodonApiClient extends HTTPClient {
  private mastoOptions: MastoClientOptions;

  constructor(options?: MastoClientOptions) {
    super({
      host: options?.host ?? '',
      token: options?.token,
      pathBase: `/api/v${options?.apiVersion ?? 1}`,
      fetchOverride: options?.fetchOverride,
    });
    this.mastoOptions = options ?? {host: ''};
  }

  set actorId(actorId: string | undefined) {
    this.mastoOptions.actorId = actorId;
  }

  sendStatus(
    input: {
      status: string;
      in_reply_to_id?: string;
      media_ids?: string[];
      spoiler_text?: string;
      visibility?: Visibility;
    },
    idempotencyKey?: string,
  ) {
    return this.authedPost('statuses', {
      ...(idempotencyKey
        ? {headers: {'Idempotency-Key': idempotencyKey}}
        : undefined),
      ...this.form(input),
    });
  }

  uploadAttachments(
    attachments: Array<{
      name: string;
      type: string;
      uri: string;
      caption: string;
    }>,
  ) {
    return attachments.reduce(async (chain, {name, type, uri, caption}) => {
      const ids = await chain;
      const response = await this.authedPost(
        'media',
        this.form({file: {name, type, uri}, description: caption}),
      );
      if (!response.ok) {
        return ids;
      }
      return ids.concat(response.body.id as string);
    }, Promise.resolve([]) as Promise<string[]>);
  }

  async getTimeline(timeline: 'home' | 'public', nextPage?: string) {
    const response = await this.authedGet(nextPage ?? `timelines/${timeline}`);
    if (!response.body) {
      throw new Error('Failed to fetch timeline');
    }

    const list = (response.body as TStatus[])
      .filter(
        // filter replies and boosted replies
        status =>
          !status.in_reply_to_id &&
          (!status.reblog || !status.reblog.in_reply_to_id),
      )
      .map(status => ({...status, sourceHost: this.host}))
      .sort((a, b) => b.id.localeCompare(a.id));

    return {
      list,
      pageInfo: response.pageInfo,
    };
  }

  async getTagTimeline(tag: string, nextPage?: string) {
    const response = await this.get(nextPage ?? `timelines/tag/${tag}`);
    if (!response.body) {
      throw new Error('Failed to fetch tag timeline for: ' + tag);
    }

    const list = (response.body as TStatus[])
      .filter(status => !status.in_reply_to_id)
      .map(status => ({...status, sourceHost: this.host} as TStatusMapped))
      .sort((a, b) => b.id.localeCompare(a.id));

    return {
      list,
      pageInfo: response.pageInfo,
    };
  }

  async getStatus(statusId: string) {
    const response = await this.get(`statuses/${statusId}`);
    return response.ok
      ? ({...response.body, sourceHost: this.host} as TStatusMapped)
      : undefined;
  }

  async getThread(statusId: string, options?: {skipTargetStatus: boolean}) {
    const statusDetail = !options?.skipTargetStatus
      ? await this.getStatus(statusId)
      : undefined;

    const contextResponse = await this.get(`statuses/${statusId}/context`);
    if (!contextResponse.ok) {
      const errorMessage = await contextResponse.getErrorSafely();
      return {
        type: 'error',
        error: `getThread error: ${errorMessage}`,
      };
    }
    const statusContext = (await contextResponse.parseBody()) as TStatusContext;
    statusContext.ancestors = statusContext.ancestors?.map(status => ({
      ...status,
      sourceHost: this.host,
    }));
    statusContext.descendants = statusContext.descendants?.map(status => ({
      ...status,
      sourceHost: this.host,
    }));

    return {
      type: 'success',
      response: {
        ...statusContext,
        status: statusDetail,
      } as Omit<TThread, 'localStatuses'>,
    };
  }

  async getEmojis() {
    const response = await this.get('custom_emojis');
    if (!response.ok) {
      return [];
    }

    return response.body as Emoji[];
  }

  async findAccount(acct: string) {
    const response = await this.authedGet(
      `/api/v2/search?q=${acct}&type=accounts&resolve=true`,
    );
    if (!response.ok || !response.body?.accounts) {
      return undefined;
    }

    return (response.body as TSearchResults).accounts[0];
  }

  async getRelationship(accountId: string) {
    const response = await this.authedGet(
      `accounts/relationships?id=${accountId}`,
    );
    if (response.ok && response.body.length > 0) {
      return response.body[0] as TAccountRelationship;
    }
  }

  async follow(accountId: string) {
    const response = await this.authedPost(`accounts/${accountId}/follow`);
    return response.ok;
  }

  async unfollow(accountId: string) {
    const response = await this.authedPost(`accounts/${accountId}/unfollow`);
    return response.ok;
  }

  async getFollowers(nextPage?: string) {
    const {actorId} = this.mastoOptions;
    if (!actorId) {
      throw new Error('Cannot get followers with no actorId');
    }
    const response = await this.authedGet(
      nextPage ?? `accounts/${actorId}/followers`,
    );
    if (!response.body) {
      throw new Error('Failed to fetch followers');
    }

    return {
      list: response.body as TAccount[],
      pageInfo: response.pageInfo,
    };
  }

  async getFollowing(nextPage?: string) {
    const {actorId} = this.mastoOptions;
    if (!actorId) {
      throw new Error('Cannot get following with no actorId');
    }
    const response = await this.authedGet(
      nextPage ?? `accounts/${actorId}/following`,
    );
    if (!response.body) {
      throw new Error('Failed to fetch following');
    }

    return {
      list: response.body as TAccount[],
      pageInfo: response.pageInfo,
    };
  }

  async getProfileTimeline(accountId: string) {
    const accountTimeline = await this.authedGet(
      `accounts/${accountId}/statuses?exclude_replies=true`,
    );

    if (!accountTimeline.ok) {
      return [] as TStatusMapped[];
    }

    return accountTimeline.body.map((status: TStatus) => ({
      ...status,
      sourceHost: this.host,
    })) as TStatusMapped[];
  }

  async getProfile(accountId: string) {
    let toots: TStatusMapped[] = [];

    try {
      const accountTimeline = await this.get(
        `accounts/${accountId}/statuses?exclude_replies=true`,
      );
      const accountPinned = await this.get(
        `accounts/${accountId}/statuses?pinned=true`,
      );

      const pinnedIds: string[] = [];
      const pinnedToots = (accountPinned.body as TStatus[]).map(toot => {
        pinnedIds.push(toot.id);
        return {
          ...toot,
          sourceHost: this.host,
          reblog: toot.reblog ? {...toot.reblog, sourceHost: this.host} : null,
          pinned: true,
        };
      });
      const filteredTimeline = (accountTimeline.body as TStatus[])
        .filter(toot => pinnedIds.includes(toot.id) === false)
        .map(status => ({...status, sourceHost: this.host}));

      toots = [...pinnedToots, ...filteredTimeline];
    } catch (e) {
      console.warn('some profile fetches failed:', e);
    }
    const accountProfile = await this.get(`accounts/${accountId}`);
    return {
      account: accountProfile.body,
      timeline: toots,
    } as TProfileResult;
  }

  async getFavourites(nextPage?: string) {
    const response = await this.authedGet(nextPage ?? 'favourites');
    if (!response.body) {
      throw new Error('Failed to fetch favourites');
    }

    return {
      list: (response.body as TStatus[]).map(status => ({
        ...status,
        sourceHost: this.host,
      })),
      pageInfo: response.pageInfo,
    };
  }

  async getBookmarks(nextPage?: string) {
    const response = await this.authedGet(nextPage ?? 'bookmarks');
    if (!response.body) {
      throw new Error('Failed to fetch bookmarks');
    }

    return {
      list: (response.body as TStatus[]).map(status => ({
        ...status,
        sourceHost: this.host,
      })),
      pageInfo: response.pageInfo,
    };
  }

  async unfavourite(statusId: string) {
    const response = await this.authedPost(`statuses/${statusId}/unfavourite`);
    return response.ok;
  }

  async favourite(statusId: string) {
    const response = await this.authedPost(`statuses/${statusId}/favourite`);

    if (
      !response.ok &&
      (await response.hasError('Status has already been taken'))
    ) {
      return true;
    }

    return response.ok;
  }

  async favouriteRemote(uri: string) {
    const localStatus = await this.resolveStatus(uri);
    if (!localStatus) {
      return false;
    }

    return this.favourite(localStatus.id);
  }

  async getFavouritedBy(statusId: string) {
    const response = await this.authedGet(`statuses/${statusId}/favourited_by`);
    if (!response.ok) {
      return undefined;
    }

    return response.body as TAccount[];
  }

  async reblog(statusId: string) {
    const response = await this.authedPost(`statuses/${statusId}/reblog`);
    return response.ok;
  }

  async unreblog(statusId: string) {
    const response = await this.authedPost(`statuses/${statusId}/unreblog`);
    return response.ok;
  }

  async bookmark(statusId: string) {
    const response = await this.authedPost(`statuses/${statusId}/bookmark`);
    return response.ok;
  }

  async unbookmark(statusId: string) {
    const response = await this.authedPost(`statuses/${statusId}/unbookmark`);
    return response.ok;
  }

  async getNotifications(params?: {
    minId?: string;
    excludeTypes?: NotificationType[];
  }) {
    let path = params?.minId
      ? `notifications?min_id${params.minId}`
      : 'notifications?';

    if (params?.excludeTypes) {
      path = params.excludeTypes.reduce(
        (acc, type) => `${acc}&exclude_types[]=${type}`,
        path,
      );
    }

    const response = await this.authedGet(path);
    if (!response.ok) {
      return [];
    }

    return response.body as TNotification[];
  }

  async vote(pollId: string, choices: number[]) {
    return this.authedPost(`polls/${pollId}/votes`, this.form({choices}));
  }

  async getInstanceInfo() {
    const response = await this.get('instance');
    if (!response.ok) {
      return;
    }
    return response.body as TPeerInfo;
  }

  async getInstancePeers() {
    const response = await this.get('instance/peers');
    if (!response.ok) {
      return [];
    }
    return response.body as string[];
  }

  async getInstanceTrends() {
    const response = await this.get('trends');
    if (!response.ok) {
      return [];
    }
    return response.body as TPeerTagTrend[];
  }

  async search(query: string, limit = 10): Promise<TSearchResults> {
    const response = await this.authedGet(
      `/api/v2/search?q=${query}&limit=${limit}`,
    );
    if (!response.ok) {
      return {accounts: [], statuses: [], hashtags: []};
    }

    return response.body as TSearchResults;
  }

  async resolveStatus(statusUri: string) {
    const response = await this.authedGet(
      `/api/v2/search?q=${encodeURIComponent(
        statusUri,
      )}&type=statuses&resolve=true`,
    );
    if (!response.ok) {
      return;
    }

    return (response.body as TSearchResults).statuses?.[0];
  }

  async createApplication({name}: {name: string}) {
    const response = await this.post(
      'apps',
      this.form({
        client_name: name,
        redirect_uris: 'urn:ietf:wg:oauth:2.0:oob',
        scopes: oauthScopes,
        website: 'https://fediship.app',
      }),
    );

    if (!response.ok) {
      console.error('createApplication', response.status);
      return;
    }

    return response.body as TApp;
  }

  async createToken({
    client_id,
    client_secret,
    code,
    scope,
  }: {
    client_id: string;
    client_secret: string;
    code?: string;
    scope?: string;
  }) {
    const response = await this.post(
      '/oauth/token',
      this.form({
        client_id,
        client_secret,
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        grant_type: code ? 'authorization_code' : 'client_credentials',
        scope: scope ?? 'read',
        ...(code ? {code} : undefined),
      }),
    );

    if (!response.ok) {
      return;
    }

    return response.body as TToken;
  }

  async verifyAuth() {
    const response = await this.authedGet('accounts/verify_credentials');
    if (!response.ok) {
      return;
    }

    return response.body as TAccount;
  }

  async logout({
    client_id,
    client_secret,
    token,
  }: {
    client_id: string;
    client_secret: string;
    token: string;
  }) {
    const response = await this.post(
      '/oauth/revoke',
      this.form({
        client_id,
        client_secret,
        token,
      }),
    );

    return response.ok;
  }
}
