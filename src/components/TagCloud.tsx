import * as d3 from 'd3';
import d3Cloud from 'd3-cloud';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {screenWidth} from '../dimensions';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {Type} from './Type';

const tags = [
  'pridemonth',
  'pride',
  'pridemonth2022',
  'johnnydepp',
  'vonovia',
  'shindanmaker',
  '9EuroTicket',
  'EUROinCroatia',
  'Pride2022',
  'euro',
];

export const TagCloud = () => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();

  const cloudSvg = useMemo(() => {
    const words = tags.map((tag, i) => ({
      text: tag,
      size: (i + 1) * Math.random(),
    }));

    const fakeCanvas = {
      getContext: () => ({
        getImageData: () => ({
          data: [],
        }),
        measureText: () => ({}),
        strokeText: () => {},
        fillText: () => {},
        restore: () => {},
        translate: () => {},
        clearRect: () => {},
        save: () => {},
      }),
    };

    const height = 300;
    const baseFontSize = 15;

    // const svg = d3
    //   .create('svg')
    //   .attr('viewBox', [0, 0, screenWidth, height])
    //   .attr('width', screenWidth)cd
    //   .attr('text-anchor', 'middle');

    // const g = svg.append('g');

    const cloud = d3Cloud()
      .canvas(fakeCanvas as any)
      .size([screenWidth, height])
      .words(words)
      .rotate(0)
      .padding(0)
      .fontSize(d => Math.sqrt(d.size ?? 1) * baseFontSize)
      .on('word', ({size, x, y, rotate, text}) => {
        if (!size || !text) {
          return;
        }

        // g.append('text')
        //   .attr('font-size', size)
        //   .attr('transform', `translate(${x},${y}) rotate(${rotate})`)
        //   .text(text);

        console.log('adding', {text, x, y, rotate, size});
      });

    cloud.start();
  }, []);

  return (
    <View>
      <Type>Nothing yet</Type>
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({});
