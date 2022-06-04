import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import {MMKV} from 'react-native-mmkv';
import {useMyMastodonInstance} from '../api/hooks';
import {MastodonApiClient} from '../api/mastodon';
import {TAccount, TApp, TToken} from '../types';

import {readJson} from './utils';

const appStorage = new MMKV({id: 'oauth_apps'});

export const getClientApp = (host: string) => readJson<TApp>(host, appStorage);

export const setClientApp = (host: string, app: TApp) =>
  appStorage.set(host, JSON.stringify(app));

const authStorage = new MMKV({id: 'oauth_users'});

export const getUserAuth = (user: string) =>
  readJson<TToken>(user, authStorage);

export const setUserAuth = (user: string, tokenResult: TToken) =>
  authStorage.set(user, JSON.stringify(tokenResult));

export const clearUserAuth = (user: string) => authStorage.delete(user);

const activeStorage = new MMKV({id: 'active'});
export const getActiveUser = () => activeStorage.getString('user');
export const setActiveUser = (user: string) => activeStorage.set('user', user);
export const getActiveApp = () => activeStorage.getString('app');
export const setActiveApp = (appHost: string) =>
  activeStorage.set('app', appHost);
export const clearActiveAuth = () => {
  activeStorage.delete('app');
  activeStorage.delete('user');
};
export const setActiveUserProfile = (user: TAccount) =>
  activeStorage.set('user_profile', JSON.stringify(user));
export const getActiveUserProfile = () =>
  readJson<TAccount>('user_profile', activeStorage);

interface SetAuthParams {
  user?: string;
  host?: string;
  oauthApp?: TApp;
  tokenResult?: TToken;
}
interface Auth {
  app?: TApp;
  host?: string;
  token?: string;
  userIdent?: string;
  setAuth: ({user, host, oauthApp, tokenResult}: SetAuthParams) => void;
  clearAuth: () => Promise<boolean | undefined>;
}

const AuthContext = createContext<Auth>({
  setAuth: () => {},
  clearAuth: () => Promise.resolve(undefined),
});

const rehydrateAuth = (api: MastodonApiClient) => {
  const activeApp = getActiveApp();
  const activeUser = getActiveUser();

  if (!activeApp || !activeUser) {
    return {};
  }

  const userIdent = `${activeUser}@${activeApp}`;
  const host = activeApp;
  const userAuth = getUserAuth(activeUser);
  const userProfile = getActiveUserProfile();
  const token = userAuth?.access_token;
  const actorId = userProfile?.id;

  if (host && token) {
    api.host = host;
    api.token = token;
    api.actorId = actorId;
  }

  return {
    app: getClientApp(activeApp),
    token,
    host,
    userIdent,
  };
};

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const api = useMyMastodonInstance();
  const [auth, setAuthState] = useState<{
    userIdent?: string;
    token?: string;
    host?: string;
    app?: TApp;
  }>(rehydrateAuth(api));

  const setAuth = useCallback(
    ({user, host, oauthApp, tokenResult}: SetAuthParams) => {
      const userIdent = `${user}@${host}`;
      setAuthState({token: tokenResult?.access_token, app: oauthApp});
      if (user && tokenResult && host) {
        setUserAuth(userIdent, tokenResult);
        setActiveApp(host);
        setActiveUser(userIdent);
      }
    },
    [setAuthState],
  );

  const clearAuth = useCallback(async () => {
    const activeUser = getActiveUser();

    if (
      !activeUser ||
      !auth.userIdent ||
      !auth.token ||
      !auth.app ||
      !auth.host
    ) {
      console.warn('Could not clear auth, missing required dependencies');
      return;
    }

    const {
      app: {client_id, client_secret},
      token,
    } = auth;

    const loggedOut = await api.logout({
      client_id,
      client_secret,
      token,
    });
    if (!loggedOut) {
      return false;
    }

    clearUserAuth(activeUser ?? auth.userIdent);
    setAuth({});
    clearActiveAuth();
    return true;
  }, [auth, setAuth, api]);

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        setAuth,
        clearAuth,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
