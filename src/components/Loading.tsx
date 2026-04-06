import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { t } from '../i18n';

type LoadingProps = {
  label?: string;
  size?: 'small' | 'large';
  inline?: boolean;
};

export function Loading({
  label = t('common.loading'),
  size = 'small',
  inline = false,
}: LoadingProps) {
  return (
    <View style={[styles.container, inline && styles.inline]}>
      <ActivityIndicator size={size} color={colors.back} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  inline: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 12,
    color: colors.mutedText,
    fontWeight: '700',
  },
});
