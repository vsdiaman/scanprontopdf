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

        <Text style={styles.title}>Scanner Pronto PDF</Text>
        {/* se quiser traduzir o nome do app agora:
        <Text style={styles.title}>Scanner Ready PDF</Text>
        */}

        <Text style={styles.subtitle}>Fast, simple, and straightforward.</Text>
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
  content: { alignItems: 'center' },

  iconWrap: {
    width: 184,
    height: 184,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 190,
    height: 190,
    borderRadius: 32,
  },

  title: { color: colors.text, fontSize: 36, fontWeight: '900' },
  subtitle: {
    color: colors.mutedText,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
});
