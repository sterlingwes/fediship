import {observable} from '@legendapp/state';
import {TStatusMapped} from '../types';

type StatusId = string; // url or uri
type StatusLookup = Record<StatusId, TStatusMapped>;

export const globalStatuses = observable<StatusLookup>({});

interface StatusMeta {
  loadingFav: boolean;
  loadingReblog: boolean;
  loadingBookmark: boolean;
}

type StatusMetaLookup = Record<StatusId, StatusMeta>;

export const globalStatusMeta = observable<StatusMetaLookup>({});
