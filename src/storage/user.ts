import {useMyMastodonInstance} from '../api/hooks';
import {useMount} from '../utils/hooks';
import {getActiveUserProfile, setActiveUserProfile, useAuth} from './auth';

let lastSavedProfile: number | undefined;

export const useUserProfile = () => {
  const auth = useAuth();
  const api = useMyMastodonInstance();

  useMount(() => {
    if (lastSavedProfile || !auth.token || typeof auth.host !== 'string') {
      return;
    }

    const fetchProfile = async () => {
      const user = await api.verifyAuth();
      if (!user) {
        console.error('Could not verifyAuth, logging out');
        auth.clearAuth();
        return;
      }

      setActiveUserProfile(user);
    };

    fetchProfile();
  });

  return getActiveUserProfile();
};
