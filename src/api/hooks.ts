import {ActivityPubClient} from './activitypub';
import {FediWorkerApiClient} from './fediworker';
import {MastodonApiClient} from './mastodon';
import {useMastodonApi} from './mastodon-context';

export const useMyMastodonInstance = () => {
  return useMastodonApi();
};

export const useRemoteMastodonInstance = () => {
  return (host: string) => {
    return new MastodonApiClient({host});
  };
};

export const useRemoteActivityPubInstance = () => {
  return (host: string) => {
    return new ActivityPubClient({host});
  };
};

export const useWorkerApi = (
  {host, pathBase}: {host?: string; pathBase?: string} = {host: undefined},
) => {
  return new FediWorkerApiClient({host, pathBase});
};
