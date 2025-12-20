import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SegmentedControl } from '../../components/SegmentedControl';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

type SaveFormat = 'PDF' | 'JPEG';

export function PreviewScreen({ navigation }: Props) {
  const [saveFormat, setSaveFormat] = useState<SaveFormat>('PDF');
  const [fileName, setFileName] = useState('scan_001');

  const fileExtension = saveFormat === 'PDF' ? '.pdf' : '.jpg';

  const saveLabel = useMemo(() => {
    const safeName = fileName.trim() || 'scan';
    return `Salvar ${safeName}${fileExtension}`;
  }, [fileName, fileExtension]);

  const onSave = () => {
    Alert.alert('Salvo', 'Aqui você liga a lógica real depois (PDF/JPEG).');
    navigation.goBack();
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
            <Text style={styles.previewTitle}>Preview da imagem</Text>
            <Text style={styles.previewDesc}>
              Placeholder (depois entra a foto do scan)
            </Text>
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
            <PrimaryButton label={saveLabel} onPress={onSave} />
          </View>
        </Card>

        <Text style={styles.hint}>
          Depois: capturar câmera, crop, compressão, gerar PDF,
          salvar/compartilhar.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.xl, gap: spacing.lg },

  previewBox: {
    height: 220,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  previewTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  previewDesc: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xs,
    textAlign: 'center',
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
