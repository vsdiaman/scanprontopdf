import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SegmentedControl } from '../../components/SegmentedControl';
import { InfoModal } from '../../components/InfoModal';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import {
  buildSaveSuccessMessage,
  saveScanAndExport,
  SaveFormat,
} from '../../services/scanSaveService';
import { addHistoryItem } from '../../features/history/historyRepository';
import { t } from '../../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

function sanitizeFileName(rawName: string) {
  return rawName
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');
}

export function PreviewScreen({ navigation, route }: Props) {
  const { imageUri, imageUris } = route.params;

  const [saveFormat, setSaveFormat] = useState<SaveFormat>('PDF');
  const [fileName, setFileName] = useState('scan_001');
  const [isSaving, setIsSaving] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [shouldGoHomeAfterOk, setShouldGoHomeAfterOk] = useState(false);
  const isMountedRef = useRef(true);
  const isSavingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fileExtension = saveFormat === 'PDF' ? '.pdf' : '.jpg';

  const safeBaseName = useMemo(() => {
    return sanitizeFileName(fileName) || 'scan';
  }, [fileName]);

  const finalFileName = useMemo(() => {
    return `${safeBaseName}${fileExtension}`;
  }, [safeBaseName, fileExtension]);

  const saveLabel = useMemo(() => {
    if (isSaving) return t('common.saving');
    return `${t('common.save')} ${finalFileName}`;
  }, [isSaving, finalFileName]);

  const openModal = (
    title: string,
    message: string,
    goHomeAfterOk: boolean,
  ) => {
    if (!isMountedRef.current) return;
    setModalTitle(title);
    setModalMessage(message);
    setShouldGoHomeAfterOk(goHomeAfterOk);
    setIsModalVisible(true);
  };

  const requestAndroidPermission = async (permission: string) => {
    try {
      const alreadyGranted = await PermissionsAndroid.check(permission as any);
      if (alreadyGranted) return true;

      const result = await PermissionsAndroid.request(permission as any);
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  };

  const ensureExportPermission = async (format: SaveFormat) => {
    if (Platform.OS !== 'android') return true;

    if (format === 'JPEG') {
      if (Platform.Version >= 33) {
        return requestAndroidPermission('android.permission.READ_MEDIA_IMAGES');
      }

      if (Platform.Version <= 28) {
        return requestAndroidPermission(
          'android.permission.WRITE_EXTERNAL_STORAGE',
        );
      }
    }

    if (format === 'PDF' && Platform.Version <= 28) {
      return requestAndroidPermission(
        'android.permission.WRITE_EXTERNAL_STORAGE',
      );
    }

    return true;
  };

  const onSave = async () => {
    if (isSavingRef.current || isSaving) return;

    const pages = (imageUris?.length ? imageUris : [imageUri]).filter(Boolean);
    if (pages.length === 0) {
      openModal(t('common.error'), t('save.noImagesFromScanner'), false);
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    try {
      const permissionOk = await ensureExportPermission(saveFormat);
      if (!permissionOk && Platform.OS === 'android') {
        throw new Error(
          saveFormat === 'JPEG'
            ? t('export.permissionDeniedGallery')
            : t('export.permissionDeniedDownloads'),
        );
      }

      const { savedInAppPath, exportedPath } = await saveScanAndExport({
        imageUri,
        imageUris: pages,
        fileName: safeBaseName,
        format: saveFormat,
      });

      await addHistoryItem({
        fileName: finalFileName,
        format: saveFormat,
        savedInAppPath,
        exportedPath,
      });

      openModal(
        t('preview.modalSavedTitle'),
        buildSaveSuccessMessage(saveFormat, exportedPath),
        true,
      );
    } catch (error: any) {
      console.error('[PreviewScreen] save failed', {
        error,
        format: saveFormat,
      });
      openModal(
        t('common.error'),
        error?.message || t('preview.modalSaveErrorFallback'),
        false,
      );
    } finally {
      isSavingRef.current = false;
      if (isMountedRef.current) setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={t('preview.headerTitle')}
        leftActionLabel={t('common.back')}
        onLeftActionPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
          </Card>

          <Card>
            <Text style={styles.label}>{t('preview.formatLabel')}</Text>
            <SegmentedControl
              value={saveFormat}
              options={['PDF', 'JPEG']}
              onChange={value => setSaveFormat(value as SaveFormat)}
            />

            <Text style={[styles.label, { marginTop: spacing.lg }]}>
              {t('preview.fileNameLabel')}
            </Text>

            <View style={styles.previewNameRow}>
              <Text style={styles.previewNameLabel}>
                {t('preview.willSaveAs')}
              </Text>
              <Text style={styles.previewNameValue} numberOfLines={1}>
                {finalFileName}
              </Text>
            </View>

            <TextInput
              value={fileName}
              onChangeText={setFileName}
              placeholder={t('preview.placeholder')}
              placeholderTextColor={colors.mutedText}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              returnKeyType="done"
            />

            <View style={{ marginTop: spacing.lg }}>
              <PrimaryButton
                label={saveLabel}
                onPress={onSave}
                disabled={isSaving}
              />
            </View>

            <Text style={styles.hint}>{t('preview.hint')}</Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      <InfoModal
        visible={isModalVisible}
        title={modalTitle}
        message={modalMessage}
        confirmText={t('common.ok')}
        onConfirm={() => {
          setIsModalVisible(false);
          if (shouldGoHomeAfterOk) navigation.popToTop();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },

  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },

  image: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    backgroundColor: colors.background,
  },

  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },

  previewNameRow: {
    marginBottom: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewNameLabel: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '800',
  },
  previewNameValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },

  input: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.text,
    backgroundColor: colors.background,
    fontWeight: '800',
  },

  hint: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '700',
    marginTop: spacing.md,
  },
});
