import React, { useCallback, useEffect, useRef } from 'react';
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import DocumentScanner from 'react-native-document-scanner-plugin';

import { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BannerBottom } from '../../components/BannerBottom';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { t } from '../../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>;

const BANNER_HEIGHT = 60;

function normalizeUri(path: string) {
  if (path.startsWith('file://') || path.startsWith('content://')) return path;
  return `file://${path}`;
}

function normalizeScanResultUris(scannedImages?: string[]) {
  if (!Array.isArray(scannedImages)) return [];
  const seen = new Set<string>();

  return scannedImages
    .filter(Boolean)
    .map(imagePath => normalizeUri(String(imagePath)))
    .filter(uri => {
      if (seen.has(uri)) return false;
      seen.add(uri);
      return true;
    });
}

async function ensureCameraPermission() {
  if (Platform.OS !== 'android') return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );

  if (granted === PermissionsAndroid.RESULTS.GRANTED) return true;

  Alert.alert(t('common.permission'), t('scan.permissionMessage'));
  return false;
}

export function ScanScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const isMountedRef = useRef(true);
  const isProcessingRef = useRef(false);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const startScan = useCallback(async () => {
    if (isProcessingRef.current) return;

    isProcessingRef.current = true;

    try {
      const allowed = await ensureCameraPermission();
      if (!allowed) return;

      const { scannedImages, status } = await DocumentScanner.scanDocument({
        croppedImageQuality: 90,
      });

      const normalizedUris = normalizeScanResultUris(scannedImages);
      if (status !== 'success' || normalizedUris.length === 0) {
        if (isMountedRef.current) navigation.goBack();
        return;
      }

      const imageUri = normalizedUris[0];

      if (!hasNavigatedRef.current && isMountedRef.current) {
        hasNavigatedRef.current = true;
        navigation.replace('Preview', {
          imageUri,
          imageUris: normalizedUris,
        });
      }
    } catch {
      if (isMountedRef.current) {
        Alert.alert(t('common.error'), t('scan.startError'));
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AppHeader
        title={t('scan.headerTitle')}
        leftActionLabel={t('common.back')}
        onLeftActionPress={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing.xl + BANNER_HEIGHT + insets.bottom },
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{t('scan.readyTitle')}</Text>

          <Text style={styles.subtitle}>{t('scan.subtitle')}</Text>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>{t('scan.tipTitle')}</Text>
            <Text style={styles.tipText}>{t('scan.tipText')}</Text>
          </View>

          <View style={styles.steps}>
            <View style={styles.stepRow}>
              <View style={styles.stepDot} />
              <Text style={styles.stepText}>{t('scan.step1')}</Text>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepDot} />
              <Text style={styles.stepText}>{t('scan.step2')}</Text>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepDot} />
              <Text style={styles.stepText}>{t('scan.step3')}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <PrimaryButton label={t('scan.startButton')} onPress={startScan} />
            <Text style={styles.helper}>{t('scan.helper')}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bannerWrap, { paddingBottom: insets.bottom }]}>
        <BannerBottom />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    justifyContent: 'flex-start',
  },

  bannerWrap: {
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingTop: spacing.sm,
  },

  card: {
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.xl,
    borderStyle: 'dashed',
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
