import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo, useRef, useState} from 'react';
import {
  FlatList,
  Linking,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useThread} from '../api';
import {useMyMastodonInstance} from '../api/hooks';
import {Box} from '../components/Box';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {ExternalLink} from '../components/icons/ExternalLinkIcon';
import {FrownIcon} from '../components/icons/FrownIcon';
import {LockIcon} from '../components/icons/LockIcon';
import {MessageIcon} from '../components/icons/MessageIcon';
import {InfoBanner} from '../components/InfoBanner';
import {InlineReply} from '../components/InlineReply';
import {LoadMoreFooter} from '../components/LoadMoreFooter';
import {Status} from '../components/Status';
import {Type} from '../components/Type';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {RootStackParamList, TStatusMapped} from '../types';
import {resolveTerminatingTootIds} from './thread/thread.util';
import {screenHeight} from '../dimensions';

const ThreadError = ({
  error,
  statusUrl,
}: {
  error: string;
  statusUrl: string | undefined;
}) => {
  const {getColor} = useThemeGetters();

  if (error.includes('authenticated')) {
    return (
      <Box c f={1}>
        <Box mb={20}>
          <LockIcon
            width={50}
            height={50}
            strokeWidth={1}
            color={getColor('baseAccent')}
          />
        </Box>
        <Box mb={15}>
          <Type medium>Unable to get status detail.</Type>
        </Box>
        <Box ph={20}>
          <Type scale="S">
            Sorry, the thread status you tapped is on an instance that requires
            authentication. You can try opening the web version instead.
          </Type>
        </Box>
        {!!statusUrl && (
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => Linking.openURL(statusUrl)}>
            <Box p={20}>
              <Type scale="S" color={getColor('primary')}>
                Open in Browser <ExternalLink color={getColor('primary')} />
              </Type>
            </Box>
          </TouchableOpacity>
        )}
      </Box>
    );
  }

  return (
    <Box c f={1}>
      <Box mb={20}>
        <FrownIcon
          width={50}
          height={50}
          strokeWidth={1}
          color={getColor('baseAccent')}
        />
      </Box>
      <Box mb={15}>
        <Type medium>Unable to retreive status thread.</Type>
      </Box>
      <Box ph={20}>
        <Type scale="S">{error}</Type>
      </Box>
    </Box>
  );
};

export const Thread = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Thread'>) => {
  const {statusUrl, id, showThreadFavouritedBy, focusedStatusPreload} =
    route.params;
  const api = useMyMastodonInstance();
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();

  const [initialLoad, setInitialLoad] = useState(true);
  const filtered = useRef(false);
  const {thread, loading, refreshing, fetchThread, error, localFallback} =
    useThread(statusUrl, id);

  const {statuses, terminatingIds} = useMemo(() => {
    let resolvedStatuses: TStatusMapped[] = [];

    if (localFallback) {
      resolvedStatuses = [
        ...(thread?.localResponse?.ancestors ?? []),
        ...(thread?.localResponse?.status
          ? [thread.localResponse?.status]
          : []),
        ...(thread?.localResponse?.descendants ?? []),
      ];

      return {
        statuses: resolvedStatuses,
        terminatingIds: resolveTerminatingTootIds(
          thread?.localResponse?.descendants,
          thread?.localResponse?.status?.id ?? '',
        ),
      };
    }

    resolvedStatuses = [
      ...(thread?.ancestors ?? []),
      ...(thread?.status ? [thread.status] : [focusedStatusPreload]),
      ...(thread?.descendants ?? []),
    ];

    return {
      statuses: resolvedStatuses,
      terminatingIds: resolveTerminatingTootIds(
        thread?.descendants,
        thread?.status?.id ?? '',
      ),
    };
  }, [thread, localFallback, focusedStatusPreload]);

  const focusedThread = useMemo(() => {
    const targetPosition = statuses.findIndex(
      status => (status.uri ?? status.url) === statusUrl,
    );

    if (targetPosition > 2 && initialLoad) {
      filtered.current = true;
      return statuses.slice(targetPosition - 1);
    }

    filtered.current = false;
    return statuses;
  }, [initialLoad, statuses, statusUrl]);

  const searchThread = async (uri: string) => {
    if (loading) {
      return;
    }
    const statusMatch = await api.resolveStatus(uri);
    if (statusMatch) {
      fetchThread({localIdOverride: statusMatch.id});
    }
  };

  const renderItem: ListRenderItem<TStatusMapped> = ({item, index}) => {
    const localStatus = thread?.localStatuses?.[item.uri];
    const resolvedStatus = localStatus ?? item;
    const focused = thread?.status?.id === resolvedStatus.id;

    const statusComponent = (
      <Status
        key={item.id}
        collapsed={false}
        isLocal={!!localStatus}
        focused={focused}
        showFavouritedBy={showThreadFavouritedBy}
        {...resolvedStatus}
        hasReplies={!!statuses[index + 1]}
        lastStatus={
          terminatingIds.includes(item.id) || statuses.length - 1 === index
        }
        onPress={() => {
          if (statusUrl === item.uri || item.id === id) {
            return;
          }
          navigation.push('Thread', {
            focusedStatusPreload: item,
            statusUrl: item.uri,
            id: item.id,
          });
        }}
        onPressAvatar={account => {
          navigation.push('Profile', {
            account,
          });
        }}
      />
    );

    if (!focused) {
      return statusComponent;
    }

    if (!localStatus) {
      return (
        <>
          {statusComponent}
          <TouchableOpacity onPress={() => searchThread(item.uri)}>
            <Box ph={20} style={styles.fetchThreadButton} pv={15} fd="row" c>
              <Box mr={5}>
                <MessageIcon
                  color={getColor('primary')}
                  strokeWidth={1}
                  width={20}
                  height={20}
                />
              </Box>
              <Type scale="S" color={getColor('primary')}>
                Enable Interactions
              </Type>
            </Box>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <>
        {statusComponent}
        <InlineReply inReplyToId={item.id} onSent={fetchThread} />
      </>
    );
  };

  const LoadHeader = useMemo(
    () => <LoadMoreFooter onPress={() => setInitialLoad(false)} noSafeArea />,
    [setInitialLoad],
  );

  if (error) {
    return <ThreadError error={error} statusUrl={statusUrl} />;
  }

  const incompleteThreadBanner = localFallback ? <IncompleteThread /> : null;
  const HeaderComponent =
    initialLoad && filtered.current ? LoadHeader : incompleteThreadBanner;
  const FooterComponent = loading ? (
    <Box pv={20}>
      <LoadingSpinner />
    </Box>
  ) : null;

  return (
    <FlatList
      data={focusedThread}
      renderItem={renderItem}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      contentInset={{bottom: 40}}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchThread} />
      }
      ListHeaderComponent={HeaderComponent}
      ListFooterComponent={FooterComponent}
    />
  );
};

const IncompleteThread = () => (
  <InfoBanner>
    This thread could not be retrieved from the user's instance so you may be
    seeing a partial view of it.
  </InfoBanner>
);

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: screenHeight / 3,
  },
  fetchThreadButton: {
    borderBottomColor: getColor('baseAccent'),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
