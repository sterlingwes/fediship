import {HTTPClient} from './http-client';

import {APPerson, TAccount, TStatusMapped, Webfinger} from '../types';

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

  async getProfileByHandle(
    host: string,
    handle: string,
  ): Promise<
    | {
        ok: true;
        account: TAccount;
        timeline: TStatusMapped[];
        pinnedIds: string[];
        pageInfo: {next: string} | undefined;
      }
    | {ok: false; error: string}
  > {
    const webfinger = await this.getWebfinger(host, handle);
    if (!webfinger) {
      return {
        ok: false,
        error: `Unable to find ${handle}@${host}. Webfinger unresolvable.`,
      };
    }
    const profileLink = webfinger.links.find(
      link => link.rel === 'self' && link.type.includes('json'),
    );
    if (profileLink) {
      const result = await this.get(profileLink.href);

      if (!result.ok) {
        const error = await result.getError();
        return {
          ok: false,
          error: error ?? 'Failed to fetch remote profile',
        };
      } else if (result.status !== 200) {
        return {
          ok: false,
          error: "User's instance does not support the ActivityPub protocol.",
        };
      }

      if (isPerson(result.body)) {
        const account = transformPerson(
          profileLink.href,
          result.body as APPerson,
        );
        const outboxUrl = `${result.body.outbox}?page=true`;
        const tlResult = await this.getProfileTimeline(outboxUrl, account);
        let timeline: TStatusMapped[] = tlResult?.result ?? [];

        const pinnedIds: string[] = [];
        if (result.body.featured) {
          const featuredCollection = await this.get(result.body.featured);
          if (isOrderedCollection(featuredCollection.body)) {
            timeline = featuredCollection.body.orderedItems
              .map(item => {
                pinnedIds.push(item.id);
                return transformActivity(item, {
                  account,
                  host: this.host,
                  pinned: true,
                });
              })
              .concat(
                (tlResult?.result ?? []).filter(
                  toot => !pinnedIds.includes(toot.id),
                ),
              );
          }
        }

        return {
          ok: true,
          account,
          timeline,
          pinnedIds,
          pageInfo: tlResult?.pageInfo,
        };
      }
    }

    return {
      ok: false,
      error: `Unexpected response from ${host}`,
    };
  }

  async getProfileTimeline(outboxPageUrl: string, account: TAccount) {
    const activityPage = await this.get(outboxPageUrl);
    if (isOutboxCollection(activityPage.body)) {
      const {next} = activityPage.body;
      return {
        result: transformActivityPage(activityPage.body, account, this.host),
        pageInfo: {next},
      };
    }

    return;
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
