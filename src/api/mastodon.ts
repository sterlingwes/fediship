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

  async unfavourite(statusId: string) {
    const response = await this.authedPost(
      this.url(`statuses/${statusId}/unfavourite`),
    );
    return response.ok;
  }

  async favourite(statusId: string) {
    const response = await this.authedPost(
      this.url(`statuses/${statusId}/favourite`),
    );

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
    return this.req(info, {
      ...extra,
      method: 'POST',
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
    const response = await fetch(info, extra);
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
    let usedPath = path;
    if (usedPath[0] === '/') {
      usedPath = path.substring(1);
    }
    const {host, apiVersion} = this.options;
    return `https://${host}/api/v${apiVersion ?? 1}/${path}`;
  }
}
