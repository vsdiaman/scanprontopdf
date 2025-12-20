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

import { RootStackParamList } from '../../../navigation/types';
import { AppHeader } from '../../../components/AppHeader';
import { Card } from '../../../components/Card';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { SegmentedControl } from '../../../components/SegmentedControl';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

import {
  buildSaveSuccessMessage,
  SaveFormat,
  saveScanAndExport,
} from '../../../services/scanSaveService';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

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

async function ensureExportPermission(format: SaveFormat) {
  if (Platform.OS !== 'android') return true;

  // JPEG -> galeria (Android 13+ usa READ_MEDIA_IMAGES)
  if (format === 'JPEG') {
    if (Platform.Version >= 33)
      return requestAndroidPermission('android.permission.READ_MEDIA_IMAGES');
    if (Platform.Version <= 28)
      return requestAndroidPermission(
        'android.permission.WRITE_EXTERNAL_STORAGE',
      );
    return requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE');
  }

  // PDF -> Downloads (Android 9 e abaixo pode exigir WRITE)
  if (Platform.Version <= 28)
    return requestAndroidPermission(
      'android.permission.WRITE_EXTERNAL_STORAGE',
    );

  return true;
}

export function PreviewScreen({ navigation, route }: Props) {
  const imageUri = route.params.imageUri;

  const [saveFormat, setSaveFormat] = useState<SaveFormat>('JPEG');
  const [fileName, setFileName] = useState('scan_001');
  const [isSaving, setIsSaving] = useState(false);

  const fileExtension = saveFormat === 'PDF' ? '.pdf' : '.jpg';

  const saveLabel = useMemo(() => {
    const safeName = fileName.trim() || 'scan';
    return isSaving ? 'Salvando...' : `Salvar ${safeName}${fileExtension}`;
  }, [fileName, fileExtension, isSaving]);

  const onSave = async () => {
    if (isSaving) return;

    setIsSaving(true);

    const permissionOk = await ensureExportPermission(saveFormat);
    if (!permissionOk && Platform.OS === 'android') {
      Alert.alert(
        'Permissão',
        'Permissão negada para exportar. Vá em Permissões do app e permita.',
      );
      setIsSaving(false);
      return;
    }

    try {
      const { savedInAppPath, exportedPath } = await saveScanAndExport({
        imageUri,
        fileName,
        format: saveFormat,
      });

      Alert.alert(
        'Salvo',
        `${buildSaveSuccessMessage(
          saveFormat,
          exportedPath,
        )}\n\nApp: ${savedInAppPath}`,
      );

      navigation.popToTop();
    } catch {
      Alert.alert('Erro', 'Falha ao salvar.');
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
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        </Card>

        <Card>
          <Text style={styles.label}>Formato</Text>
          <SegmentedControl
            value={saveFormat}
            options={['JPEG', 'PDF']}
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
