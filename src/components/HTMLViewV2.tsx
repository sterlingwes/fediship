import React, {ComponentType, ReactNode} from 'react';
import {mf2} from '@sterlingwes/microformats-parser';
import type {Document, ChildNode, Element, TextNode} from 'parse5';
import {Emoji} from '../types';
import {Box} from './Box';
import {PressableProps} from 'react-native';

interface ElementOverride<P> {
  Component: ComponentType<P>;
  props: P;
}

interface ElementMap<T, A> {
  text: ElementOverride<T>;
  a?: ElementOverride<A>;
}

type UserComponentType = 'a';

interface HTMLProps<T, A> {
  emojis?: Emoji[];
  html: string;
  elements: ElementMap<T, A>;
  renderNode?: HTMLNodeRenderer;
}

export type HTMLNodeRenderer = (
  node: ChildNode,
  helpers: typeof helperApi,
  path: string,
) => ReactNode;

interface SingleTextChildNode extends Element {
  childNodes: [TextNode];
}

export const helperApi = Object.freeze({
  hasTextChild: (n: ChildNode): n is SingleTextChildNode => {
    const e = n as Element;
    return (
      e.childNodes &&
      e.childNodes.length === 1 &&
      typeof (e.childNodes[0] as TextNode).value === 'string'
    );
  },

  getClasses: (n: ChildNode) => {
    const classes = helperApi.getAttribute(n, 'class');
    if (!classes) {
      return false;
    }

    return classes.value;
  },

  getAttribute: (n: ChildNode, attrName: string) => {
    const e = n as Element;
    if (!e.attrs) {
      return false;
    }

    return e.attrs.find(attr => attrName === attr.name);
  },

  hasClass: (n: ChildNode, className: string) => {
    const classes = helperApi.getClasses(n);
    if (!classes) {
      return false;
    }

    return classes.includes(className);
  },
});

export const parseHtml = (html: string, baseUrl = 'https://some.host') => {
  try {
    const result = mf2(html, {baseUrl});
    return result.doc && result.doc.childNodes
      ? (result.doc as Document)
      : html;
  } catch (e) {
    const msg = (e as Error).message;
    if (
      msg !== 'Microformats parser: unable to parse HTML' &&
      msg !== 'Microformats parser: HTML cannot be empty'
    ) {
      console.warn('parseHtml error caught:', e);
    }
    return html;
  }
};

export function HTMLViewV2<T, A>(props: HTMLProps<T, A>) {
  const {Component: Type, props: typeProps} = props.elements.text;

  return <Type {...typeProps}>{htmlToReactElements(props)}</Type>;
}

export function htmlToReactElements<T, A>(props: HTMLProps<T, A>) {
  const htmlTree = parseHtml(props.html);
  if (!htmlTree) {
    return null;
  }

  if (typeof htmlTree === 'string') {
    return props.html;
  }

  const {Component: Type, props: typeProps} = props.elements.text;
  return (
    <Type {...typeProps}>
      {elementsForNodes(htmlTree.childNodes, '', props)}
    </Type>
  );
}

function elementsForNodes<T, A>(
  nodes: ChildNode[],
  path: string,
  props: HTMLProps<T, A>,
): ReactNode[] {
  const results = nodes.map((node, i) =>
    elementForNode(node, `${path}.${i}`, props),
  );
  const flattened = results.reduce(
    (acc, item) => (item != null ? (acc as ReactNode[]).concat(item) : acc),
    [] as ReactNode[],
  );

  return flattened as ReactNode[];
}

type PressProps = Pick<
  PressableProps,
  'onPress' | 'onPressIn' | 'onPressOut' | 'onLongPress'
>;

function wrapPressable<T>(n: ChildNode, pressProps: PressProps & T) {
  const pressers: Array<keyof PressProps> = [
    'onPress',
    'onPressIn',
    'onPressOut',
    'onLongPress',
  ];
  return pressers.reduce(
    (acc, propName) => ({
      ...acc,
      [propName]: acc[propName]
        ? (e: any) => {
            acc[propName]?.({...e, htmlNode: n});
          }
        : undefined,
    }),
    pressProps,
  );
}

function elementForNode<T, A>(
  node: ChildNode,
  path: string,
  props: HTMLProps<T, A>,
) {
  if (node.nodeName === '#comment') {
    return null;
  }

  const {Component: Type, props: typeProps} = props.elements.text;

  if (props.renderNode) {
    const userNode = props.renderNode(node, helperApi, path);
    if (userNode !== false) {
      return userNode;
    }
  }

  if (node.nodeName === '#text') {
    return (
      <Type key={path} {...wrapPressable(node, typeProps)}>
        {(node as TextNode).value}
      </Type>
    );
  }

  const componentType = node.nodeName as UserComponentType;
  const userComponent = props.elements[componentType];

  if (userComponent) {
    const {Component: UserComponent, props: userProps} = userComponent;
    return (
      <UserComponent {...wrapPressable(node, userProps)} key={path}>
        {elementsForNodes((node as Element).childNodes ?? [], path, props)}
      </UserComponent>
    );
  }

  if (node.nodeName === 'br') {
    return <Box key={path} pv={10} />;
  }

  if (node.nodeName === 'p') {
    return (
      <Box key={path} pb={10}>
        <Type {...typeProps}>
          {elementsForNodes((node as Element).childNodes ?? [], path, props)}
        </Type>
      </Box>
    );
  }

  const children = (node as Element).childNodes;
  if (children && children.length) {
    return elementsForNodes(children, path, props);
  }

  return null;
}
