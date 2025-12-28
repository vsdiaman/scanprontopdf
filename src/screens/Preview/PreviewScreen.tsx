import React, { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
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

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

function sanitizeFileName(rawName: string) {
  return rawName
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');
}

export function PreviewScreen({ navigation, route }: Props) {
  const { imageUri } = route.params;

  const [saveFormat, setSaveFormat] = useState<SaveFormat>('PDF');
  const [fileName, setFileName] = useState('scan_001');
  const [isSaving, setIsSaving] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [shouldGoHomeAfterOk, setShouldGoHomeAfterOk] = useState(false);

  const fileExtension = saveFormat === 'PDF' ? '.pdf' : '.jpg';

  const safeBaseName = useMemo(() => {
    return sanitizeFileName(fileName) || 'scan';
  }, [fileName]);

  const finalFileName = useMemo(() => {
    return `${safeBaseName}${fileExtension}`;
  }, [safeBaseName, fileExtension]);

  const saveLabel = useMemo(() => {
    return isSaving ? 'Salvando...' : `Salvar ${finalFileName}`;
  }, [isSaving, finalFileName]);

  const openModal = (
    title: string,
    message: string,
    goHomeAfterOk: boolean,
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setShouldGoHomeAfterOk(goHomeAfterOk);
    setIsModalVisible(true);
  };

  const onSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const { savedInAppPath, exportedPath } = await saveScanAndExport({
        imageUri,
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
        'Salvo',
        buildSaveSuccessMessage(saveFormat, exportedPath),
        true,
      );
    } catch (error: any) {
      openModal('Erro', error?.message || 'Erro ao salvar.', false);
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
            <Text style={styles.label}>Formato</Text>
            <SegmentedControl
              value={saveFormat}
              options={['PDF', 'JPEG']}
              onChange={value => setSaveFormat(value as SaveFormat)}
            />

            <Text style={[styles.label, { marginTop: spacing.lg }]}>
              Nome do arquivo
            </Text>

            <View style={styles.previewNameRow}>
              <Text style={styles.previewNameLabel}>Vai salvar como:</Text>
              <Text style={styles.previewNameValue} numberOfLines={1}>
                {finalFileName}
              </Text>
            </View>

            <TextInput
              value={fileName}
              onChangeText={setFileName}
              placeholder="Ex: contrato_2025"
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

            <Text style={styles.hint}>
              Dica: use nomes curtos (sem acentos). PDF/JPEG serão salvos no
              aparelho.
            </Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      <InfoModal
        visible={isModalVisible}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
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
