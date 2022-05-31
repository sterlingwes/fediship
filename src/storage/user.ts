import {useMyMastodonInstance} from '../api/hooks';
import {useMount} from '../utils/hooks';
import {getActiveUserProfile, setActiveUserProfile, useAuth} from './auth';

let lastSavedProfile: number | undefined;

export const useUserProfile = () => {
  const auth = useAuth();
  const api = useMyMastodonInstance();

  useMount(() => {
    if (lastSavedProfile || !auth.token) {
      return;
    }

    const fetchProfile = async () => {
      const response = await api.verifyAuth();
      if (!response) {
        console.error('Could not verifyAuth, logging out');
        auth.clearAuth();
        return;
      }

      setActiveUserProfile(response);
    };

    fetchProfile();
  });

  return getActiveUserProfile();
};
