import {useNavigation} from '@react-navigation/native';
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
  removeSavedTimeline: (_: string, __: () => void) => {},
});

export interface SavedTimeline {
  name: string; // #hashtag host.uri
  tag?: {tag: string; host: string};
  type?: 'home' | 'public';
}

const storage = new MMKV({id: 'notifications'});
const timelineListKey = 'timeline_list';

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

  return saved;
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

  const removeSavedTimeline = useCallback(
    (timelineName: string, navigateNext: () => void) => {
      const index = timelines.findIndex(tl => tl.name === timelineName);
      if (index !== -1) {
        const newTimelines = [
          ...timelines.slice(0, index),
          ...timelines.slice(index + 1),
        ];
        navigateNext();
        setTimeout(() => {
          setTimelines(newTimelines);
        }, 100);
      }
    },
    [timelines, setTimelines],
  );

  return (
    <SavedTimelineContext.Provider
      value={{timelines, addSavedTimeline, removeSavedTimeline}}>
      {children}
    </SavedTimelineContext.Provider>
  );
};

export const useSavedTimelines = () => {
  const contextValue = useContext(SavedTimelineContext);
  return contextValue;
};
