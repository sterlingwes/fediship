import {observable, OpaqueObject} from '@legendapp/state';
import {TAccount} from '../types';

type UserId = string; // account@domain fully qualified
type UserLookup = Record<UserId, TAccount>;

export const globalUsers = observable<UserLookup>({});

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
