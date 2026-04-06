import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import mobileAds from 'react-native-google-mobile-ads';
import * as RNLocalize from 'react-native-localize';

import { RootNavigator } from './src/navigation/RootNavigator';
import { loadInterstitial } from './src/ads/interstitial';
import { setI18nConfig } from './src/i18n';

export default function App() {
  const [i18nKey, setI18nKey] = useState(0);

  useEffect(() => {
    mobileAds().initialize();
    loadInterstitial();
  }, []);

  useEffect(() => {
    const onChange = () => {
      setI18nConfig();
      setI18nKey(v => v + 1); // força re-render geral
    };

    // compat: versões antigas e novas do react-native-localize
    const sub = (RNLocalize as any).addEventListener?.('change', onChange);
    return () => {
      (RNLocalize as any).removeEventListener?.('change', onChange);
      sub?.remove?.();
    };
  }, []);

  const navKey = useMemo(() => String(i18nKey), [i18nKey]);

  return (
    <NavigationContainer key={navKey}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <RootNavigator />
    </NavigationContainer>
  );
}
