import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('OnboardingStep', { stepIndex: 0 });
    }, 650);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Scanner</Text>
        <Text style={styles.badgeTextBold}>Pronto</Text>
      </View>

      <Text style={styles.title}>Scanner Pronto PDF</Text>
      <Text style={styles.subtitle}>Rápido, simples e direto.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  badgeText: { color: colors.primaryText, fontWeight: '800' },
  badgeTextBold: { color: colors.primaryText, fontWeight: '900' },
  title: { color: colors.text, fontSize: 18, fontWeight: '900' },
  subtitle: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
});
