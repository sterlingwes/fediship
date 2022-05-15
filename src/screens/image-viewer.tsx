import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {Image, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {OutlineButton} from '../components/OutlineButton';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {RootStackParamList} from '../types';

export const ImageViewer = (
  props: NativeStackScreenProps<RootStackParamList, 'ImageViewer'>,
) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <View style={styles.container}>
      <Image source={{uri: props.route.params.url}} style={styles.img} />
      <SafeAreaView edges={['bottom']} style={styles.button}>
        <OutlineButton onPress={props.navigation.goBack}>Close</OutlineButton>
      </SafeAreaView>
    </View>
  );
};

const styleCreator: StyleCreator = () => ({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(10,10,10,0.85)',
  },
  img: {
    flex: 1,
    resizeMode: 'contain',
  },
  button: {
    alignItems: 'center',
  },
});
