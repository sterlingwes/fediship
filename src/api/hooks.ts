import {useRef} from 'react';
import {mastoActorId, mastoBearerToken, mastoHost} from '../constants';
import {ActivityPubClient} from './activitypub';
import {MastodonApiClient} from './mastodon';

export const useMyMastodonInstance = () => {
  const api = useRef(
    new MastodonApiClient({
      host: mastoHost,
      token: mastoBearerToken,
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
