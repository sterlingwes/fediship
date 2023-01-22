import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {ComponentProps, forwardRef, useMemo} from 'react';
import {useFavourites} from '../../api';
import {Status} from '../../components/Status';
import {LegacyStatusList} from '../../components/LegacyStatusList';
import {RootStackParamList} from '../../types';
import {useMount} from '../../utils/hooks';

export const FavouritesTimeline = forwardRef(
  (
    {
      navigation,
      route,
    }: NativeStackScreenProps<RootStackParamList, 'FavouritesTimeline'>,
    ref,
  ) => {
    const {type} = route.params;
    const timeline = useFavourites(type);

    useMount(() => {
      navigation.setOptions({
        headerTitle: type === 'favourites' ? 'Favorites' : 'Bookmarks',
      });
    });

    const reloadCallbacks = useMemo((): Partial<
      ComponentProps<typeof Status>
    > => {
      if (type === 'bookmarks') {
        return {
          onPressBookmark: () => timeline.fetchTimeline(true),
        };
      }

      if (type === 'favourites') {
        return {
          onPressFavourite: () => timeline.fetchTimeline(true),
        };
      }

      return {};
    }, [type, timeline]);

    return (
      <LegacyStatusList
        {...timeline}
        statusOverrides={reloadCallbacks}
        ref={ref}
      />
    );
  },
);
