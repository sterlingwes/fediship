import {useMyMastodonInstance} from '../api/hooks';
import type {TAccount} from '../types';
import {useMount} from '../utils/hooks';
import {getActiveUserProfile, setActiveUserProfile, useAuth} from './auth';

let cachedProfile: TAccount | undefined;

export const useUserProfile = () => {
  const auth = useAuth();
  const api = useMyMastodonInstance();

  useMount(() => {
    if (cachedProfile || !auth.token || typeof auth.host !== 'string') {
      return;
    }

    const fetchProfile = async () => {
      const user = await api.verifyAuth();
      if (!user) {
        console.error('Could not verifyAuth, logging out');
        auth.clearAuth();
        return;
      }

      cachedProfile = user;
      setActiveUserProfile(user);
    };

    if (!cachedProfile) {
      fetchProfile();
    }
  });

  return getActiveUserProfile();
};
