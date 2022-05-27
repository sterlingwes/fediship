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

export const SavedTimelineProvider = ({children}: {children: ReactNode}) => {
  const [timelines, setTimelines] = useState<SavedTimeline[]>(
    readJson(timelineListKey, storage, defaultTimelines),
  );

  const addSavedTimeline = useCallback(
    (newTimeline: SavedTimeline) => {
      const newTimelines = timelines.concat(newTimeline);
      setTimelines(newTimelines);
      storage.set(timelineListKey, JSON.stringify(newTimelines));
    },
    [timelines, setTimelines],
  );

  return (
    <SavedTimelineContext.Provider value={{timelines, addSavedTimeline}}>
      {children}
    </SavedTimelineContext.Provider>
  );
};

export const useSavedTimelines = () => {
  const contextValue = useContext(SavedTimelineContext);
  return contextValue;
};
