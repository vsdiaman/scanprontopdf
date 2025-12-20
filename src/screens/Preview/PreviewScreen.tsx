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
import {
  buildSaveSuccessMessage,
  saveScanAndExport,
  SaveFormat,
} from '../../services/scanSaveService';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

async function ensureLegacyAndroidWritePermission() {
  if (Platform.OS !== 'android') return true;

  const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : 0;
  if (apiLevel >= 29) return true; // Android 10+ usa MediaStore

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    {
      title: 'Permissão para salvar',
      message: 'Precisamos de permissão para salvar arquivos no seu telefone.',
      buttonPositive: 'Permitir',
      buttonNegative: 'Cancelar',
    },
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export function PreviewScreen({ navigation, route }: Props) {
  const { imageUri } = route.params;

  const [saveFormat, setSaveFormat] = useState<SaveFormat>('PDF');
  const [fileName, setFileName] = useState('scan_001');
  const [isSaving, setIsSaving] = useState(false);

  const fileExtension = saveFormat === 'PDF' ? '.pdf' : '.jpg';

  const saveLabel = useMemo(() => {
    const safeName = fileName.trim() || 'scan';
    return isSaving ? 'Salvando...' : `Salvar ${safeName}${fileExtension}`;
  }, [fileName, fileExtension, isSaving]);

  const onSave = async () => {
    const ok = await ensureLegacyAndroidWritePermission();
    if (!ok) return;

    try {
      setIsSaving(true);

      const result = await saveScanAndExport({
        imageUri,
        fileName,
        format: saveFormat,
      });

      Alert.alert(
        'Salvo',
        buildSaveSuccessMessage(saveFormat, result.exportedPath),
      );

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro ao salvar', error?.message ?? 'Falha desconhecida');
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
});
