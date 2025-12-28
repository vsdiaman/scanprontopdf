import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = {
  visible: boolean;
  initialValue: string;
  onCancel: () => void;
  onConfirm: (newTitle: string) => void;
};

function sanitizeTitle(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 60);
}

export function RenameFileModal({
  visible,
  initialValue,
  onCancel,
  onConfirm,
}: Props) {
  const [value, setValue] = useState(initialValue);

  const translateY = useRef(new Animated.Value(420)).current;

  useEffect(() => {
    if (!visible) return;
    setValue(initialValue);

    Animated.timing(translateY, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, initialValue, translateY]);

  const close = () => {
    Animated.timing(translateY, {
      toValue: 420,
      duration: 180,
      useNativeDriver: true,
    }).start(() => onCancel());
  };

  const canSave = useMemo(() => sanitizeTitle(value).length > 0, [value]);

  const save = () => {
    const newTitle = sanitizeTitle(value);
    if (!newTitle) return;
    onConfirm(newTitle);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <Pressable style={styles.backdrop} onPress={close} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />

          <Text style={styles.title}>Renomear</Text>

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Novo título"
            placeholderTextColor={colors.mutedText}
            style={styles.input}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={save}
          />

          <View style={styles.actions}>
            <Pressable
              onPress={close}
              style={[styles.button, styles.buttonGhost]}
            >
              <Text style={[styles.buttonText, styles.buttonTextGhost]}>
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              onPress={save}
              disabled={!canSave}
              style={[styles.button, !canSave && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>Salvar</Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  keyboard: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    color: colors.text,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGhost: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
  },
  buttonTextGhost: {
    color: colors.text,
  },
});
