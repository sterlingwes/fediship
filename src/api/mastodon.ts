import {
  TAccount,
  TAccountRelationship,
  TNotification,
  TPeerTagTrend,
  TProfileResult,
  TStatus,
  TThread,
} from '../types';

import {HTTPClient} from './http-client';

interface ClientOptions {
  host: string;
  token?: string;
  apiVersion?: number;
  actorId?: string;
}

export class MastodonApiClient extends HTTPClient {
  private mastoOptions: ClientOptions;

  constructor(options: ClientOptions) {
    super({
      host: options.host,
      token: options.token,
      pathBase: `/api/v${options.apiVersion ?? 1}`,
    });
    this.mastoOptions = options;
  }

  async getTimeline(timeline: 'home' | 'public', nextPage?: string) {
    const method = timeline === 'home' ? 'authedGet' : 'get';
    const response = await this[method](nextPage ?? `timelines/${timeline}`);
    if (!response.body) {
      throw new Error('Failed to fetch timeline');
    }

    const list = response.body
      .filter((status: TStatus) => !status.in_reply_to_id)
      .sort((a: TStatus, b: TStatus) => b.id.localeCompare(a.id)) as TStatus[];

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

    const list = response.body
      .filter((status: TStatus) => !status.in_reply_to_id)
      .sort((a: TStatus, b: TStatus) => b.id.localeCompare(a.id)) as TStatus[];

    return {
      list,
      pageInfo: response.pageInfo,
    };
  }

  async getStatus(statusId: string) {
    const response = await this.get(`statuses/${statusId}`);
    return response.ok ? response.body : undefined;
  }

  async getThread(statusId: string, options?: {skipTargetStatus: boolean}) {
    const statusDetail = !options?.skipTargetStatus
      ? await this.getStatus(statusId)
      : undefined;

    const contextResponse = await this.get(`statuses/${statusId}/context`);
    if (!contextResponse.ok) {
      const errorMessage = await contextResponse.getError();
      return {
        type: 'error',
        error: `getThread error: ${errorMessage}`,
      };
    }
    const statusContext = await contextResponse.parseBody();

    return {
      type: 'success',
      response: {
        ...statusContext,
        status: statusDetail,
      } as Omit<TThread, 'localStatuses'>,
    };
  }

  async findAccount(acct: string) {
    const response = await this.authedGet(`accounts/search?q=${acct}`);
    if (response.ok && response.body.length > 0) {
      return response.body[0] as TAccount;
    }
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

  async getProfile(accountId: string) {
    let toots: TStatus[] = [];

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
          pinned: true,
        };
      });
      const filteredTimeline = (accountTimeline.body as TStatus[]).filter(
        toot => pinnedIds.includes(toot.id) === false,
      );

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
      list: response.body as TStatus[],
      pageInfo: response.pageInfo,
    };
  }

  async getBookmarks(nextPage?: string) {
    const response = await this.authedGet(nextPage ?? 'bookmarks');
    if (!response.body) {
      throw new Error('Failed to fetch bookmarks');
    }

    return {
      list: response.body as TStatus[],
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

  async getNotifications(params?: {minId?: string}) {
    const path = params?.minId
      ? `notifications?min_id${params.minId}`
      : 'notifications';
    const response = await this.authedGet(path);
    if (!response.ok) {
      return [];
    }

    return response.body as TNotification[];
  }

  async vote(pollId: string, choices: number[]) {
    return this.authedPost(`polls/${pollId}/votes`, this.form({choices}));
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
}
