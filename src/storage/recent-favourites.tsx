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
  reblogs: {} as FavouritesMap,
  trackReblog: (_: string, __?: boolean) => {},
  bookmarks: {} as FavouritesMap,
  trackBookmark: (_: string, __?: boolean) => {},
});

// keyed by local status url
type FavouritesMap = Record<string, boolean>;

export const FavouritesProvider = ({children}: {children: ReactNode}) => {
  const [favourites, setFavourites] = useState<FavouritesMap>({});
  const [reblogs, setReblogs] = useState<FavouritesMap>({});
  const [bookmarks, setBookmarks] = useState<FavouritesMap>({});

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

  const trackReblog = useCallback(
    (localStatusUrl: string, favourited = true) => {
      reblogs[localStatusUrl] = favourited;
      setReblogs({
        ...reblogs,
        [localStatusUrl]: favourited,
      });
    },
    [reblogs, setReblogs],
  );

  const trackBookmark = useCallback(
    (localStatusUrl: string, favourited = true) => {
      bookmarks[localStatusUrl] = favourited;
      setBookmarks({
        ...bookmarks,
        [localStatusUrl]: favourited,
      });
    },
    [bookmarks, setBookmarks],
  );

  return (
    <FavouriteContext.Provider
      value={{
        favourites,
        reblogs,
        bookmarks,
        trackStatusFavourite,
        trackReblog,
        trackBookmark,
      }}>
      {children}
    </FavouriteContext.Provider>
  );
};

export const useRecentFavourites = () => {
  const contextValue = useContext(FavouriteContext);
  return contextValue;
};
