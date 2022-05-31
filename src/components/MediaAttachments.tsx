import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Video from 'react-native-video';
import React, {useState} from 'react';
import {Image, ImageStyle, Pressable, StyleSheet, View} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {RootStackParamList, TMediaAttachment} from '../types';
import {Type} from './Type';
import {PlayCircleIcon} from './icons/PlayCircleIcon';

const dimensProps = ({width, height}: TMediaAttachment['meta']['small']) => ({
  width,
  height,
});

const Media = (
  props: TMediaAttachment & {imageStyle?: ImageStyle; onOpenImage: () => void},
) => {
  const [vidPaused, setVidPaused] = useState(true);
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();

  const onPlay = () => {
    setVidPaused(!vidPaused);
  };

  const componentForType = (type: TMediaAttachment['type']) => {
    switch (type) {
      case 'image':
        return (
          <Pressable style={styles.mediaThumbnail} onPress={props.onOpenImage}>
            <Image
              source={{
                uri: props.preview_url,
                ...dimensProps(props.meta.small),
              }}
              style={[styles.previewImage, props.imageStyle]}
            />
          </Pressable>
        );
      case 'gifv':
        return (
          <Pressable style={styles.mediaThumbnail} onPress={onPlay}>
            <Video
              repeat
              paused={vidPaused}
              source={{uri: props.url}}
              style={[styles.video, props.imageStyle]}
            />
            <View style={styles.mediaPlayableIcon}>
              <PlayCircleIcon color={getColor('contrastTextColor')} />
            </View>
          </Pressable>
        );
      case 'video':
        return (
          <Pressable style={styles.mediaThumbnail} onPress={onPlay}>
            <Video
              paused={vidPaused}
              onEnd={() => setVidPaused(true)}
              source={{uri: props.url}}
              style={[styles.video, props.imageStyle]}
            />
            <View style={styles.mediaPlayableIcon}>
              <PlayCircleIcon color={getColor('contrastTextColor')} />
            </View>
          </Pressable>
        );
      default:
        return null;
    }
  };

  return <View>{componentForType(props.type)}</View>;
};

export const MediaAttachments = (props: {media: TMediaAttachment[]}) => {
  const styles = useThemeStyle(styleCreator);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const onOpenImage = (index: number) =>
    navigation.navigate('ImageViewer', {index, attachments: props.media});

  if (props.media.length === 1) {
    return (
      <View style={styles.mediaTwo}>
        <View key={props.media[0].id} style={styles.flexColumn}>
          <Media
            {...{
              ...props.media[0],
              onOpenImage: () => onOpenImage(0),
            }}
          />
        </View>
      </View>
    );
  }

  if (props.media.length === 2) {
    return (
      <View style={styles.mediaTwo}>
        {props.media.map((attachment, i) => (
          <View key={attachment.id} style={styles.flexColumn}>
            <Media {...{...attachment, onOpenImage: () => onOpenImage(i)}} />
          </View>
        ))}
      </View>
    );
  }

  if (props.media.length === 3) {
    const [first, second, third] = props.media;
    return (
      <View style={[styles.mediaCluster]}>
        <View style={styles.mediaRow}>
          <View style={styles.flexColumn}>
            <View key={first.id} style={styles.flexColumn}>
              <Media
                {...{...first, onOpenImage: () => onOpenImage(0)}}
                imageStyle={styles.previewImageSpanTwoRows}
              />
            </View>
          </View>
          <View style={styles.flexColumn}>
            {[second, third].map((attachment, i) => (
              <View style={styles.flexColumn}>
                <Media
                  {...{...attachment, onOpenImage: () => onOpenImage(i + 1)}}
                  imageStyle={styles.previewImageTwoRows}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (props.media.length >= 4) {
    const [first, second, third, fourth] = props.media;
    return (
      <View style={styles.mediaCluster}>
        <View style={styles.mediaRow}>
          {[first, second].map((attachment, i) => (
            <View key={attachment.id} style={styles.flexColumn}>
              <Media
                {...{...attachment, onOpenImage: () => onOpenImage(i)}}
                imageStyle={styles.previewImageTwoRows}
              />
            </View>
          ))}
        </View>
        <View style={styles.mediaRow}>
          {[third, fourth].map((attachment, i) => (
            <View key={attachment.id} style={styles.flexColumn}>
              <Media
                {...{...attachment, onOpenImage: () => onOpenImage(i + 2)}}
                imageStyle={styles.previewImageTwoRows}
              />
              {props.media.length > 4 && i === 1 && (
                <View style={styles.moreCount}>
                  <View style={styles.moreCountOverlay} />
                  <Type scale="XL">{`+${props.media.length - 4}`}</Type>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.media}>
      {props.media.map((attachment, i) => (
        <Media
          key={attachment.id}
          {...{...attachment, onOpenImage: () => onOpenImage(i)}}
        />
      ))}
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  media: {
    overflow: 'hidden',
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mediaCluster: {
    overflow: 'hidden',
    marginTop: 10,
    borderRadius: 10,
  },
  mediaRow: {
    flex: 1,
    flexDirection: 'row',
  },
  mediaTwo: {
    overflow: 'hidden',
    marginTop: 10,
    flexDirection: 'row',
    borderRadius: 8,
  },
  flexColumn: {
    flex: 1,
  },
  previewImage: {
    height: 125,
    width: '100%',
    resizeMode: 'cover',
  },
  video: {
    height: 150,
    width: '100%',
  },
  previewImageTwoRows: {
    height: 75,
  },
  previewImageSpanTwoRows: {
    height: 152,
  },
  mediaThumbnail: {
    flex: 1,
    overflow: 'hidden',
    maxWidth: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
    marginBottom: 2,
  },
  mediaPlayableIcon: {
    position: 'absolute',
    backgroundColor: getColor('baseTextColor'),
    borderRadius: 24 / 2,
  },
  moreCount: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreCountOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    opacity: 0.4,
  },
});
