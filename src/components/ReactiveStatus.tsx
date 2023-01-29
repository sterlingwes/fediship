import React, {ComponentProps} from 'react';
import {useSelector} from '@legendapp/state/react';
import {useNavigation} from '@react-navigation/native';
import {globalStatuses} from '../api/status.state';
import {Status} from './Status';
import {RootStackParamList} from '../types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type StatusOverrides = Partial<ComponentProps<typeof Status>>;
type ThreadParamOverrides = Partial<RootStackParamList['Thread']>;

export const ReactiveStatus = ({
  host,
  statusId,
  statusOverrides,
  threadParamOverrides,
}: {
  host: string | undefined;
  statusId: string;
  statusOverrides?: StatusOverrides;
  threadParamOverrides?: ThreadParamOverrides;
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const status = useSelector(globalStatuses[statusId]);

  if (!status) {
    return null;
  }

  const nextStatusUrl = status.reblog ? status.reblog.uri : status.uri;
  const nextId = status.reblog ? status.reblog.id : status.id;

  return (
    <Status
      isLocal={status.sourceHost === host}
      {...status}
      {...statusOverrides}
      onPress={() => {
        // TODO: nextId should only be a localId, right now we're passing remote ids
        // which is leading to failed requests to the local instance
        navigation.push('Thread', {
          focusedStatusPreload: status.reblog ?? status,
          statusUrl: nextStatusUrl,
          id: nextId,
          ...threadParamOverrides,
        });
      }}
      onPressAvatar={account => {
        if (account.acct === status.account.acct) {
          return;
        }

        navigation.push('Profile', {
          account,
        });
      }}
    />
  );
};
