import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import {MMKV} from 'react-native-mmkv';

import {readJson} from './utils';

const SavedTimelineContext = createContext({
  timelines: [] as SavedTimeline[],
  addSavedTimeline: (_: SavedTimeline) => {},
  changeTimelineHost: (_: string, __: SavedTimeline) => {},
  clearAllSavedTimelines: () => {},
  softDeleteSavedTimeline: (_: string) => {},
});

export interface SavedTimeline {
  name: string; // #hashtag host.uri
  tag?: {tag: string; host: string};
  type?: 'home' | 'public';
  deleted?: boolean;
}

const storage = new MMKV({id: 'timelines'});
const timelineListKey = 'timeline_list';
const lastPickedPeer = 'last_peer';

export const getPickedPeer = () => storage.getString(lastPickedPeer);
export const setPickedPeer = (host: string) =>
  storage.set(lastPickedPeer, host);

const defaultTimelines = [
  {name: 'Local', type: 'home'},
  {name: 'Federated', type: 'public'},
] as SavedTimeline[];

const getInitialTimelines = () => {
  const saved = readJson(
    timelineListKey,
    storage,
    defaultTimelines,
  ) as SavedTimeline[];
  if (!saved.length) {
    return defaultTimelines;
  }

  const uniqueNames = new Set<string>();
  return saved.filter(tl => {
    if (uniqueNames.has(tl.name)) {
      return false;
    }

    uniqueNames.add(tl.name);
    return true;
  });
};

export const SavedTimelineProvider = ({children}: {children: ReactNode}) => {
  const [timelines, setTimelines] = useState<SavedTimeline[]>(
    getInitialTimelines(),
  );

  const addSavedTimeline = useCallback(
    (newTimeline: SavedTimeline) => {
      const newTimelines = timelines.concat(newTimeline);
      setTimelines(newTimelines);
      storage.set(timelineListKey, JSON.stringify(newTimelines));
    },
    [timelines, setTimelines],
  );

  const softDeleteSavedTimeline = useCallback(
    (timelineName: string) => {
      const index = timelines.findIndex(tl => tl.name === timelineName);
      if (index !== -1) {
        const newTimelines = [
          ...timelines.slice(0, index),
          {...timelines[index], deleted: true},
          ...timelines.slice(index + 1),
        ];
        setTimelines(newTimelines);
        storage.set(timelineListKey, JSON.stringify(newTimelines));
      }
    },
    [setTimelines, timelines],
  );

  const changeTimelineHost = useCallback(
    (outgoingTimelineName: string, newTimeline: SavedTimeline) => {
      const outgoingIndex = timelines.findIndex(
        tl => tl.name === outgoingTimelineName,
      );
      if (outgoingIndex !== -1) {
        const newTimelines = [
          ...timelines.slice(0, outgoingIndex),
          {...timelines[outgoingIndex], deleted: true},
          ...timelines.slice(outgoingIndex + 1),
          newTimeline,
        ];
        setTimelines(newTimelines);
        storage.set(timelineListKey, JSON.stringify(newTimelines));
      }
    },
    [timelines, setTimelines],
  );

  const clearAllSavedTimelines = useCallback(() => {
    setTimelines(defaultTimelines);
    storage.set(timelineListKey, JSON.stringify(defaultTimelines));
  }, [setTimelines]);

  return (
    <SavedTimelineContext.Provider
      value={{
        timelines,
        addSavedTimeline,
        changeTimelineHost,
        clearAllSavedTimelines,
        softDeleteSavedTimeline,
      }}>
      {children}
    </SavedTimelineContext.Provider>
  );
};

export const useSavedTimelines = () => {
  const contextValue = useContext(SavedTimelineContext);
  return contextValue;
};
