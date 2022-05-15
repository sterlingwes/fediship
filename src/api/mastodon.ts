import {TStatus} from '../types';
import {ApiResponse} from './response';

interface ClientOptions {
  host: string;
  token?: string;
  apiVersion?: number;
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
    const response = await fetch(urlOrRequest, extra);
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
}
