import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {Image, ImageStyle, Pressable, StyleSheet, View} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {RootStackParamList, TMediaAttachment} from '../types';
import {Type} from './Type';
import {PlayCircleIcon} from './icons/PlayCircleIcon';
import {RedundantImage} from './RedundantImage';
import {Box} from './Box';

const dimensProps = ({width, height}: TMediaAttachment['meta']['small']) => ({
  width,
  height,
});

const Media = (
  props: TMediaAttachment & {
    large?: boolean;
    imageStyle?: ImageStyle | ImageStyle[];
    onOpenAttachment: () => void;
  },
) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();

  const componentForType = (type: TMediaAttachment['type']) => {
    switch (type) {
      case 'image':
        return (
          <Pressable
            style={styles.mediaThumbnail}
            onPress={props.onOpenAttachment}>
            <RedundantImage
              fallbackUri={props.remote_url}
              source={{
                uri: props.preview_url,
                ...dimensProps(props.meta.small ?? {}),
              }}
              style={[
                styles.previewImage,
                props.large && styles.previewLarge,
                props.imageStyle,
              ]}
            />
          </Pressable>
        );
      case 'gifv':
      case 'video':
        return (
          <Pressable
            style={styles.mediaThumbnail}
            onPress={props.onOpenAttachment}>
            <Image
              source={{uri: props.preview_url}}
              style={[
                styles.previewImage,
                props.large && styles.previewLarge,
                props.imageStyle,
              ]}
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

  return componentForType(props.type);
};

export const MediaAttachments = ({
  large,
  ...props
}: {
  media: TMediaAttachment[];
  large?: boolean;
}) => {
  const styles = useThemeStyle(styleCreator);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const onOpenAttachment = (index: number) =>
    navigation.navigate('ImageViewer', {index, attachments: props.media});

  if (props.media.length === 1) {
    return (
      <Box style={[styles.mediaTwo, large && styles.noRadius]} mb={5}>
        <View key={props.media[0].id} style={styles.flexColumn}>
          <Media
            {...{
              ...props.media[0],
              large,
              onOpenAttachment: () => onOpenAttachment(0),
            }}
          />
        </View>
      </Box>
    );
  }

  if (props.media.length === 2) {
    return (
      <Box style={[styles.mediaTwo, large && styles.noRadius]} mb={5}>
        {props.media.map((attachment, i) => (
          <View key={attachment.id} style={styles.flexColumn}>
            <Media
              {...{
                ...attachment,
                large,
                onOpenAttachment: () => onOpenAttachment(i),
              }}
            />
          </View>
        ))}
      </Box>
    );
  }

  if (props.media.length === 3) {
    const [first, second, third] = props.media;
    return (
      <Box style={[styles.mediaCluster, large && styles.noRadius]} mb={5}>
        <View style={styles.mediaRow}>
          <View style={styles.flexColumn}>
            <View key={first.id} style={styles.flexColumn}>
              <Media
                {...{
                  ...first,
                  large,
                  onOpenAttachment: () => onOpenAttachment(0),
                }}
                imageStyle={[
                  styles.previewImageSpanTwoRows,
                  large && styles.previewImageSpanTwoRowsLarge,
                ]}
              />
            </View>
          </View>
          <View style={styles.flexColumn}>
            {[second, third].map((attachment, i) => (
              <View key={attachment.id} style={styles.flexColumn}>
                <Media
                  {...{
                    ...attachment,
                    large,
                    onOpenAttachment: () => onOpenAttachment(i + 1),
                  }}
                  imageStyle={[
                    styles.previewImageTwoRows,
                    large && styles.previewImageTwoRowsLarge,
                  ]}
                />
              </View>
            ))}
          </View>
        </View>
      </Box>
    );
  }

  if (props.media.length >= 4) {
    const [first, second, third, fourth] = props.media;
    return (
      <Box style={[styles.mediaCluster, large && styles.noRadius]} mb={5}>
        <View style={styles.mediaRow}>
          {[first, second].map((attachment, i) => (
            <View key={attachment.id} style={styles.flexColumn}>
              <Media
                {...{
                  ...attachment,
                  large,
                  onOpenAttachment: () => onOpenAttachment(i),
                }}
                imageStyle={[
                  styles.previewImageTwoRows,
                  large && styles.previewImageTwoRowsLarge,
                ]}
              />
            </View>
          ))}
        </View>
        <View style={styles.mediaRow}>
          {[third, fourth].map((attachment, i) => (
            <View key={attachment.id} style={styles.flexColumn}>
              <Media
                {...{
                  ...attachment,
                  large,
                  onOpenAttachment: () => onOpenAttachment(i + 2),
                }}
                imageStyle={[
                  styles.previewImageTwoRows,
                  large && styles.previewImageTwoRowsLarge,
                ]}
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
      </Box>
    );
  }

  return (
    <Box style={styles.media} mb={5}>
      {props.media.map((attachment, i) => (
        <Media
          key={attachment.id}
          {...{...attachment, onOpenAttachment: () => onOpenAttachment(i)}}
        />
      ))}
    </Box>
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
  noRadius: {
    borderRadius: undefined,
  },
  flexColumn: {
    flex: 1,
  },
  previewImage: {
    height: 125,
    width: '100%',
    resizeMode: 'cover',
  },
  previewLarge: {
    height: 220,
  },
  video: {
    minHeight: 150,
    width: '100%',
  },
  previewImageTwoRows: {
    height: 75,
  },
  previewImageTwoRowsLarge: {
    height: 110,
  },
  previewImageSpanTwoRows: {
    height: 152,
  },
  previewImageSpanTwoRowsLarge: {
    height: 222,
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
