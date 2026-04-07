import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { t } from '../i18n';
import {
  PDF_PASSWORD_MIN_LENGTH,
  validatePdfPassword,
} from '../features/history/pdfPasswordService';

type SubmitPayload = {
  shouldProtect: boolean;
  password: string;
  confirmPassword: string;
};

type Props = {
  visible: boolean;
  title: string;
  allowSkipProtection?: boolean;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: (payload: SubmitPayload) => void;
};

export function PdfPasswordModal({
  visible,
  title,
  allowSkipProtection = false,
  confirmLabel = t('common.save'),
  onCancel,
  onConfirm,
}: Props) {
  const translateY = useRef(new Animated.Value(420)).current;
  const [shouldProtect, setShouldProtect] = useState(!allowSkipProtection);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!visible) return;

    setShouldProtect(!allowSkipProtection);
    setPassword('');
    setConfirmPassword('');

    Animated.timing(translateY, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [allowSkipProtection, translateY, visible]);

  const close = () => {
    Animated.timing(translateY, {
      toValue: 420,
      duration: 180,
      useNativeDriver: true,
    }).start(() => onCancel());
  };

  const validationError = useMemo(() => {
    if (!shouldProtect) return null;
    return validatePdfPassword(password, confirmPassword);
  }, [confirmPassword, password, shouldProtect]);

  const canConfirm = !shouldProtect || !validationError;

  const handleConfirm = () => {
    if (!canConfirm) return;

    onConfirm({
      shouldProtect,
      password: password.trim(),
      confirmPassword: confirmPassword.trim(),
    });
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

          <Text style={styles.title}>{title}</Text>

          {allowSkipProtection ? (
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{t('pdfProtection.enableToggle')}</Text>
              <Switch
                value={shouldProtect}
                onValueChange={setShouldProtect}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={shouldProtect ? '#2563EB' : '#F8FAFC'}
              />
            </View>
          ) : null}

          {shouldProtect ? (
            <>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t('pdfProtection.passwordPlaceholder')}
                placeholderTextColor={colors.mutedText}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />

              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t('pdfProtection.confirmPlaceholder')}
                placeholderTextColor={colors.mutedText}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />

              <Text style={styles.hint}>
                {t('pdfProtection.passwordHint', {
                  min: PDF_PASSWORD_MIN_LENGTH,
                })}
              </Text>

              {validationError ? (
                <Text style={styles.errorText}>{validationError}</Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.hint}>{t('pdfProtection.disabledHint')}</Text>
          )}

          <View style={styles.actions}>
            <Pressable
              onPress={close}
              style={[styles.button, styles.buttonGhost]}
            >
              <Text style={[styles.buttonText, styles.buttonTextGhost]}>
                {t('common.cancel')}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              disabled={!canConfirm}
              style={[styles.button, !canConfirm && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>{confirmLabel}</Text>
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  switchLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
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
    marginTop: spacing.sm,
  },
  hint: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
    marginTop: spacing.xs,
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
