import {createFetchProxy} from './fetch-proxy';
import {ApiResponse} from './response';

export interface ClientOptions {
  host: string;
  token?: string;
  pathBase?: string;
  acceptHeader?: string;
  fetchOverride?: ReturnType<typeof createFetchProxy>;
}

let clientCount = 0;

export class HTTPClient {
  private options: ClientOptions;
  private fetch: GlobalFetch['fetch'];
  private allowAuthDefault = false;
  private clientIndex = 0;

  constructor(options: ClientOptions) {
    this.options = options;
    this.fetch = options.fetchOverride ?? createFetchProxy();

    if (!options?.host) {
      clientCount++;
      this.clientIndex = clientCount;

      // if no host, assume the client is for our own server and default to
      // allowing the token with any request regardless of specifically
      // requesting auth (gotosocial workaround)
      this.allowAuthDefault = true;
    }
  }

  get host() {
    return this.options.host;
  }

  set token(token: string) {
    console.log('set token for client index', this.clientIndex);
    this.options.token = token;
  }

  set host(host: string) {
    this.options.host = host;
  }

  async authedPost(info: RequestInfo, extra?: RequestInit) {
    this.assertToken(info);
    return this.post(info, {
      ...extra,
      headers: {
        ...extra?.headers,
        Authorization: `Bearer ${this.options.token}`,
      },
    });
  }

  async authedGet(info: RequestInfo, extra?: RequestInit) {
    this.assertToken(info);
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
    console.log('get', this.host, info, this.clientIndex);
    if (this.options.token && this.allowAuthDefault) {
      return this.req(info, {
        ...extra,
        method: 'GET',
        headers: {
          ...extra?.headers,
          Authorization: `Bearer ${this.options.token}`,
        },
      });
    }
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

  private assertToken(info?: RequestInfo) {
    if (!this.options.token) {
      throw new Error('Token required for operation: ' + info);
    }
  }

  private url(path: string) {
    const {host, pathBase} = this.options;

    if (path.startsWith(`https://${host}`)) {
      return path;
    }

    let usedPath = path;
    if (usedPath[0] === '/') {
      return `https://${host}${path}`;
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
