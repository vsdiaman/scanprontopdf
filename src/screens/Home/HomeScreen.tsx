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
import { BannerBottom } from '../../components/BannerBottom';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const BANNER_HEIGHT = 60; // bom o bastante pra ANCHORED/BANNER em muitos devices

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const startScan = () => navigation.navigate('Scan');

  return (
    <View style={styles.container}>
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <AppHeader
          title="Scanner Pronto PDF"
          subtitle="Escaneie em 1 toque 😊"
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl + BANNER_HEIGHT },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Scaneie seu documento</Text>
          <Text style={styles.heroDesc}>
            Fluxo simples: capturar → escolher formato → salvar.
          </Text>

          <View style={styles.heroActions}>
            <SecondaryButton label="Escanear agora" onPress={startScan} />
          </View>
        </View>

        <HistoryCard />
      </ScrollView>

      <View style={[styles.bannerWrap, { paddingBottom: insets.bottom }]}>
        <BannerBottom />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  headerWrap: { backgroundColor: colors.background },

  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },

  bannerWrap: {
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingTop: spacing.sm,
  },

  heroCard: {
    borderRadius: 22,
    padding: spacing.xl,
    backgroundColor: colors.back,
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
