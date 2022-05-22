import {
  APPerson,
  TAccount,
  TAccountRelationship,
  TPeerTagTrend,
  TProfileResult,
  TStatus,
  TThread,
  Webfinger,
} from '../types';
import {transformPerson} from '../utils/activitypub';
import {ApiResponse} from './response';

interface ClientOptions {
  host: string;
  token?: string;
  apiVersion?: number;
  actorId?: string;
}

export class MastodonApiClient {
  private options: ClientOptions;

  constructor(options: ClientOptions) {
    this.options = options;
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
    const {actorId} = this.options;
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
    const {actorId} = this.options;
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

  // TODO: move to an ActivityPub class
  async getWebfinger(host: string, accountHandle: string) {
    const response = await this.get(
      `https://${host}/.well-known/webfinger?resource=acct:${accountHandle}@${host}`,
    );
    if (!response.ok) {
      return;
    }
    return response.body as Webfinger;
  }

  async getProfileByHandle(host: string, handle: string) {
    const webfinger = await this.getWebfinger(host, handle);
    if (!webfinger) {
      return;
    }
    const profileLink = webfinger.links.find(
      link => link.rel === 'self' && link.type.includes('json'),
    );
    if (profileLink) {
      const result = await this.get(profileLink.href);
      return {
        account: transformPerson(profileLink.href, result.body as APPerson),
        timeline: [],
      };
    }
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

  private async authedPost(info: RequestInfo, extra?: RequestInit) {
    this.assertToken();
    return this.post(info, {
      ...extra,
      headers: {Authorization: `Bearer ${this.options.token}`},
    });
  }

  private async authedGet(info: RequestInfo, extra?: RequestInit) {
    this.assertToken();
    return this.get(info, {
      ...extra,
      headers: {Authorization: `Bearer ${this.options.token}`},
    });
  }

  private async post(info: RequestInfo, extra?: RequestInit) {
    return this.req(info, {...extra, method: 'POST'});
  }

  private async get(info: RequestInfo, extra?: RequestInit) {
    return this.req(info, {...extra, method: 'GET'});
  }

  private async req(info: RequestInfo, extra?: RequestInit) {
    const urlOrRequest = typeof info === 'string' ? this.url(info) : info;
    const response = await fetch(urlOrRequest, {
      ...extra,
      headers: {Accept: 'application/json', ...extra?.headers},
    });
    const apiResponse = new ApiResponse(response);
    await apiResponse.parseBody();
    return apiResponse;
  }

  private assertToken() {
    if (!this.options.token) {
      throw new Error('Token required for operation');
    }
  }

  private url(path: string) {
    const {host, apiVersion} = this.options;

    if (path.startsWith(`https://${host}`)) {
      return path;
    }

    let usedPath = path;
    if (usedPath[0] === '/') {
      usedPath = path.substring(1);
    }
    return `https://${host}/api/v${apiVersion ?? 1}/${path}`;
  }

  private json(body: Record<string, any>) {
    return {
      body: JSON.stringify(body),
    };
  }

  private form(data: Record<string, any>) {
    const body = new FormData();
    Object.keys(data).forEach((key: string) => {
      const value = data[key];
      if (Array.isArray(value)) {
        value.forEach(val => body.append(`${key}[]`, val));
      } else {
        body.append(key, value);
      }
    });

    return {
      body,
    };
  }
}
