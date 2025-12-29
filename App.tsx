import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import mobileAds from 'react-native-google-mobile-ads';

export default function App() {
  useEffect(() => {
    mobileAds().initialize();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <RootNavigator />
    </NavigationContainer>
  );
}
