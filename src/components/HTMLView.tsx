import React from 'react';
import {Image, ImageStyle, Linking, TextStyle} from 'react-native';
import RNHtmlView, {
  HTMLViewNode,
  HTMLViewNodeRenderer,
} from 'react-native-htmlview';
import {StyleCreator} from '../theme';
import {Emoji, RootStackParamList} from '../types';
import {useThemeStyle} from '../theme/utils';
import {Type, TypeProps} from './Type';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface HTMLProps {
  emojis?: Emoji[];
  value: string;
}

const htmlStylesCreator = (styles: ReturnType<typeof styleCreator>) => ({
  a: styles.linkColor,
  p: styles.paragraph,
});

const renderNode =
  ({
    imageStyle,
    linkStyle,
    onLinkPress,
  }: {
    imageStyle: ImageStyle;
    linkStyle: TextStyle;
    onLinkPress: (attribs: Record<string, any>) => void;
  }) =>
  (
    node: HTMLViewNode,
    _index: number,
    _siblings: HTMLViewNode[],
    parent: HTMLViewNode,
    defaultRenderer: HTMLViewNodeRenderer,
  ) => {
    if (node.name === 'emoji') {
      return (
        <Image
          source={{uri: node.attribs.src, width: 18, height: 18}}
          style={imageStyle}
          onError={e => console.error(e)}
        />
      );
    }

    if (node.name === 'a') {
      return (
        <Type
          style={linkStyle}
          scale="S"
          onPress={() => onLinkPress(node.attribs)}>
          {defaultRenderer(node.children as HTMLViewNode[], parent)}
        </Type>
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
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const styles = useThemeStyle(styleCreator);
  const emojifiedValue = contentWithEmojis({
    content: value,
    emojis: emojis ?? [],
  });

  const onLinkPress = (attribs: Record<string, any>) => {
    // handle hashtag links
    const [origin, tag] = attribs.href.split('/tags/');
    if (tag) {
      const [, host] = origin.split('//');
      navigation.push('TagTimeline', {host, tag});
      return;
    }

    // handle username links
    if (attribs.class && attribs.class.includes('u-url')) {
      const urlParts = attribs.href.split('/');
      const host = urlParts[2];
      let accountHandle = urlParts.pop();
      if (host && accountHandle) {
        if (accountHandle[0] === '@') {
          accountHandle = accountHandle.substr(1);
        }
        navigation.push('Profile', {host, accountHandle});
        return;
      }
    }

    Linking.openURL(attribs.href);
  };

  return (
    <RNHtmlView
      paragraphBreak=""
      value={fixLinebreaking(emojifiedValue)}
      stylesheet={htmlStylesCreator(styles)}
      renderNode={renderNode({
        imageStyle: styles.emoji,
        linkStyle: styles.linkColor,
        onLinkPress,
      })}
      TextComponent={Type}
      textComponentProps={{scale: 'S'} as TypeProps}
    />
  );
};

const br = '<br/>';
const fixLinebreaking = (text: string) => {
  const value = text.replace(/<br\/?>\n+/g, br);
  const parts = value.split(br);
  if (parts.length > 1) {
    return `<p>${parts.join('</p><p>')}</p>`;
  }

  return value;
};

const styleCreator: StyleCreator = ({getColor}) => ({
  textColor: {
    color: getColor('baseTextColor'),
  },
  linkColor: {
    color: getColor('primary'),
  },
  paragraph: {
    color: getColor('baseTextColor'),
    marginBottom: 10,
  },
  emoji: {
    width: 18,
    height: 18,
  },
});
