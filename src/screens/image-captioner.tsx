import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {Image, Keyboard, Platform, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {OutlineButton} from '../components/OutlineButton';
import {screenHeight} from '../dimensions';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {RootStackParamList} from '../types';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {Box} from '../components/Box';
import {flex} from '../utils/styles';
import {Input} from '../components/Input';
import {useMount} from '../utils/hooks';

const imagePadding = 20;

const pendingCaptions: Record<string, string> = {};

export const getPendingCaptions = () => pendingCaptions;

export const ImageCaptioner = (
  props: NativeStackScreenProps<RootStackParamList, 'ImageCaptioner'>,
) => {
  const [loading, setLoading] = useState(false);
  const styles = useThemeStyle(styleCreator);
  const {attachments} = props.route.params;
  const [currentIndex, setIndex] = useState(0);
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [captionMap, setCaptionMap] =
    useState<Record<string, string>>(pendingCaptions);

  useMount(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardShown(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardShown(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  });

  const onPrevious = () => {
    setIndex(currentIndex - 1);
  };

  const onNext = () => {
    setIndex(currentIndex + 1);
  };

  const {uri, width, height} = attachments[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.shadowBox} />
      {!keyboardShown && (
        <Box p={imagePadding} style={flex}>
          <Image
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            source={{uri, width, height}}
            style={styles.img}
          />
          {loading && <LoadingSpinner size="large" style={styles.loading} />}
        </Box>
      )}
      <SafeAreaView edges={['top', 'bottom']} style={styles.button}>
        <Box p={12} mb={40}>
          <Input
            multiline
            numberOfLines={2}
            placeholder="Add an image caption"
            onChangeText={text => {
              pendingCaptions[uri] = text;
              setCaptionMap(pendingCaptions);
            }}
            value={captionMap[uri] ?? ''}
          />
        </Box>
        <Box fd="row" ch>
          {attachments.length > 1 && (
            <OutlineButton
              onPress={onPrevious}
              style={styles.bottomButton}
              disabled={!attachments[currentIndex - 1]}>
              Previous
            </OutlineButton>
          )}
          <OutlineButton
            onPress={props.navigation.goBack}
            style={styles.bottomButton}>
            Done
          </OutlineButton>
          {attachments.length > 1 && (
            <OutlineButton
              onPress={onNext}
              style={styles.bottomButton}
              disabled={!attachments[currentIndex + 1]}>
              Next
            </OutlineButton>
          )}
        </Box>
      </SafeAreaView>
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    flex: 1,
  },
  shadowBox: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor('base'),
    opacity: 0.8,
  },
  loading: {
    position: 'absolute',
    top: screenHeight / 2 - 20,
    alignSelf: 'center',
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: getColor('base'),
  },
  bottomButton: {
    marginHorizontal: 10,
    width: 'auto',
    flex: 1,
  },
});
