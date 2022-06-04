import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {ReactNode, useMemo, useState} from 'react';
import {
  DevSettings,
  ListRenderItem,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {ChevronInverted} from '../components/icons/Chevron';
import {Type} from '../components/Type';
import {useAuth} from '../storage/auth';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {NotificationGroups, RootStackParamList} from '../types';
import {useMount} from '../utils/hooks';
import {useNotifications} from '../utils/notifications';
import {flex} from '../utils/styles';
import {clearStorage} from '../utils/testing';

const ListHeader = ({section: {title}}: {section: {title: string}}) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <View style={styles.listHeader}>
      <Type scale="S" semiBold style={styles.listHeaderTitle}>
        {title}
      </Type>
    </View>
  );
};

const NewRowBadge = () => {
  const {getColor} = useThemeGetters();
  return (
    <Type color={getColor('primary')} bold>
      {' •'}
    </Type>
  );
};

const withNewBadge = (
  notifs: NotificationGroups,
  type: keyof NotificationGroups,
  label: string,
) => (
  <>
    {label}
    {notifs[type]?.length ? <NewRowBadge /> : null}
  </>
);

interface MenuSection {
  title: string;
  data: MenuItem[];
}

interface MenuItem {
  label: ReactNode;
  onPress: () => any;
  newCount?: number;
  hideChevron?: boolean;
}

export const User = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Explore'>) => {
  const auth = useAuth();
  const {notifs, readTab, readType} = useNotifications();
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  const [loggingOut, setLoggingOut] = useState(false);

  useMount(() => readTab());

  const menuItems = useMemo(
    (): MenuSection[] => [
      {
        title: 'Relationships',
        data: [
          {
            label: withNewBadge(notifs, 'status', 'Following'),
            newCount: notifs.status?.length,
            onPress: () => {
              readType('status');
              navigation.push('FollowerList', {source: 'theirs'});
            },
          },
          {
            label: withNewBadge(notifs, 'follow', 'Followers'),
            newCount: notifs.follow?.length,
            onPress: () => {
              readType('follow');
              navigation.push('FollowerList', {source: 'mine'});
            },
          },
        ],
      },
      {
        title: 'Toots',
        data: [
          {
            label: withNewBadge(notifs, 'favourite', 'Favorites'),
            onPress: () => {
              readType('favourite');
              navigation.push('FavouritesTimeline', {type: 'favourites'});
            },
          },
          {
            label: 'Bookmarks',
            onPress: () =>
              navigation.push('FavouritesTimeline', {type: 'bookmarks'}),
          },
          {
            label: 'Your Activity',
            newCount:
              notifs.mention?.length +
              notifs.favourite?.length +
              notifs.reblog?.length,
            hideChevron: true,
            onPress: () => {},
          },
          {
            label: 'Polls',
            newCount: notifs.poll?.length,
            hideChevron: true,
            onPress: () => {},
          },
        ],
      },
      {
        title: 'Account',
        data: [
          {
            label: 'Your Profile',
            onPress: () => {
              navigation.push('MyProfile', {self: true});
            },
          },
          {
            label: loggingOut ? 'Logging out...' : 'Logout',
            hideChevron: true,
            onPress: async () => {
              if (loggingOut || !auth.app || !auth.token || !auth.userIdent) {
                return;
              }
              setLoggingOut(true);
              await auth.clearAuth();
            },
          },
        ],
      },
      {
        title: 'Settings',
        data: [
          {
            label: 'Appearance',
            onPress: () => navigation.push('AppearanceSettings'),
          },
        ],
      },
      {
        title: 'Testing',
        data: [
          {
            label: 'Clear Storage',
            hideChevron: true,
            onPress: () => clearStorage(),
          },
          {
            label: 'Reload Bundle',
            hideChevron: true,
            onPress: () => DevSettings.reload(),
          },
        ],
      },
    ],
    [navigation, notifs, readType, setLoggingOut, auth, loggingOut],
  );

  const renderItem: ListRenderItem<typeof menuItems[0]['data'][0]> = ({
    item,
  }) => (
    <TouchableOpacity
      style={styles.listRow}
      activeOpacity={0.5}
      onPress={item.onPress}>
      <Type scale="S" style={styles.menuItemLabel} numberOfLines={1}>
        {item.label}
      </Type>
      <View style={styles.rightSide}>
        {!!item.newCount && (
          <Type scale="S" style={styles.rightSideLabel}>
            {item.newCount}
          </Type>
        )}
        {!item.hideChevron && <ChevronInverted color={getColor('primary')} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={flex}>
      <SectionList
        sections={menuItems}
        renderItem={renderItem}
        renderSectionHeader={props => <ListHeader {...props} />}
        keyExtractor={(item, index) => `${item.label}-${index}`}
      />
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMessage: {
    marginTop: 20,
  },
  listHeader: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    paddingTop: 12,
    backgroundColor: getColor('baseHighlight'),
  },
  listHeaderTitle: {
    color: getColor('primary'),
  },
  listRow: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 50,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomColor: getColor('baseAccent'),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rightSide: {
    flexDirection: 'row',
  },
  rightSideLabel: {
    marginTop: 1,
    marginRight: 6,
    color: getColor('primary'),
  },
  menuItemLabel: {
    flex: 1,
  },
});
