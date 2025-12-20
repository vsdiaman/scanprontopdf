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
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

import { RootStackParamList } from '../../../navigation/types';
import { AppHeader } from '../../../components/AppHeader';
import { Card } from '../../../components/Card';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { SegmentedControl } from '../../../components/SegmentedControl';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;
type SaveFormat = 'PDF' | 'JPEG';

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

async function ensureGalleryPermissionForSave() {
  if (Platform.OS !== 'android') return true;

  // Android 13+ (API 33+)
  if (Platform.Version >= 33) {
    return requestAndroidPermission('android.permission.READ_MEDIA_IMAGES');
  }

  // Android 9 e abaixo (API <= 28)
  if (Platform.Version <= 28) {
    return requestAndroidPermission(
      'android.permission.WRITE_EXTERNAL_STORAGE',
    );
  }

  // Android 10-12 (29-32): geralmente não precisa pra salvar, mas alguns aparelhos/lib pedem leitura.
  return requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE');
}

export function PreviewScreen({ navigation, route }: Props) {
  const imageUri = route.params.imageUri;

  const [saveFormat, setSaveFormat] = useState<SaveFormat>('JPEG');
  const [fileName, setFileName] = useState('scan_001');

  const fileExtension = saveFormat === 'PDF' ? '.pdf' : '.jpg';

  const saveLabel = useMemo(() => {
    const safeName = fileName.trim() || 'scan';
    return `Salvar ${safeName}${fileExtension}`;
  }, [fileName, fileExtension]);

  const onSave = async () => {
    if (saveFormat === 'PDF') {
      Alert.alert(
        'Ainda não',
        'PDF você salva em “Arquivos/Downloads”. Galeria é JPEG.',
      );
      return;
    }

    const permissionOk = await ensureGalleryPermissionForSave();

    try {
      // Mesmo se permissionOk for false, tenta salvar; em alguns Androids funciona sem.
      await CameraRoll.save(imageUri, {
        type: 'photo',
        album: 'Scanner Pronto PDF',
      });

      Alert.alert('Salvo', 'Imagem salva na galeria.');
      navigation.popToTop();
    } catch {
      Alert.alert(
        'Erro ao salvar',
        permissionOk
          ? 'Falha ao salvar na galeria.'
          : 'Permissão da galeria negada. Vá em Configurações > Apps > Scanner Pronto PDF > Permissões e permita Fotos/Mídia.',
      );
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
            <PrimaryButton label={saveLabel} onPress={onSave} />
          </View>
        </Card>

        <Text style={styles.hint}>
          JPEG salva na Galeria. PDF vamos gerar e salvar em Downloads depois.
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
