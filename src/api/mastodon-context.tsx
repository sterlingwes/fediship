import React, {createContext, useContext, useRef} from 'react';
import {MastodonApiClient} from './mastodon';

const MastodonContext = createContext<MastodonApiClient>(
  new MastodonApiClient(),
);

export const MastodonProvider = ({children}: {children: JSX.Element}) => {
  const apiRef = useRef<MastodonApiClient>(new MastodonApiClient());
  return (
    <MastodonContext.Provider value={apiRef.current}>
      {children}
    </MastodonContext.Provider>
  );
};

export const useMastodonApi = () => useContext(MastodonContext);
