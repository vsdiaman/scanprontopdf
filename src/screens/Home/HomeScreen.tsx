import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const startScan = () => navigation.navigate('Scan');

  return (
    <View style={styles.container}>
      <AppHeader title="Scanner Pronto PDF" subtitle="Escaneie em 1 toque" />

      <View style={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Scan your first document</Text>
          <Text style={styles.heroDesc}>
            Fluxo simples: capturar → escolher formato → salvar.
          </Text>
          <View style={styles.heroActions}>
            <PrimaryButton label="Escanear agora" onPress={startScan} />
            <SecondaryButton
              label="Como funciona"
              onPress={() =>
                navigation.navigate('OnboardingStep', { stepIndex: 0 })
              }
            />
          </View>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Recentes</Text>
          <Text style={styles.sectionDesc}>
            Nenhum arquivo ainda. (UI apenas)
          </Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.xl, gap: spacing.lg },
  heroCard: {
    borderRadius: 22,
    padding: spacing.xl,
    backgroundColor: colors.primary,
  },
  heroTitle: { color: colors.primaryText, fontSize: 20, fontWeight: '900' },
  heroDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  heroActions: { marginTop: spacing.lg, gap: spacing.sm },

  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  sectionDesc: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
});
