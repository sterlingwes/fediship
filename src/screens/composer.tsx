import React from 'react';
import {ScrollView, View} from 'react-native';
import {Type} from '../components/Type';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {flex} from '../utils/styles';

const TopBanner = () => (
  <View>
    <Type>Compose</Type>
  </View>
);

export const Composer = () => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  return (
    <View style={flex}>
      <TopBanner />
      <ScrollView style={flex}>
        <View />
      </ScrollView>
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {},
});
