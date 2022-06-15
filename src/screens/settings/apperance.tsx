import React, {ReactNode, useMemo, useState} from 'react';
import {
  ListRenderItem,
  SectionList,
  StyleSheet,
  View,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {Type} from '../../components/Type';
import {
  retrieveMediaStatusAllPref,
  saveMediaStatusAllPref,
} from '../../storage/settings/appearance';
import {StyleCreator} from '../../theme';
import {useTheme, useThemeStyle} from '../../theme/utils';
import {flex} from '../../utils/styles';

interface MenuSection {
  title: string;
  data: MenuItem[];
}

interface MenuItem {
  label: string;
  onPress: () => any;
  rightSide?: ReactNode;
  disabled?: boolean;
}

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

export const AppearanceSettings = () => {
  const theme = useTheme();
  const styles = useThemeStyle(styleCreator);
  const [mediaStatusAll, setMediaStatusAll] = useState(
    retrieveMediaStatusAllPref() ?? false,
  );

  const menuItems = useMemo(
    (): MenuSection[] => [
      {
        title: 'Theme',
        data: [
          {
            label: 'Use System Settings',
            onPress: () => {
              theme.setUseSystemSetting(!theme.systemSetting);
            },
            rightSide: (
              <Switch
                onValueChange={use => {
                  theme.setUseSystemSetting(use);
                }}
                value={theme.systemSetting}
              />
            ),
          },
          {
            label: 'Dark Mode',
            disabled: theme.systemSetting,
            onPress: () => {
              if (theme.systemSetting) {
                return;
              }

              theme.setChosenScheme(
                theme.activeScheme === 'dark' ? 'light' : 'dark',
              );
            },
            rightSide: (
              <Switch
                disabled={theme.systemSetting}
                onValueChange={use => {
                  theme.setChosenScheme(use ? 'dark' : 'light');
                }}
                value={theme.activeScheme === 'dark'}
              />
            ),
          },
        ],
      },
      {
        title: 'Timelines',
        data: [
          {
            label: 'Always show large media',
            onPress: () => {
              setMediaStatusAll(!mediaStatusAll);
              saveMediaStatusAllPref(!mediaStatusAll);
            },
            rightSide: (
              <Switch
                disabled={theme.systemSetting}
                onValueChange={on => {
                  setMediaStatusAll(on);
                  saveMediaStatusAllPref(on);
                }}
                value={mediaStatusAll}
              />
            ),
          },
        ],
      },
    ],
    [mediaStatusAll, theme, setMediaStatusAll],
  );

  const renderItem: ListRenderItem<typeof menuItems[0]['data'][0]> = ({
    item,
  }) => (
    <TouchableOpacity
      disabled={item.disabled}
      style={styles.listRow}
      activeOpacity={0.5}
      onPress={item.onPress}>
      <Type scale="S" style={styles.menuItemLabel} numberOfLines={1}>
        {item.label}
      </Type>
      <View style={styles.rightSide}>{item.rightSide}</View>
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
