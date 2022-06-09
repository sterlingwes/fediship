import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {forwardRef} from 'react';
import {useFavourites} from '../../api';
import {StatusList} from '../../components/StatusList';
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

    return <StatusList {...timeline} ref={ref} />;
  },
);
