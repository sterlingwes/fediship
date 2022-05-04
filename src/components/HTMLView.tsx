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
  p: styles.textColor,
  span: styles.textColor,
});

const renderNode = (imageStyle: ImageStyle) => (node: HTMLViewNode) => {
  if (node.name === 'emoji') {
    return <Image source={{uri: node.attribs.src}} style={imageStyle} />;
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
  return (
    <RNHtmlView
      value={contentWithEmojis({content: value, emojis})}
      stylesheet={htmlStylesCreator(styles)}
      renderNode={renderNode(styles)}
      TextComponent={Type}
      textComponentProps={{scale: 'S'} as TypeProps}
    />
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  textColor: {
    color: getColor('baseTextColor'),
  },
  emoji: {
    width: 20,
    height: 20,
  },
});
