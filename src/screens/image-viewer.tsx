import {ReactNativeZoomableView} from '@openspacelabs/react-native-zoomable-view';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import Video from 'react-native-video';
import {SafeAreaView} from 'react-native-safe-area-context';
import {OutlineButton} from '../components/OutlineButton';
import {RedundantImage} from '../components/RedundantImage';
import {screenHeight, screenWidth} from '../dimensions';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {RootStackParamList} from '../types';

export const ImageViewer = (
  props: NativeStackScreenProps<RootStackParamList, 'ImageViewer'>,
) => {
  const [loading, setLoading] = useState(false);
  const styles = useThemeStyle(styleCreator);
  const {index, attachments} = props.route.params;
  const [currentIndex, setIndex] = useState(index);

  const onPrevious = () => {
    setIndex(currentIndex - 1);
  };

  const onNext = () => {
    setIndex(currentIndex + 1);
  };

  const target = attachments[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.shadowBox} />
      <ReactNativeZoomableView
        style={styles.zoomView}
        maxZoom={3}
        minZoom={0.5}
        initialZoom={1}
        zoomEnabled={target.type !== 'video'}
        bindToBorders>
        {['video', 'gifv'].includes(target.type) ? (
          <Video
            controls
            repeat={target.type === 'gifv'}
            source={{uri: target.url}}
            poster={target.preview_url}
            posterResizeMode="cover"
            style={{
              width: screenWidth,
              aspectRatio:
                target.meta.original.width / target.meta.original.height,
            }}
          />
        ) : (
          <RedundantImage
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            source={{uri: target.url}}
            fallbackUri={target.remote_url}
            style={styles.img}
          />
        )}
        {loading && <ActivityIndicator size="large" style={styles.loading} />}
      </ReactNativeZoomableView>
      <SafeAreaView edges={['bottom']} style={styles.button}>
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
          Close
        </OutlineButton>
        {attachments.length > 1 && (
          <OutlineButton
            onPress={onNext}
            style={styles.bottomButton}
            disabled={!attachments[currentIndex + 1]}>
            Next
          </OutlineButton>
        )}
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
  zoomView: {
    flex: 1,
    padding: 20,
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomButton: {
    marginHorizontal: 10,
    width: 'auto',
    flex: 1,
  },
});
