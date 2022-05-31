import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import {MMKV} from 'react-native-mmkv';
import {useMyMastodonInstance} from '../api/hooks';
import {TApp, TToken} from '../types';

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

interface Auth {
  app?: TApp;
  token?: string;
  userIdent?: string;
  setAuth: ({
    user,
    host,
    oauthApp,
    tokenResult,
  }: {
    user: string;
    host: string;
    oauthApp: TApp;
    tokenResult: TToken;
  }) => void;
  clearAuth: () => Promise<boolean | undefined>;
}

const AuthContext = createContext<Auth>({
  setAuth: () => {},
  clearAuth: () => Promise.resolve(undefined),
});

const rehydrateAuth = () => {
  const activeApp = getActiveApp();
  const activeUser = getActiveUser();

  if (!activeApp || !activeUser) {
    return {};
  }

  const userIdent = `${activeUser}@${activeApp}`;

  return {
    app: getClientApp(activeApp),
    token: getUserAuth(activeUser)?.access_token,
    userIdent,
  };
};

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const api = useMyMastodonInstance();
  const [auth, setAuthState] = useState<{
    userIdent?: string;
    token?: string;
    app?: TApp;
  }>(rehydrateAuth());

  const setAuth = useCallback(
    ({user, host, oauthApp, tokenResult}) => {
      const userIdent = `${user}@${host}`;
      setAuthState({token: tokenResult.access_token, app: oauthApp});
      setUserAuth(userIdent, tokenResult);
      setActiveApp(host);
      setActiveUser(userIdent);
    },
    [setAuthState],
  );

  const clearAuth = useCallback(async () => {
    const activeUser = getActiveUser();

    if (!activeUser || !auth.userIdent || !auth.token || !auth.app) {
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
