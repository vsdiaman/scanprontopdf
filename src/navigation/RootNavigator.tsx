import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import { SplashScreen } from '../screens/Splash/SplashScren';
import { OnboardingStepScreen } from '../screens/Onboarding/OnboardinStepScren';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { PreviewScreen } from '../screens/Preview/PreviewScreen';
import { ScanScreen } from '../screens/Scan/ScanScreen';
const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="OnboardingStep" component={OnboardingStepScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Preview" component={PreviewScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />
    </Stack.Navigator>
  );
}
