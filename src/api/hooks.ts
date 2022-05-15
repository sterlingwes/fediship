import {useRef} from 'react';
import {mastoBearerToken, mastoHost} from '../constants';
import {MastodonApiClient} from './mastodon';

export const useMyMastodonInstance = () => {
  const api = useRef(
    new MastodonApiClient({host: mastoHost, token: mastoBearerToken}),
  );

  return api.current;
};
