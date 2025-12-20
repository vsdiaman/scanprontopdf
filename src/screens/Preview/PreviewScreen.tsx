// src/screens/Preview/PreviewScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
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
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

import { addHistoryItem } from '../../features/history/historyRepository';
import {
  buildSaveSuccessMessage,
  saveScanAndExport,
  SaveFormat,
} from '../../services/scanSaveService';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

function sanitizeFileName(rawName: string) {
  return rawName
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');
}

async function requestAndroidPermission(permission: string) {
  try {
    const alreadyGranted = await PermissionsAndroid.check(permission as any);
    if (alreadyGranted) return true;

    const result = await PermissionsAndroid.request(permission as any);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

/**
 * Export:
 * - JPEG -> galeria (CameraRoll)
 * - PDF  -> tenta Downloads (copyFile)
 *
 * Permissões:
 * - Android 13+ (33): imagens = READ_MEDIA_IMAGES
 * - Android 9 e abaixo (<=28): WRITE_EXTERNAL_STORAGE
 * - Android 10-12: geralmente ok (scoped storage), mas alguns devices podem exigir READ
 */
async function ensureExportPermission(format: SaveFormat) {
  if (Platform.OS !== 'android') return true;

  const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : 0;

  if (format === 'JPEG') {
    if (apiLevel >= 33) {
      return requestAndroidPermission('android.permission.READ_MEDIA_IMAGES');
    }

    if (apiLevel <= 28) {
      return requestAndroidPermission(
        'android.permission.WRITE_EXTERNAL_STORAGE',
      );
    }

    // Android 10-12
    return true;
  }

  // PDF -> Downloads: Android 9 e abaixo precisa WRITE
  if (apiLevel <= 28) {
    return requestAndroidPermission(
      'android.permission.WRITE_EXTERNAL_STORAGE',
    );
  }

  return true;
}

export function PreviewScreen({ navigation, route }: Props) {
  const { imageUri } = route.params;

  const [saveFormat, setSaveFormat] = useState<SaveFormat>('PDF');
  const [fileName, setFileName] = useState('scan_001');
  const [isSaving, setIsSaving] = useState(false);

  const fileExtension = saveFormat === 'PDF' ? '.pdf' : '.jpg';

  const saveLabel = useMemo(() => {
    const base = fileName.trim() || 'scan';
    return isSaving ? 'Salvando...' : `Salvar ${base}${fileExtension}`;
  }, [fileName, fileExtension, isSaving]);

  const onSave = async () => {
    if (isSaving) return;

    setIsSaving(true);

    const permissionOk = await ensureExportPermission(saveFormat);
    if (!permissionOk && Platform.OS === 'android') {
      Alert.alert(
        'Permissão',
        'Permissão negada. Vá em Configurações > Apps > Scanner Pronto PDF > Permissões e permita.',
      );
      setIsSaving(false);
      return;
    }

    try {
      const safeBaseName = sanitizeFileName(fileName) || `scan_${Date.now()}`;
      const finalFileName = `${safeBaseName}${fileExtension}`;

      const { savedInAppPath, exportedPath } = await saveScanAndExport({
        imageUri,
        fileName: safeBaseName, // sem extensão (o service coloca)
        format: saveFormat,
      });

      await addHistoryItem({
        fileName: finalFileName,
        format: saveFormat,
        savedInAppPath,
        exportedPath,
      });

      Alert.alert(
        'Salvo',
        `${buildSaveSuccessMessage(
          saveFormat,
          exportedPath,
        )}\n\nApp: ${savedInAppPath}`,
      );

      navigation.popToTop();
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Falha ao salvar.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Pré-visualização"
        leftActionLabel="Voltar"
        onLeftActionPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <Card>
          <View style={styles.previewBox}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          </View>
        </Card>

        <Card>
          <Text style={styles.label}>Formato</Text>
          <SegmentedControl
            value={saveFormat}
            options={['PDF', 'JPEG']}
            onChange={value => setSaveFormat(value as SaveFormat)}
          />

          <Text style={[styles.label, { marginTop: spacing.lg }]}>
            Nome do arquivo
          </Text>
          <TextInput
            value={fileName}
            onChangeText={setFileName}
            placeholder="Ex: contrato_2025"
            placeholderTextColor={colors.mutedText}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <View style={{ marginTop: spacing.lg }}>
            <PrimaryButton
              label={saveLabel}
              onPress={onSave}
              disabled={isSaving}
            />
          </View>
        </Card>

        <Text style={styles.hint}>
          JPEG: app + galeria. PDF: app + (tenta) Downloads.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.xl, gap: spacing.lg },

  previewBox: {
    height: 320,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    backgroundColor: colors.background,
  },

  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: spacing.sm,
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
  hint: { color: colors.mutedText, fontSize: 12, fontWeight: '700' },
});
