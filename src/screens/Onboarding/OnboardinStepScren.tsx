import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  PanResponder,
  PanResponderInstance,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/types';
import { onboardingSteps } from './onboardingSteps';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingStep'>;

const { width: screenWidth } = Dimensions.get('window');

const UI = {
  back: '#6f7eeeff',
  titleText: '#FFFFFF',
  descText: 'rgba(255,255,255,0.85)',
  pillBorder: 'rgba(255,255,255,0.65)',
  pillText: '#FFFFFF',
};

export function OnboardingStepScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();

  const initialIndex =
    typeof route.params?.stepIndex === 'number' ? route.params.stepIndex : 0;
  const [stepIndex, setStepIndex] = useState(initialIndex);

  const step = onboardingSteps[stepIndex];
  const isLastStep = stepIndex >= onboardingSteps.length - 1;

  const anim = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  const translateX = anim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [screenWidth * 0.55, 0, -screenWidth * 0.55],
  });

  const rotateY = anim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['70deg', '0deg', '-70deg'],
  });

  const opacity = anim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.2, 1, 0.2],
  });

  const shadowOpacity = anim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.22, 0, 0.22],
  });

  const animateToNext = () => {
    if (isAnimating.current) return;

    if (isLastStep) {
      navigation.replace('Home');
      return;
    }

    isAnimating.current = true;

    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setStepIndex(prev => prev + 1);

      anim.setValue(-1);

      Animated.timing(anim, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        isAnimating.current = false;
      });
    });
  };

  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10,
      onPanResponderRelease: (_, g) => {
        if (g.dy < -80) animateToNext();
      },
    }),
  ).current;

  const buttonLabel = isLastStep ? 'Começar' : 'Próximo';

  return (
    <View style={styles.container}>
      <View style={styles.body} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.animatedPage,
            {
              opacity,
              transform: [{ perspective: 1200 }, { translateX }, { rotateY }],
            },
          ]}
        >
          <View style={styles.textBox}>
            <Text
              style={styles.title}
              // numberOfLines={3}
              allowFontScaling={false}
            >
              {step.title}
            </Text>

            <Text
              style={styles.description}
              numberOfLines={3}
              allowFontScaling={false}
            >
              {step.description}
            </Text>
          </View>

          <View style={styles.imageBox}>
            <Image
              source={step.image}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              styles.pageShadow,
              { opacity: shadowOpacity },
            ]}
          />
        </Animated.View>
      </View>

      {/* BOTÃO FIXO NO FUNDO */}
      <View style={[styles.fixedFooter, { paddingBottom: 12 + insets.bottom }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={animateToNext}
          style={styles.button}
        >
          <Text style={styles.buttonText} allowFontScaling={false}>
            {buttonLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.back },

  body: {
    flex: 1,
    paddingTop: 34,
    paddingBottom: 110, // espaço reservado pro footer fixo
  },

  animatedPage: {
    flex: 1,
  },

  pageShadow: {
    backgroundColor: '#000',
  },

  textBox: {
    width: '100%',
    paddingHorizontal: 6,
    alignItems: 'center',
  },

  title: {
    width: '100%',
    color: UI.titleText,
    fontWeight: '700',
    fontSize: 42,
    textAlign: 'center',
    marginTop: 60,
  },

  description: {
    marginTop: 10,
    width: '100%',
    color: UI.descText,
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },

  imageBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: '100%',
    height: 340,
  },

  fixedFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: UI.back, // mantém igual ao fundo
  },

  button: {
    width: '100%',
    height: 62,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: UI.pillBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  buttonText: {
    color: UI.pillText,
    fontWeight: '800',
    fontSize: 22,
    letterSpacing: 0.2,
  },
});
