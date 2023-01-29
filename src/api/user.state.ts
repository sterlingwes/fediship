import {observable, OpaqueObject} from '@legendapp/state';
import {persistObservable} from '@legendapp/state/persist';
import {TAccount, TApp, TToken} from '../types';

type UserId = string; // account@domain fully qualified
type Host = string;
type UserLookup = Record<UserId, TAccount>;
type AuthUser = {account: TAccount};
type AuthUserLookup = Record<UserId, AuthUser>;
type AuthLookup = Record<UserId, TToken>;
type AppLookup = Record<Host, TApp>;

interface Auth {
  primaryAccountId?: string; // FQN
  primaryApp?: string; // host
  authLookup: AuthLookup;
  appLookup: AppLookup;
}

export const globalUsers = observable<UserLookup>({});

export const globalAuth = observable<Auth>({authLookup: {}, appLookup: {}});
export const globalAuthUsers = observable<AuthUserLookup>({});

if (!__TEST__) {
  persistObservable(globalAuth, {local: 'globalAuth'});
  persistObservable(globalAuthUsers, {local: 'globalAuthUsers'});
}

export interface UserMeta {
  localId: string;
  loading: boolean;
  refreshing: boolean;
  followLoading: boolean;
  followRequested: boolean;
  following: boolean;
  profileSource: 'local' | 'merged' | 'remote'; // default to remote if undefined
  error: OpaqueObject<Error>;
  nextPage: string | undefined | false;
  renderNonce: number; // for forcing re-render
}

type UserMetaLookup = Record<UserId, UserMeta>;

export const userMeta = observable<UserMetaLookup>({});
