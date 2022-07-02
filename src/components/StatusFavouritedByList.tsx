import React, {useState} from 'react';
import {Image, TouchableOpacity} from 'react-native';
import {useMyMastodonInstance} from '../api/hooks';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {TAccount} from '../types';
import {useMount} from '../utils/hooks';
import {Box} from './Box';
import {LoadingSpinner} from './LoadingSpinner';
import {Type} from './Type';

export const StatusFavouritedByList = ({
  statusId,
  onPressAccount,
}: {
  statusId: string;
  onPressAccount: (account: TAccount) => void;
}) => {
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  const api = useMyMastodonInstance();
  const [loading, setLoading] = useState(false);
  const [favouritedBy, setFavouritedBy] = useState<TAccount[]>();

  useMount(() => {
    const getFavouriters = async () => {
      setLoading(true);
      try {
        const favers = await api.getFavouritedBy(statusId);
        if (Array.isArray(favers)) {
          setFavouritedBy(favers);
        }
      } finally {
        setLoading(false);
      }
    };

    getFavouriters();
  });

  return (
    <Box f={1} mt={10}>
      {loading && <LoadingSpinner size="small" />}
      {favouritedBy && (
        <Box f={1}>
          <Type scale="XS">Favourited by:</Type>

          <Box f={1} mt={10}>
            {favouritedBy?.map(acc => (
              <TouchableOpacity
                key={acc.url}
                onPress={() => onPressAccount(acc)}
                activeOpacity={0.5}>
                <Box fd="row" f={1} mb={2}>
                  <Box>
                    <Image
                      source={{uri: acc.avatar_static}}
                      style={styles.favouritedByAvatar}
                    />
                  </Box>
                  <Box ml={10} f={1} cv>
                    <Type
                      scale="XS"
                      color={getColor('primary')}
                      ellipsizeMode="tail"
                      numberOfLines={1}
                      medium>
                      {acc.acct}
                    </Type>
                  </Box>
                </Box>
              </TouchableOpacity>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

const styleCreator: StyleCreator = () => ({
  favouritedByAvatar: {width: 30, height: 30},
});
