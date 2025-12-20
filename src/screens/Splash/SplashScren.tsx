import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const APP_ICON = require('../../assets/icons/app-icon.png');

export function SplashScreen({ navigation }: Props) {
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(10)).current;
  const contentScale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    const enter = Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 820,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentScale, {
        toValue: 1,
        duration: 1520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const exit = Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 660,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    });

    enter.start();

    const timerId = setTimeout(() => {
      exit.start(() => {
        navigation.replace('OnboardingStep', { stepIndex: 0 });
      });
    }, 3400);

    return () => {
      clearTimeout(timerId);
      containerOpacity.stopAnimation();
      contentTranslateY.stopAnimation();
      contentScale.stopAnimation();
    };
  }, [navigation, containerOpacity, contentTranslateY, contentScale]);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [
              { translateY: contentTranslateY },
              { scale: contentScale },
            ],
          },
        ]}
      >
        <View style={styles.iconWrap}>
          <Image source={APP_ICON} style={styles.icon} />
        </View>

        {/* <View style={styles.badge}>
          <Text style={styles.badgeText}>Scanner</Text>
          <Text style={styles.badgeTextBold}>Pronto</Text>
        </View> */}

        <Text style={styles.title}>Scanner Pronto PDF</Text>
        <Text style={styles.subtitle}>Rápido, simples e direto.</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sky50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },

  iconWrap: {
    width: 184, // 92 * 2
    height: 184, // 92 * 2
    borderRadius: 48, // 24 * 2
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8, // 18 * 2
  },
  icon: {
    width: 190, // 64 * 2
    height: 190, // 64 * 2
    borderRadius: 32, // 16 * 2
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
  title: { color: colors.text, fontSize: 36, fontWeight: '900' }, // 18 * 2
  subtitle: {
    color: colors.mutedText,
    fontSize: 26, // 13 * 2
    fontWeight: '700',
    marginTop: 12, // 6 * 2
  },
});
