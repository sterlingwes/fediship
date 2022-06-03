import {createFetchProxy} from './fetch-proxy';
import {ApiResponse} from './response';

interface ClientOptions {
  host: string;
  token?: string;
  pathBase?: string;
  acceptHeader?: string;
}

export class HTTPClient {
  private options: ClientOptions;
  private fetch: GlobalFetch['fetch'];

  constructor(options: ClientOptions) {
    this.options = options;
    this.fetch = createFetchProxy();
  }

  get host() {
    return this.options.host;
  }

  set token(token: string) {
    this.options.token = token;
  }

  async authedPost(info: RequestInfo, extra?: RequestInit) {
    this.assertToken();
    return this.post(info, {
      ...extra,
      headers: {
        ...extra?.headers,
        Authorization: `Bearer ${this.options.token}`,
      },
    });
  }

  async authedGet(info: RequestInfo, extra?: RequestInit) {
    this.assertToken();
    return this.get(info, {
      ...extra,
      headers: {
        ...extra?.headers,
        Authorization: `Bearer ${this.options.token}`,
      },
    });
  }

  async post(info: RequestInfo, extra?: RequestInit) {
    return this.req(info, {...extra, method: 'POST'});
  }

  async get(info: RequestInfo, extra?: RequestInit) {
    return this.req(info, {...extra, method: 'GET'});
  }

  private async req(info: RequestInfo, extra?: RequestInit) {
    const urlOrRequest = typeof info === 'string' ? this.url(info) : info;
    const response = await this.fetch(urlOrRequest, {
      ...extra,
      headers: {
        Accept: this.options.acceptHeader ?? 'application/json',
        ...extra?.headers,
      },
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
    const {host, pathBase} = this.options;

    if (path.startsWith(`https://${host}`)) {
      return path;
    }

    let usedPath = path;
    if (usedPath[0] === '/') {
      usedPath = path.substring(1);
    }
    return `https://${host}${pathBase ?? ''}/${path}`;
  }

  form(data: Record<string, any>) {
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

  json(data: Record<string, any>) {
    return {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
}
