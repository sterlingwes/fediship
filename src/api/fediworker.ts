import {HTTPClient} from './http-client';

interface ClientOptions {
  host?: string;
  pathBase?: string;
  apiVersion?: number;
}

export class FediWorkerApiClient extends HTTPClient {
  private clientOptions: ClientOptions | undefined;

  constructor(options?: ClientOptions) {
    super({
      host: options?.host ?? 'fediship.app',
      pathBase: options?.pathBase ?? `/api/v${options?.apiVersion ?? 1}`,
    });
    this.clientOptions = options;
  }

  async sendError(e: Error, tags?: Record<string, any>) {
    const response = await this.post(
      'errors',
      this.json({message: e.message, stack: e.stack, ...tags}),
    );

    if (!response.ok || !response.body.saved) {
      return false;
    }

    return true;
  }
}
