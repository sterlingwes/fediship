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
import {EyeIcon} from '../components/icons/EyeIcon';
import {startCase} from '../utils/strings';
import {ImageIcon} from '../components/icons/ImageIcon';
import {InfoIcon} from '../components/icons/InfoIcon';
import {XCircleIcon} from '../components/icons/XCircleIcon';
import {TrashIcon} from '../components/icons/TrashIcon';
import {parseStatus} from './composer.utils';
import {getAllUserProfiles} from '../storage/auth';
import {UserIcon} from '../components/icons/UserIcon';

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
}) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={onPress}
      disabled={!editable}>
      <Box mr={10} mb={5}>
        <Image
          source={{uri, width, height}}
          resizeMode="cover"
          style={{width: 75, height: 75, borderRadius: 2}}
        />
        {editable && (
          <Box style={styles.imageDeleteTrashOverlay}>
            <TrashIcon color="white" />
          </Box>
        )}
      </Box>
    </TouchableOpacity>
  );
};
const addCaptions = (
  attachments: Array<{name: string; uri: string; type: string}>,
) => {
  const captions = getPendingCaptions();
  return attachments.map(a => ({...a, caption: captions[a.uri] ?? ''}));
};

const attachmentsForCaptioning = (attachments: Attachment[]) =>
  attachments.map(({uri, width, height}) => ({uri, width, height}));

const subLabelForViz = (vizId: Visibility) => {
  switch (vizId) {
    case Visibility.Public:
      return 'Shown in public timelines';
    case Visibility.Unlisted:
      return 'Public but not included in timelines';
    case Visibility.Private:
      return 'Shown to followers & mentioned only';
    case Visibility.Direct:
      return 'Visible only to those mentioned';
  }
};

const visibilityOptions = Object.entries(Visibility).map(([label, id]) => ({
  id,
  label,
  subLabel: subLabelForViz(id),
}));

export const Composer = ({
  navigation,
  route,
}: BottomTabScreenProps<RootStackParamList, 'Compose'>) => {
  const {inReplyToId, routeTime} = route.params ?? {};
  const api = useMyMastodonInstance();
  const keyboardBanner = useKeyboardBanner();
  const [textValue, setTextValue] = useState('');
  const [sendError, setSendError] = useState('');
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();
  const idempotency = useRef(nanoid());
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentEdit, setAttachmentEdit] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');
  const [attachmentStatuses, setAttachmentStatus] = useState<
    Record<string, AttachmentStatus>
  >({});
  const [visibility, setVisibility] = useState(
    inReplyToId ? Visibility.Unlisted : Visibility.Public,
  );
  const [[replyId, replyIdSetTime], setReplyId] = useState<
    [string | undefined, number | undefined]
  >([inReplyToId, routeTime]);
  const [vizModalShown, setVizModalShown] = useState(false);
  const [senderModalShown, setSendModalShown] = useState(false);

  const senderOptions = useMemo(() => {
    const profiles = getAllUserProfiles();
    return [
      profiles.primary.acct,
      ...profiles.secondary.map(({acct}) => acct),
    ].map(acct => ({id: acct, label: acct}));
  }, []);

  const [senderAcct, setSenderAcct] = useState(senderOptions[0].id);

  useFocusEffect(
    useCallback(() => {
      keyboardBanner.show();
    }, [keyboardBanner]),
  );

  useEffect(() => {
    // update reply state if re-routed
    if (
      (routeTime && replyIdSetTime && replyIdSetTime < routeTime) ||
      (!replyIdSetTime && inReplyToId)
    ) {
      setReplyId([inReplyToId, routeTime]);
    }
  }, [replyId, routeTime, inReplyToId, replyIdSetTime, setReplyId]);

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

      const replyParams = replyId ? {in_reply_to_id: replyId} : {};
      const {status, cw} = parseStatus(textValue);
      const spoilerParams = cw ? {spoiler_text: cw} : {};
      const response = await api.sendStatus(
        {status, media_ids, visibility, ...replyParams, ...spoilerParams},
        idempotency.current,
      );

      if (!response.ok) {
        const error = await response.getErrorSafely();
        setSendError(error);
        return () => {};
      }

      return () => {
        setTextValue('');
        setAttachments([]);
        setAttachmentEdit(false);
        setAttachmentError('');
        setAttachmentStatus({});
        const replying = !!inReplyToId;
        setReplyId([undefined, Date.now()]);
        if (!replying) {
          navigation.navigate('Profile', {self: true});
        }
      };
    };

    registerSendListener(onSend);
    return () => removeSendListener(onSend);
  }, [
    attachmentsPayload,
    textValue,
    visibility,
    replyId,
    api,
    keyboardBanner,
    inReplyToId,
    navigation,
  ]);

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
    if (!filteredAttachments.length) {
      setAttachmentEdit(false);
    }
  };

  const replying = !!replyId;

  return (
    <Box f={1}>
      <ScrollView style={flex}>
        {replying && (
          <Box pt={20} ph={16} fd="row" cv>
            <Type scale="S" medium color={getColor('primary')}>
              Replying
            </Type>
            <Box ml={5}>
              <XCircleIcon
                width={18}
                height={18}
                color={getColor('primary')}
                onPress={() => setReplyId([undefined, replyIdSetTime])}
              />
            </Box>
          </Box>
        )}
        {!!sendError && (
          <Box ph={15} pv={20}>
            <Type scale="S" color={getColor('error')}>
              {sendError}
            </Type>
          </Box>
        )}
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
          <Box fd="row" fw>
            <Box mr={10}>
              <SolidButton onPress={onUpload} Icon={ImageIcon}>
                Add Image
              </SolidButton>
            </Box>
            {attachments.length > 0 && (
              <Box mr={10}>
                <SolidButton
                  onPress={() => setAttachmentEdit(!attachmentEdit)}
                  Icon={attachmentEdit ? XCircleIcon : TrashIcon}>
                  {attachmentEdit ? 'Cancel' : 'Delete'}
                </SolidButton>
              </Box>
            )}
            {requireCaptions && (
              <Box mr={10}>
                <SolidButton onPress={onCaption} Icon={InfoIcon}>
                  Caption
                </SolidButton>
              </Box>
            )}
            <Box mr={10}>
              <SolidButton onPress={onVisibilityChange} Icon={EyeIcon}>
                {startCase(visibility)}
              </SolidButton>
            </Box>
            {senderOptions.length > 1 && (
              <Box mr={10}>
                <SolidButton
                  onPress={() => setSendModalShown(true)}
                  Icon={UserIcon}>
                  {senderAcct}
                </SolidButton>
              </Box>
            )}
          </Box>
        </Box>
      </ScrollView>
      <BottomSheet
        visible={senderModalShown}
        onClose={() => setSendModalShown(false)}>
        <Box p={20}>
          <RadioOptions
            options={senderOptions}
            selection={senderAcct}
            onPress={id => {
              setSenderAcct(id);
              setSendModalShown(false);
            }}
          />
        </Box>
      </BottomSheet>
      <BottomSheet
        visible={vizModalShown}
        onClose={() => setVizModalShown(false)}>
        <Box p={20}>
          <RadioOptions
            options={visibilityOptions}
            selection={visibility}
            onPress={id => {
              setVisibility(id as Visibility);
              setVizModalShown(false);
            }}
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
  imageDeleteTrashOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(10,10,10,0.7)',
    padding: 5,
    borderRadius: 2,
  },
});
