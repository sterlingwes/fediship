import React from 'react';
import {Image, Linking, Pressable, View} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {TMediaAttachment} from '../types';
import {PlayCircleIcon} from './icons/PlayCircleIcon';

const dimensProps = ({width, height}: TMediaAttachment['meta']['small']) => ({
  width,
  height,
});

const Media = (props: TMediaAttachment) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();

  const onOpen = () => Linking.openURL(props.url);

  const componentForType = (type: TMediaAttachment['type']) => {
    switch (type) {
      case 'image':
        return (
          <Pressable style={styles.mediaThumbnail} onPress={onOpen}>
            <Image
              source={{
                uri: props.preview_url,
                ...dimensProps(props.meta.small),
              }}
              style={[
                styles.previewImage,
                {
                  ...dimensProps(props.meta.small),
                  aspectRatio: props.meta.small.aspect,
                },
              ]}
            />
          </Pressable>
        );
      case 'gifv':
      case 'video':
        return (
          <Pressable style={styles.mediaThumbnail} onPress={onOpen}>
            <Image
              source={{
                uri: props.preview_url,
                ...dimensProps(props.meta.small),
              }}
              style={[
                styles.previewImage,
                {
                  ...dimensProps(props.meta.small),
                  aspectRatio: props.meta.small.aspect,
                },
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

  return <View>{componentForType(props.type)}</View>;
};

export const MediaAttachments = (props: {media: TMediaAttachment[]}) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <View style={styles.media}>
      {props.media.map(attachment => (
        <Media key={attachment.id} {...attachment} />
      ))}
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  media: {
    overflow: 'hidden',
    marginTop: 10,
    flexDirection: 'row',
  },
  previewImage: {
    resizeMode: 'cover',
  },
  mediaThumbnail: {
    flex: 1,
    maxWidth: '100%',
    height: 150,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPlayableIcon: {
    position: 'absolute',
    backgroundColor: getColor('baseTextColor'),
    borderRadius: 24 / 2,
  },
});
