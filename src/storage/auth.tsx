import React, {createContext, ReactNode, useContext, useState} from 'react';
import {MMKV} from 'react-native-mmkv';
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
}

const AuthContext = createContext<Auth>({setAuth: () => {}});

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
  const [auth, setAuth] = useState<{
    userIdent?: string;
    token?: string;
    app?: TApp;
  }>(rehydrateAuth());
  return (
    <AuthContext.Provider
      value={{
        ...auth,
        setAuth: ({user, host, oauthApp, tokenResult}) => {
          const userIdent = `${user}@${host}`;
          setAuth({token: tokenResult.access_token, app: oauthApp});
          setUserAuth(userIdent, tokenResult);
          setActiveApp(host);
          setActiveUser(userIdent);
        },
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
