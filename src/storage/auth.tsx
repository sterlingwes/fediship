import {batch} from '@legendapp/state';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import {useMyMastodonInstance} from '../api/hooks';
import {MastodonApiClient} from '../api/mastodon';
import {globalAuth, globalAuthUsers} from '../api/user.state';
import {TAccount, TApp, TToken} from '../types';
import {getUserFQNFromAccount} from '../utils/mastodon';

export const getClientApp = (host: string) => globalAuth.appLookup[host].peek();

export const setClientApp = (host: string, app: TApp) =>
  globalAuth.appLookup[host].set(app);

export const getUserAuth = (user: string) => globalAuth.authLookup[user].peek();

export const setUserAuth = (user: string, tokenResult: TToken) =>
  globalAuth.authLookup[user].set(tokenResult);

export const clearUserAuth = (user: string) =>
  globalAuth.authLookup[user].delete();

export const getActiveUser = () => globalAuth.primaryAccountId?.peek();
export const setActiveUser = (user: string) =>
  globalAuth.primaryAccountId?.set(user);
export const getActiveApp = () => globalAuth.primaryApp?.peek();
export const setActiveApp = (appHost: string) =>
  globalAuth.primaryApp?.set(appHost);
export const clearActiveAuth = () => {
  batch(() => {
    globalAuth.primaryApp?.delete();
    globalAuth.primaryAccountId?.delete();
  });
};
export const setActiveUserProfile = (user: TAccount) => {
  const primaryId = globalAuth.primaryAccountId?.peek();
  const userIdent = getUserFQNFromAccount(user);
  if (!primaryId) {
    globalAuth.primaryAccountId?.set(userIdent);
  }
  globalAuthUsers[userIdent].account.set(user);
  console.log('set', userIdent, 'as active');
};
export const getActiveUserProfile = () =>
  globalAuthUsers[globalAuth.primaryAccountId?.peek() as string].account.get();

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
      setAuthState({
        token: tokenResult?.access_token,
        app: oauthApp,
        userIdent,
      });
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
