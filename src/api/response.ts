export class ApiResponse {
  private response: Response;
  private json: any;
  private text: string | undefined;
  private jsonParseFailed = false;

  constructor(response: Response) {
    this.response = response;
  }

  get ok() {
    return this.response.ok;
  }

  get body() {
    return this.json;
  }

  get status() {
    return this.response.status;
  }

  get pageInfo() {
    const linkHeader = this.response.headers.get('link');
    if (!linkHeader) {
      return;
    }

    return this.parseHeaderLink(linkHeader);
  }

  get contentType() {
    return this.response.headers.get('Content-Type') || 'unknown';
  }

  async parseBody() {
    if (this.contentType.includes('text/plain')) {
      const textResponse = await this.response.text();
      this.text = textResponse;
      this.jsonParseFailed = true;
      return;
    }

    try {
      this.json = await this.response.json();
    } catch (e) {
      this.jsonParseFailed = true;
    }
    return this.json;
  }

  async hasError(errorMessage: string) {
    const body = await this.parseAndAssertStandardJsonError();
    return body.error.includes(errorMessage);
  }

  async getError() {
    const body = await this.parseAndAssertStandardJsonError();
    return body.error;
  }

  private async parseAndAssertStandardJsonError() {
    if (!this.body && !this.jsonParseFailed) {
      await this.parseBody();
    }

    const contentType = this.contentType;

    if (this.text) {
      throw new Error(`${this.response.status}: ${this.text.slice(0, 1000)}`);
    }

    if (this.jsonParseFailed && contentType.includes('json')) {
      throw new Error(
        'JSON parse failed for response to: ' + this.response.url,
      );
    }

    if (!this.body || typeof this.body.error !== 'string') {
      return {error: `Unexpected error received (${this.status})`};
    }

    return this.body;
  }

  /**
   * parses strings in the format of:
   * <https://example.com/api/v1/accounts/2/following?max_id=6>; rel="next", <https://example.com/api/v1/accounts/2/following?since_id=61>; rel="prev"
   */
  private parseHeaderLink(linkHeaderValue: string | undefined | null) {
    if (!linkHeaderValue) {
      return {};
    }

    const parts = linkHeaderValue.split(/[<>,;\s]+/);
    parts.shift(); // blank string
    if (parts.length === 4) {
      const [next, , prev] = parts;
      return {
        next,
        prev,
      };
    }

    return {
      prev: parts[0],
    };
  }
}
