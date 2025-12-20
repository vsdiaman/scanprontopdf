import React, { useCallback } from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DocumentScanner from 'react-native-document-scanner-plugin';

import { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>;

function normalizeUri(path: string) {
  if (path.startsWith('file://') || path.startsWith('content://')) return path;
  return `file://${path}`;
}

async function ensureCameraPermission() {
  if (Platform.OS !== 'android') return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );

  if (granted === PermissionsAndroid.RESULTS.GRANTED) return true;

  Alert.alert('Permissão', 'Permita acesso à câmera para escanear.');
  return false;
}

export function ScanScreen({ navigation }: Props) {
  const startScan = useCallback(async () => {
    const allowed = await ensureCameraPermission();
    if (!allowed) return;

    try {
      const { scannedImages, status } = await DocumentScanner.scanDocument({
        croppedImageQuality: 90,
      });

      if (status !== 'success' || !scannedImages?.length) {
        navigation.goBack();
        return;
      }

      const imageUri = normalizeUri(scannedImages[0]);
      navigation.replace('Preview', { imageUri });
    } catch {
      Alert.alert('Erro', 'Falha ao abrir o scanner.');
    }
  }, [navigation]);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Escanear documento"
        leftActionLabel="Voltar"
        onLeftActionPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <PrimaryButton label="Abrir câmera (scanner)" onPress={startScan} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
});
