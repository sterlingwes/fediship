import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image, ScrollView, TouchableOpacity} from 'react-native';
import {nanoid} from '../utils/nanoid';

import {useMyMastodonInstance} from '../api/hooks';
import {Box} from '../components/Box';
import {Input} from '../components/Input';
import {
  registerSendListener,
  removeSendListener,
  useKeyboardBanner,
} from '../components/KeyboardBanner';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {flex} from '../utils/styles';
import {screenHeight} from '../dimensions';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {RootStackParamList, Visibility} from '../types';
import {useFocusEffect} from '@react-navigation/native';
import {SolidButton} from '../components/SolidButton';
import {launchImageLibrary} from 'react-native-image-picker';
import {Type} from '../components/Type';
import {getPendingCaptions} from './image-captioner';
import {BottomSheet} from '../components/BottomSheet';
import {RadioOptions} from '../components/RadioOptions';

interface Attachment {
  uri: string;
  width: number | undefined;
  height: number | undefined;
  name: string;
  type: string;
}

interface AttachmentStatus {
  uploaded: boolean;
  caption: string;
}

const AssetPreview = ({
  uri,
  width,
  height,
  editable,
  onPress,
}: {
  uri: string;
  width: number | undefined;
  height: number | undefined;
  editable: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity activeOpacity={0.5} onPress={onPress} disabled={!editable}>
    <Image
      source={{uri, width, height}}
      resizeMode="cover"
      style={{width: 75, height: 75}}
    />
  </TouchableOpacity>
);

const addCaptions = (
  attachments: Array<{name: string; uri: string; type: string}>,
) => {
  const captions = getPendingCaptions();
  return attachments.map(a => ({...a, caption: captions[a.uri] ?? ''}));
};

const attachmentsForCaptioning = (attachments: Attachment[]) =>
  attachments.map(({uri, width, height}) => ({uri, width, height}));

const visibilityOptions = Object.entries(Visibility).map(([label, id]) => ({
  id,
  label,
}));

export const Composer = ({
  navigation,
}: BottomTabScreenProps<RootStackParamList, 'Compose'>) => {
  const api = useMyMastodonInstance();
  const keyboardBanner = useKeyboardBanner();
  const [textValue, setTextValue] = useState('');
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  const idempotency = useRef(nanoid());
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentEdit, setAttachmentEdit] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');
  const [attachmentStatuses, setAttachmentStatus] = useState<
    Record<string, AttachmentStatus>
  >({});
  const [visibility, setVisibility] = useState(Visibility.Public);
  const [vizModalShown, setVizModalShown] = useState(false);

  useFocusEffect(
    useCallback(() => {
      keyboardBanner.show();
    }, [keyboardBanner]),
  );

  const onVisibilityChange = useCallback(() => {
    setVizModalShown(true);
  }, [setVizModalShown]);

  const attachmentsPayload = useMemo(() => {
    return attachments.map(({uri, name, type}) => ({
      uri,
      name,
      type,
    }));
  }, [attachments]);

  useEffect(() => {
    const onSend = async () => {
      if (!textValue.trim()) {
        return false;
      }

      let media_ids: string[] = [];
      if (attachmentsPayload.length) {
        media_ids = await api.uploadAttachments(
          addCaptions(attachmentsPayload),
        );
      }

      await api.sendStatus({status: textValue, media_ids}, idempotency.current);
      return () => {
        setTextValue('');
        navigation.navigate('Profile', {self: true});
      };
    };

    registerSendListener(onSend);
    return () => removeSendListener(onSend);
  }, [attachmentsPayload, textValue, api, keyboardBanner, navigation]);

  const onUpload = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 4096,
      maxHeight: 4096,
    });
    if (result.errorCode || result.errorMessage) {
      setAttachmentError(
        result.errorMessage ?? result.errorCode?.toString() ?? 'unknown_error',
      );
    }

    const newAttachments = (result.assets ?? [])
      .map(({width, height, uri, fileName, type}) => ({
        uri: uri ?? '',
        width,
        height,
        name: fileName ?? '',
        type: type ?? '',
      }))
      .filter(
        attachment =>
          !!attachment.uri && !!attachment.name && !!attachment.type,
      );
    setAttachments([...attachments, ...newAttachments]);
    const status = newAttachments.reduce(
      (acc, {uri}) => ({
        ...acc,
        [uri ?? '']: {caption: '', uploaded: false},
      }),
      attachmentStatuses,
    );
    setAttachmentStatus(status);
  };

  const onCaption = () => {
    navigation.navigate('ImageCaptioner', {
      attachments: attachmentsForCaptioning(attachments),
    });
  };

  const requireCaptions = useMemo(() => {
    const filenames = Object.keys(attachmentStatuses);
    return filenames.some(
      file => !(attachmentStatuses[file]?.caption ?? '').trim(),
    );
  }, [attachmentStatuses]);

  const onPressAttachment = (uri: string) => {
    if (!attachmentEdit) {
      return;
    }

    const filteredAttachments = attachments.filter(a => a.uri !== uri);
    const filteredStatus = Object.keys(attachmentStatuses).reduce(
      (acc, uriKey) => {
        if (uriKey === uri) {
          return acc;
        }
        return {
          ...acc,
          [uriKey]: attachmentStatuses[uriKey],
        };
      },
      {} as Record<string, AttachmentStatus>,
    );
    setAttachments(filteredAttachments);
    setAttachmentStatus(filteredStatus);
  };

  return (
    <Box f={1}>
      <ScrollView style={flex}>
        <Box ph={15} pv={12}>
          <Input
            autoFocus
            scale="M"
            placeholder="Say something!"
            onChangeText={setTextValue}
            value={textValue}
            multiline
            style={styles.input}
          />
        </Box>
        <Box p={20}>
          {!!attachmentError && (
            <Type scale="S" semiBold color={getColor('error')}>
              {attachmentError}
            </Type>
          )}
          <Box fd="row">
            {attachments.map(({uri, width, height, name}) =>
              typeof uri === 'string' ? (
                <AssetPreview
                  {...{uri, width, height}}
                  editable={attachmentEdit}
                  onPress={() => onPressAttachment(uri)}
                  key={uri ?? name ?? ''}
                />
              ) : null,
            )}
          </Box>
          <Box fd="row">
            <SolidButton onPress={onUpload}>Up</SolidButton>
            {attachments.length > 0 && (
              <SolidButton onPress={() => setAttachmentEdit(!attachmentEdit)}>
                {attachmentEdit ? 'Editing' : 'Edit'}
              </SolidButton>
            )}
            {requireCaptions && (
              <SolidButton onPress={onCaption}>Caption</SolidButton>
            )}
            <SolidButton onPress={onVisibilityChange}>Viz</SolidButton>
          </Box>
        </Box>
      </ScrollView>
      <BottomSheet
        visible={vizModalShown}
        onClose={() => setVizModalShown(false)}>
        <Box p={20}>
          <RadioOptions
            options={visibilityOptions}
            selection={visibility}
            onPress={id => setVisibility(id as Visibility)}
          />
        </Box>
      </BottomSheet>
    </Box>
  );
};

const styleCreator: StyleCreator = () => ({
  container: {},
  input: {
    minHeight: screenHeight / 4,
  },
});
