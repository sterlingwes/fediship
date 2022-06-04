import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {createFetchProxy} from '../api/fetch-proxy';
import {centered, flex} from '../utils/styles';
import {Box} from './Box';
import {Type} from './Type';

export const NoNetworkCheck = ({
  disabled,
  children,
}: {
  disabled?: boolean;
  children: JSX.Element;
}) => {
  const [noNetwork, setNoNetwork] = useState(false);

  useMemo(() => {
    createFetchProxy({
      onNoNetwork: async () => {
        const state = await NetInfo.fetch();
        if (state.isInternetReachable === false || !state.isConnected) {
          setNoNetwork(true);
        }
      },
    });
  }, []);

  if (!disabled && noNetwork) {
    return (
      <View style={[flex, centered]}>
        <Type>Lost at sea?</Type>
        <Box mt={25} mh={10}>
          <Type scale="S">
            It seems you may have lost your network connection.
          </Type>
        </Box>
      </View>
    );
  }

  return children;
};
