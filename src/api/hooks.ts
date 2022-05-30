import {useRef} from 'react';
import {mastoActorId, mastoHost} from '../constants';
import {useAuth} from '../storage/auth';
import {ActivityPubClient} from './activitypub';
import {FediWorkerApiClient} from './fediworker';
import {MastodonApiClient} from './mastodon';

export const useMyMastodonInstance = () => {
  const auth = useAuth();
  const api = useRef(
    new MastodonApiClient({
      host: mastoHost,
      token: auth.token,
      actorId: mastoActorId,
    }),
  );

  return api.current;
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

export const useWorkerApi = () => {
  return new FediWorkerApiClient();
};
