import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { onboardingSteps } from './onboardingSteps';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingStep'>;

export function OnboardingStepScreen({ navigation, route }: Props) {
  const stepIndex = route.params.stepIndex;
  const step = onboardingSteps[stepIndex];

  const isLastStep = stepIndex >= onboardingSteps.length - 1;
  const progressText = useMemo(
    () => `${stepIndex + 1}/${onboardingSteps.length}`,
    [stepIndex],
  );

  const goNext = () => {
    navigation.replace('OnboardingStep', { stepIndex: stepIndex + 1 });
  };

  const finish = () => {
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.progress}>{progressText}</Text>
        <Text onPress={finish} style={styles.skip}>
          Pular
        </Text>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Text style={styles.heroIconText}>SP</Text>
        </View>

        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>
      </View>

      <View style={styles.actions}>
        {isLastStep ? (
          <PrimaryButton label="Começar" onPress={finish} />
        ) : (
          <>
            <PrimaryButton label="Próximo" onPress={goNext} />
            <SecondaryButton label="Ir para o app" onPress={finish} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progress: { color: colors.mutedText, fontWeight: '900' },
  skip: { color: colors.primary, fontWeight: '900' },

  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroIcon: {
    width: 92,
    height: 92,
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroIconText: { color: colors.primary, fontWeight: '900', fontSize: 22 },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 20,
  },

  actions: { paddingBottom: spacing.xl, gap: spacing.sm },
});
