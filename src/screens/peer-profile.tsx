import React from 'react';
import {RootStackParamList} from '../types';
import {useMount} from '../utils/hooks';
import {ScrollView, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useThemeStyle} from '../theme/utils';
import {StyleCreator} from '../theme';
import {Type} from '../components/Type';
import {thousandsNumber} from '../utils/numbers';
import {HTMLView} from '../components/HTMLView';
import {AvatarImage} from '../components/AvatarImage';

export const PeerProfile = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'PeerProfile'>) => {
  const styles = useThemeStyle(styleCreator);
  const {title, description, stats, thumbnail, languages} = route.params;

  useMount(() => {
    if (!route.params) {
      return;
    }
    navigation.setOptions({headerTitle: title});
  });

  const Spacer = () => <View style={styles.spacer} />;

  return (
    <ScrollView style={styles.container} contentInset={{bottom: 40}}>
      <AvatarImage uri={thumbnail} style={styles.avatar} />
      <Spacer />
      <Spacer />
      <HTMLView value={description} emojis={[]} />
      <Spacer />
      <Spacer />
      <Type scale="S">Users: {thousandsNumber(stats.user_count)}</Type>
      <Spacer />
      <Type scale="S">Statuses: {thousandsNumber(stats.status_count)}</Type>
      <Spacer />
      <Type scale="S">Domains: {thousandsNumber(stats.domain_count)}</Type>
      <Spacer />
      <Type scale="S">Languages: {languages.join(', ')}</Type>
    </ScrollView>
  );
};

const styleCreator: StyleCreator = () => ({
  container: {
    flex: 1,
    padding: 20,
  },
  spacer: {
    height: 10,
  },
});
