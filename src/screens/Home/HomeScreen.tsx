import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../navigation/types';
import { AppHeader } from '../../components/AppHeader';
import { SecondaryButton } from '../../components/SecondaryButton';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { HistoryCard } from '../../features/history/historyCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const startScan = () => navigation.navigate('Scan');

  return (
    <View style={styles.container}>
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <AppHeader title="Scanner Pronto PDF" subtitle="Escaneie em 1 toque" />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Scan your first document</Text>
          <Text style={styles.heroDesc}>
            Fluxo simples: capturar → escolher formato → salvar.
          </Text>

          <View style={styles.heroActions}>
            <SecondaryButton label="Escanear agora" onPress={startScan} />
          </View>
        </View>

        <HistoryCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  headerWrap: {
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },

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
});
