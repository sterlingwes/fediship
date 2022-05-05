import React from 'react';
import {Image, ImageStyle} from 'react-native';
import RNHtmlView, {HTMLViewNode} from 'react-native-htmlview';
import {StyleCreator} from '../theme';
import {Emoji} from '../types';
import {useThemeStyle} from '../theme/utils';
import {Type, TypeProps} from './Type';

interface HTMLProps {
  emojis: Emoji[];
  value: string;
}

const htmlStylesCreator = (styles: ReturnType<typeof styleCreator>) => ({
  a: styles.linkColor,
  p: styles.textColor,
});

const renderNode = (imageStyle: ImageStyle) => (node: HTMLViewNode) => {
  if (node.name === 'emoji') {
    return (
      <Image
        source={{uri: node.attribs.src, width: 18, height: 18}}
        style={imageStyle}
        onError={e => console.error(e)}
      />
    );
  }
};

const contentWithEmojis = (props: {content: string; emojis: Emoji[]}) =>
  props.emojis.reduce((content, emoji) => {
    return content.replace(
      `:${emoji.shortcode}:`,
      `<emoji src="${emoji.url}" />`,
    );
  }, props.content);

export const HTMLView = ({value, emojis}: HTMLProps) => {
  const styles = useThemeStyle(styleCreator);
  const emojifiedValue = contentWithEmojis({content: value, emojis});
  return (
    <RNHtmlView
      value={emojifiedValue}
      stylesheet={htmlStylesCreator(styles)}
      renderNode={renderNode(styles.emoji)}
      TextComponent={Type}
      textComponentProps={{scale: 'S'} as TypeProps}
    />
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  textColor: {
    color: getColor('baseTextColor'),
  },
  linkColor: {
    color: getColor('primary'),
  },
  emoji: {
    width: 18,
    height: 18,
  },
});
