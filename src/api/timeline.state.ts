import {observable} from '@legendapp/state';

type TimelineId = string;
type TimelineLookup = Record<TimelineId, string[] | undefined>;

const timelines = observable<TimelineLookup>({});

export const getTimeline = (timelineId: string) => timelines[timelineId].get();
