import {observable} from '@legendapp/state';
import {TStatusMapped} from '../types';

type StatusId = string;
type StatusLookup = Record<StatusId, TStatusMapped | undefined>;

const statuses = observable<StatusLookup>({});

export const getStatus = (statusId: string) => statuses[statusId].get();
