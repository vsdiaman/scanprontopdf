import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
};

export function InfoModal({
  visible,
  title,
  message,
  confirmText = 'Entendi',
  onConfirm,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onConfirm}
    >
      <Pressable style={styles.backdrop} onPress={onConfirm} />

      <View style={styles.center}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Pressable onPress={onConfirm} style={styles.button}>
              <Text style={styles.buttonText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    borderRadius: 18,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  actions: {
    marginTop: spacing.lg,
  },
  button: {
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
  },
});
