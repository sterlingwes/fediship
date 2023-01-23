import {observable} from '@legendapp/state';
import {TStatusMapped} from '../types';

type StatusId = string;
type StatusLookup = Record<StatusId, TStatusMapped | undefined>;

export const globalStatuses = observable<StatusLookup>({});
