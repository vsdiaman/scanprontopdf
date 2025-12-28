// src/components/Toast.tsx (versão mais visível e mais alta)

import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ToastType = 'success' | 'error';

type Props = {
  visible: boolean;
  message: string;
  type?: ToastType;
  durationMs?: number;
  onHide: () => void;
};

export function Toast({
  visible,
  message,
  type = 'success',
  durationMs = 1400,
  onHide,
}: Props) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const borderColor = useMemo(() => {
    return type === 'error' ? colors.danger : colors.border;
  }, [type]);

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }, durationMs);

    return () => clearTimeout(timer);
  }, [visible, durationMs, onHide, opacity, translateY]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible>
      <View pointerEvents="none" style={styles.wrap}>
        <Animated.View
          style={[
            styles.toast,
            { borderColor, opacity, transform: [{ translateY }] },
          ]}
        >
          <Text style={styles.text} numberOfLines={3}>
            {message}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  toast: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,

    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
});
