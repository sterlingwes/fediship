export class ApiResponse {
  private response: Response;
  private json: Record<string, any> | undefined;
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

  async parseBody() {
    try {
      this.json = await this.response.json();
    } catch (e) {
      this.jsonParseFailed = true;
    }
    return this.json;
  }

  async hasError(errorMessage: string) {
    if (!this.body && !this.jsonParseFailed) {
      await this.parseBody();
    }

    if (this.jsonParseFailed) {
      throw new Error(
        'JSON parse failed for response to: ' + this.response.url,
      );
    }

    if (!this.body) {
      throw new Error('No JSON body parsed to check errors against');
    }

    if (typeof this.body.error !== 'string') {
      throw new Error('Unexpected error response');
    }

    return this.body.error.includes(errorMessage);
  }
}
