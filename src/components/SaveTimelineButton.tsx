import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {SavedTimeline, useSavedTimelines} from '../storage/saved-timelines';
import {RootStackParamList} from '../types';
import {HeaderRightButton} from './HeaderRightButton';
import {MinusCircleIcon} from './icons/MinusCircleIcon';
import {PlusCircleIcon} from './icons/PlusCircleIcon';

export const SaveTimelineButton = ({
  params,
  nextRoute,
}: {
  params: SavedTimeline;
  nextRoute?: keyof RootStackParamList;
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {timelines, addSavedTimeline, removeSavedTimeline} =
    useSavedTimelines();
  const [added, setAdded] = useState(
    !!timelines.find(tl => tl.name === params.name),
  );
  const onPress = () => {
    if (added) {
      removeSavedTimeline(params.name, () => {
        const next = nextRoute ?? ('Local' as keyof RootStackParamList);
        navigation.navigate(next);
      });
      return;
    }

    setAdded(!added);
    addSavedTimeline(params);
  };
  const Icon = added ? MinusCircleIcon : PlusCircleIcon;
  return <HeaderRightButton onPress={onPress} IconComponent={Icon} />;
};
