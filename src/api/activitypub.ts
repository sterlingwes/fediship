import {HTTPClient} from './http-client';

import {APPerson, TStatus, Webfinger} from '../types';

import {
  isOrderedCollection,
  isOutboxCollection,
  isPerson,
  transformActivity,
  transformActivityPage,
  transformPerson,
} from '../utils/activitypub';

interface ClientOptions {
  host: string;
}

export class ActivityPubClient extends HTTPClient {
  constructor(options: ClientOptions) {
    super({
      host: options.host,
      acceptHeader: 'application/activity+json',
    });
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

      if (!result.ok) {
        const error = await result.getError();
        throw new Error(error ?? 'Failed to fetch remote profile');
      }

      if (isPerson(result.body)) {
        const account = transformPerson(
          profileLink.href,
          result.body as APPerson,
        );
        const outboxUrl = `${result.body.outbox}?page=true`;
        const activityPage = await this.get(outboxUrl);
        let timeline: TStatus[] = [];
        if (isOutboxCollection(activityPage.body)) {
          timeline = transformActivityPage(activityPage.body, account);
        }

        const featuredCollection = await this.get(result.body.featured);
        if (isOrderedCollection(featuredCollection.body)) {
          timeline = featuredCollection.body.orderedItems
            .map(item => transformActivity(item, {account, pinned: true}))
            .concat(timeline);
        }

        return {
          account,
          timeline,
        };
      }
    }
  }

  async getWebfinger(host: string, accountHandle: string) {
    const response = await this.get(
      `https://${host}/.well-known/webfinger?resource=acct:${accountHandle}@${host}`,
    );
    if (!response.ok) {
      return;
    }
    return response.body as Webfinger;
  }
}
