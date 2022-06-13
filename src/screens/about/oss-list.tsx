import React, {useCallback, useMemo} from 'react';
import {FlatList, Linking, ListRenderItem} from 'react-native';
import {Box} from '../../components/Box';
import {SimpleListRow} from '../../components/SimpleListRow';
import {Type} from '../../components/Type';

import Licenses from '../../generated/licenses.json';
import {StyleCreator} from '../../theme/types';
import {useThemeGetters, useThemeStyle} from '../../theme/utils';
import {shadow} from '../../utils/styles';
import {PackageDetail} from './oss.types';

const list = Licenses as PackageDetail[];

export const OSSList = () => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();

  const onPressItem = useCallback(async (item: PackageDetail) => {
    if (!item.repo) {
      return;
    }

    const httpUrl = item.repo.url.replace(/^git(\+https)?:/, 'https:');
    if (await Linking.canOpenURL(httpUrl)) {
      Linking.openURL(httpUrl);
    }
  }, []);

  const renderItem = useMemo(
    (): ListRenderItem<PackageDetail> =>
      ({item}) =>
        <SimpleListRow label={item.name} onPress={() => onPressItem(item)} />,
    [onPressItem],
  );

  return (
    <Box f={1}>
      <Box>
        <Box p={15}>
          <Type scale="S" color={getColor('success')} semiBold>
            We stand on the shoulders of giants.
          </Type>
        </Box>
        <Box p={15} pt={5} style={styles.messageBoxHat}>
          <Type scale="S">
            This app is made possible by a number of open source libraries. Tap
            any to view their code repository.
          </Type>
        </Box>
        <Box style={styles.messageBox} />
      </Box>
      <FlatList
        contentContainerStyle={styles.scrollContainer}
        data={list}
        renderItem={renderItem}
      />
    </Box>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  messageBoxHat: {
    backgroundColor: getColor('base'),
    zIndex: 1,
  },
  messageBox: {
    height: 10,
    backgroundColor: getColor('base'),
    ...shadow({getColor}),
  },
  scrollContainer: {
    paddingTop: 20,
    paddingBottom: 50,
  },
});
