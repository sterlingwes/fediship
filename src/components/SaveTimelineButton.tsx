import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {SavedTimeline, useSavedTimelines} from '../storage/saved-timelines';
import {RootStackParamList} from '../types';
import {HeaderRightButton} from './HeaderRightButton';
import {PlusCircleIcon} from './icons/PlusCircleIcon';
import {SettingsIcon} from './icons/SettingsIcon';

export const SaveTimelineButton = ({
  params,
  nextRoute,
}: {
  params: SavedTimeline;
  nextRoute?: keyof RootStackParamList;
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {timelines, addSavedTimeline} = useSavedTimelines();
  const [added, setAdded] = useState(
    !!timelines.find(tl => tl.name === params.name),
  );
  const onPress = () => {
    if (added) {
      const {host, tag} = params.tag ?? {};
      if (!host || !tag) {
        return;
      }
      const next = nextRoute ?? ('Local' as keyof RootStackParamList);
      navigation.push('TagTimelinePrefs', {
        name: params.name,
        host,
        tag,
        nextRoute: next,
      });
      return;
    }

    setAdded(!added);
    addSavedTimeline(params);
  };
  const Icon = added ? SettingsIcon : PlusCircleIcon;
  return <HeaderRightButton onPress={onPress} IconComponent={Icon} />;
};
