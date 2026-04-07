import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { t } from '../i18n';

interface MergeProgressOverlayProps {
  visible: boolean;
  progress: number;
  statusText?: string;
  isSuccess?: boolean;
}

export function MergeProgressOverlay({
  visible,
  progress,
  statusText,
  isSuccess = false,
}: MergeProgressOverlayProps) {
  const normalizedProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const progressAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      progressAnim.setValue(0);
      successAnim.setValue(0);
      return;
    }

    Animated.timing(progressAnim, {
      toValue: normalizedProgress,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [normalizedProgress, progressAnim, successAnim, visible]);

  useEffect(() => {
    if (!visible || !isSuccess) {
      successAnim.setValue(0);
      return;
    }

    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isSuccess, successAnim, visible]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const successScale = successAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.backdrop}>
        <View style={styles.card}>
          {isSuccess ? (
            <Animated.View
              style={[
                styles.successWrap,
                { opacity: successAnim, transform: [{ scale: successScale }] },
              ]}
            >
              <Icon name="check-circle" size={48} color="#16A34A" />
            </Animated.View>
          ) : (
            <View style={styles.iconWrap}>
              <Icon name="set-merge" size={34} color="#1E293B" />
            </View>
          )}

          <Text style={styles.title}>
            {isSuccess ? t('history.mergeProgressDone') : t('history.mergeProgressTitle')}
          </Text>
          <Text style={styles.message}>
            {statusText || t('history.mergeProgressPreparing')}
          </Text>

          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, { width: progressWidth }]} />
          </View>

          <Text style={styles.percent}>{normalizedProgress}%</Text>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,18,32,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: 10,
  },
  successWrap: {
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  message: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    minHeight: 18,
  },
  barTrack: {
    width: '100%',
    marginTop: 18,
    height: 10,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  percent: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
});
