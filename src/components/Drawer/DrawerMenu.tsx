import React from 'react';
import {DrawerContentComponentProps} from '@react-navigation/drawer';
import {ScrollView, View} from 'react-native';
import {RootStackParamList} from '../../types';
import {DrawerButton} from './DrawerButton';
import {flex} from '../../utils/styles';
import {StyleCreator} from '../../theme';
import {screenHeight} from '../../dimensions';
import {useThemeGetters, useThemeStyle} from '../../theme/utils';
import {tabBarHeight} from '../../constants';
import {SavedTimeline, useSavedTimelines} from '../../storage/saved-timelines';
import {LogoBoat} from '../icons/LogoBoat';
import {Type} from '../Type';
import {PinIcon} from '../icons/PinIcon';
import {GlobeIcon} from '../icons/GlobeIcon';
import {HashtagIcon} from '../icons/HashtagIcon';
import {MapIcon} from '../icons/MapIcon';

const iconForType = (tl: SavedTimeline) => {
  if (tl.type === 'home') {
    return PinIcon;
  }

  if (tl.type === 'public') {
    return GlobeIcon;
  }

  if (tl.tag) {
    return HashtagIcon;
  }

  return null;
};

const iconSize = (size: string) => ({width: size, height: size});

export const DrawerMenu = ({
  navigation,
  state,
}: DrawerContentComponentProps) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  const {timelines} = useSavedTimelines();
  const currentRoute = state.routeNames[state.index];
  const onPress = (route: keyof RootStackParamList) => {
    navigation.navigate(route);
    setTimeout(() => navigation.closeDrawer(), 150);
  };
  const onPressExplore = () => navigation.navigate('Explore');

  return (
    <ScrollView
      style={flex}
      contentContainerStyle={{minHeight: screenHeight - tabBarHeight * 2}}>
      <View style={styles.boatContainer}>
        <LogoBoat size={100} />
        <Type scale="L" bold>
          fediship
        </Type>
      </View>
      <View style={flex} />
      <DrawerButton
        onPress={onPressExplore}
        active={currentRoute === 'Explore'}>
        <MapIcon {...iconSize('14')} color={getColor('baseTextColor')} />
        {'  Explore'}
      </DrawerButton>
      {timelines.map(tl => {
        const Icon = iconForType(tl);
        return (
          <DrawerButton
            key={tl.name}
            active={currentRoute === tl.name}
            onPress={() => onPress(tl.name as keyof RootStackParamList)}>
            {Icon && (
              <Icon {...iconSize('14')} color={getColor('baseTextColor')} />
            )}
            {'  '}
            {tl.name}
          </DrawerButton>
        );
      })}
      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styleCreator: StyleCreator = () => ({
  spacer: {height: 10},
  boatContainer: {
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
});
