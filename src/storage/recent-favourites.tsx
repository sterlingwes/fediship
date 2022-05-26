import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

/**
 * in-memory storage of favourites for keeping UI
 * in sync across screens
 *
 * ultimately the server is the source of truth for
 * whether a thing was favourited, but we can optimistically
 * reflect when a favourite has been sent
 */

const FavouriteContext = createContext({
  favourites: {} as FavouritesMap,
  trackStatusFavourite: (_: string, __?: boolean) => {},
});

// keyed by local status url
type FavouritesMap = Record<string, boolean>;

export const FavouritesProvider = ({children}: {children: ReactNode}) => {
  const [favourites, setFavourites] = useState<FavouritesMap>({});

  const trackStatusFavourite = useCallback(
    (localStatusUrl: string, favourited = true) => {
      favourites[localStatusUrl] = favourited;
      setFavourites({
        ...favourites,
        [localStatusUrl]: favourited,
      });
    },
    [favourites, setFavourites],
  );

  return (
    <FavouriteContext.Provider value={{favourites, trackStatusFavourite}}>
      {children}
    </FavouriteContext.Provider>
  );
};

export const useRecentFavourites = () => {
  const contextValue = useContext(FavouriteContext);
  return contextValue;
};
