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
    const accountResult = await this.getAccountByHandle(host, handle);
    if (!accountResult.ok || !accountResult.account) {
      return {ok: false, error: accountResult.error!};
    }

    const {account, outbox, featured} = accountResult;

    try {
      const pinnedIds: string[] = [];
      let timeline: TStatusMapped[] = [];
      let tlResult;

      const outboxUrl = `${outbox}?page=true`;
      tlResult = await this.getProfileTimeline(outboxUrl, account);
      timeline = tlResult?.result ?? [];

      if (!tlResult) {
        return {
          ok: false,
          error: 'No outbox',
        };
      }

      if (featured) {
        const featuredCollection = await this.get(featured);
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
    } catch (e) {
      return {
        ok: false,
        error: (e as Error).message,
      };
    }
  }

  async getAccountByHandle(host: string, handle: string) {
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

    if (!profileLink) {
      return {
        ok: false,
        error: 'Unexpected webfinger response (no profile link)',
      };
    }

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
      return {
        ok: true,
        account: transformPerson(profileLink.href, result.body as APPerson),
        outbox: result.body.outbox,
        featured: result.body.featured,
      };
    }

    return {
      ok: false,
      error: 'Profile link is not a valid AP Person',
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
