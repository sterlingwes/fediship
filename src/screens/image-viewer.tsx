import {ReactNativeZoomableView} from '@openspacelabs/react-native-zoomable-view';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import Video from 'react-native-video';
import {SafeAreaView} from 'react-native-safe-area-context';
import {OutlineButton} from '../components/OutlineButton';
import {RedundantImage} from '../components/RedundantImage';
import {screenHeight, screenWidth} from '../dimensions';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {RootStackParamList} from '../types';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {Box} from '../components/Box';
import {Type} from '../components/Type';

const ZoomPanView = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style: ViewStyle;
}) => (
  <ReactNativeZoomableView
    style={style}
    maxZoom={3}
    minZoom={0.5}
    initialZoom={1}
    bindToBorders>
    {children}
  </ReactNativeZoomableView>
);

const imagePadding = 20;

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
  const Wrapper = target.type === 'image' ? ZoomPanView : View;

  return (
    <View style={styles.container}>
      <View style={styles.shadowBox} />
      <Box f={1}>
        <Box f={1}>
          <Wrapper style={styles.zoomView}>
            {['video', 'gifv'].includes(target.type) ? (
              <Video
                controls
                repeat={target.type === 'gifv'}
                source={{uri: target.url}}
                poster={target.preview_url}
                posterResizeMode="cover"
                style={{
                  width: screenWidth - imagePadding * 2,
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
            {loading && <LoadingSpinner size="large" style={styles.loading} />}
          </Wrapper>
        </Box>
        <Box style={styles.bottomContainer}>
          <SafeAreaView edges={['bottom']}>
            {!loading && !!target.description && (
              <Box p={12} hMax={150} scroll>
                <Box m={10} mb={40}>
                  <Type center={target.description?.length < 100} scale="S">
                    {target.description}
                  </Type>
                </Box>
              </Box>
            )}
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
            </Box>
          </SafeAreaView>
        </Box>
      </Box>
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
    padding: imagePadding,
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  bottomContainer: {
    backgroundColor: getColor('base'),
  },
  bottomButton: {
    marginHorizontal: 10,
    width: 'auto',
    flex: 1,
  },
});
