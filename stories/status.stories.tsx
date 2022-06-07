import React from 'react';
import {FlatList, ListRenderItem} from 'react-native';

import {useThemeStyle} from '../src/theme/utils';
import {TStatusMapped} from '../src/types';

import statusOneImage from '../fixtures/status-one-image.json';
import statusThreeImage from '../fixtures/status-three-image.json';
import statusThreeImageVaried from '../fixtures/status-three-image-varied.json';
import statusFourImage from '../fixtures/status-four-image.json';
import statusFiveImage from '../fixtures/status-five-image.json';
import statusTwoImageLandscape from '../fixtures/status-two-image-landscape.json';
import statusTwoImage from '../fixtures/status-two-image.json';
import statusPixelfed from '../fixtures/status-pixelfed-linebreaks.json';
import statusBrPs from '../fixtures/status-paragraphs-and-linebreaks.json';
import statusLong from '../fixtures/status-long.json';
import statusVideo from '../fixtures/status-video.json';
import statusMicroformatsHcard from '../fixtures/status-microformats-hcard.json';
import {Status} from '../src/components/Status';
import {StyleCreator} from '../src/theme';

const defaultAdditionalProps = {
  isLocal: true,
  onPress: () => {},
};

const statuses: TStatusMapped[] = [
  statusMicroformatsHcard,
  statusVideo,
  statusLong,
  statusOneImage,
  statusTwoImage,
  statusTwoImageLandscape,
  statusThreeImage,
  statusThreeImageVaried,
  statusFourImage,
  statusFiveImage,
  statusPixelfed,
  statusBrPs,
].map(s => ({
  ...s,
  sourceHost: '',
  reblog: s.reblog ? {...s.reblog, sourceHost: ''} : null,
}));

export const StatusStory = () => {
  const styles = useThemeStyle(styleCreator);

  const renderStatus: ListRenderItem<TStatusMapped> = ({item}) => (
    <Status {...{...item, ...defaultAdditionalProps}} />
  );

  return (
    <FlatList
      style={styles.wrapper}
      data={statuses}
      renderItem={renderStatus}
    />
  );
};

const styleCreator: StyleCreator = () => ({
  wrapper: {
    flex: 1,
  },
});
