import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = {
  title: string;
  subtitle?: string;
  leftActionLabel?: string;
  onLeftActionPress?: () => void;
  rightActionLabel?: string;
  onRightActionPress?: () => void;
};

export function AppHeader({
  title,
  subtitle,
  leftActionLabel,
  onLeftActionPress,
  rightActionLabel,
  onRightActionPress,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          onPress={onLeftActionPress}
          disabled={!onLeftActionPress}
          hitSlop={10}
          style={[styles.action, !onLeftActionPress && styles.actionDisabled]}
        >
          <Text style={styles.actionText}>{leftActionLabel ?? ''}</Text>
        </Pressable>

        <View style={styles.center}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <Pressable
          onPress={onRightActionPress}
          disabled={!onRightActionPress}
          hitSlop={10}
          style={[styles.action, !onRightActionPress && styles.actionDisabled]}
        >
          <Text style={styles.actionText}>{rightActionLabel ?? ''}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  action: { width: 70 },
  actionDisabled: { opacity: 0 },
  actionText: { color: colors.primary, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center' },
  title: { color: colors.text, fontSize: 16, fontWeight: '900' },
  subtitle: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
});
