// src/screens/Scan/ScanScreen.tsx
import React, { useCallback } from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Escanear documento"
        leftActionLabel="Voltar"
        onLeftActionPress={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Pronto para escanear</Text>

          <Text style={styles.subtitle}>
            Posicione o documento dentro da câmera. O app detecta as bordas e
            recorta automaticamente.
          </Text>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>Dica de qualidade</Text>
            <Text style={styles.tipText}>
              Ao posicionar a câmera no documento, recomenda-se deixar que o
              próprio aplicativo tire a foto, assim vai sair um documento com
              melhor qualidade.
            </Text>
          </View>

          <View style={styles.steps}>
            <View style={styles.stepRow}>
              <View style={styles.stepDot} />
              <Text style={styles.stepText}>
                Mantenha o celular firme e o documento bem iluminado
              </Text>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepDot} />
              <Text style={styles.stepText}>
                Evite sombras e reflexos (principalmente em mesa brilhante)
              </Text>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepDot} />
              <Text style={styles.stepText}>
                Deixe o app capturar automaticamente
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <PrimaryButton label="Iniciar scanner" onPress={startScan} />
            <Text style={styles.helper}>
              Você vai voltar para a prévia para escolher PDF ou JPEG.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // card mais pra cima (não centraliza no meio)
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'flex-start',
  },

  card: {
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },

  title: { color: colors.text, fontSize: 18, fontWeight: '900' },
  subtitle: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.sm,
    lineHeight: 18,
  },

  tipBox: {
    marginTop: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  tipTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  tipText: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },

  steps: { marginTop: spacing.lg, gap: spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  stepText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },

  actions: { marginTop: spacing.xl, gap: spacing.sm },
  helper: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});
