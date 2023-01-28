import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {Linking, ScrollView} from 'react-native';
import {Box} from '../../components/Box';
import {RichText} from '../../components/RichText';
import {SimpleListRow} from '../../components/SimpleListRow';
import {Type} from '../../components/Type';
import {useThemeGetters} from '../../theme/utils';
import {RootStackParamList} from '../../types';

const authorHandle = "It's currently developed part time, for fun.";

const feedback =
  'If you\'ve found a bug, are excited about a feature or usecase, or otherwise want to contribute (with feedback, code, testing, or ...), I\'d love to hear from you (<a href="https://swj.io/@wes" class="u-url mention">@wes</a>).';

export const About = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'About'>) => {
  const {getColor} = useThemeGetters();
  return (
    <ScrollView>
      <Box ph={15} mt={20} mb={15}>
        <Type scale="S">
          Fediship started from a desire to make the Fediverse easier to explore
          when starting out. It's not quite "feature complete" compared to other
          apps out there, but it's getting close!
        </Type>
      </Box>
      <Box ph={15} mb={15}>
        <RichText
          html={authorHandle}
          emojis={[]}
          onMentionPress={params => {
            navigation.push('Profile', params);
          }}
        />
      </Box>
      <Box ph={15} mb={15}>
        <Type color={getColor('success')}>Want to help? Have feedback?</Type>
      </Box>
      <Box ph={15} mb={15}>
        <RichText
          html={feedback}
          emojis={[]}
          onMentionPress={params => {
            navigation.push('Profile', params);
          }}
        />
      </Box>
      <Box ph={15} mb={15}>
        <Type scale="S">
          Please keep in mind that this is free software, and a pet project. I
          will endeavour to continue building & improving the app for my
          enjoyment and yours on a best efforts basis.
        </Type>
      </Box>
      <Box mt={30}>
        <SimpleListRow
          topBorder
          label="♥️ Open Source"
          onPress={() => navigation.push('OSSList')}
        />
        <SimpleListRow
          label="👾 Source Code (Github)"
          icon="external-link"
          onPress={() =>
            Linking.openURL('https://github.com/sterlingwes/fediship')
          }
        />
        <SimpleListRow
          label="🤗 Tips (Ko-fi)"
          icon="external-link"
          onPress={() => Linking.openURL('https://ko-fi.com/sterlingwes')}
        />
      </Box>
    </ScrollView>
  );
};
