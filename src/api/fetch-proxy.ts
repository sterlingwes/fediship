interface FetchProxyOptions {
  authHost?: string;
  onUnauthenticated?: () => void;
  onNoNetwork?: (err: Error) => void;
}

class FetchProxy {
  private options: FetchProxyOptions;

  constructor(options?: FetchProxyOptions) {
    this.options = options ?? {};
  }

  async request(info: RequestInfo, extra?: RequestInit | undefined) {
    let response: Response = new Response();
    try {
      response = await fetch(info, extra);
    } catch (e: unknown) {
      this.handleException(e as Error);
    }

    return response;
  }

  private handleException(err: Error) {
    // TODO: check NetInfo for connectivity
    this.options.onNoNetwork?.(err);
    throw err;
  }
}

let proxy: FetchProxy | undefined;

export const createFetchProxy = (options?: FetchProxyOptions) => {
  if (!proxy) {
    proxy = new FetchProxy(options);
  }

  return proxy.request.bind(proxy);
};
