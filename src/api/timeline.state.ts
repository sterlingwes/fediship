import {observable} from '@legendapp/state';

type TimelineId = string;
type TimelineLookup = Record<TimelineId, string[]>;

export const timelines = observable<TimelineLookup>({});

export interface TimelineMeta {
  loading: boolean;
  error: string;
  nextPage: string | undefined | false;
  renderNonce: number; // for forcing re-render
}

type TimelineMetaLookup = Record<TimelineId, TimelineMeta>;

export const timelineMeta = observable<TimelineMetaLookup>({});
