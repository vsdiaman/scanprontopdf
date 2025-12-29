import React from 'react';
import { View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

const bannerUnitId = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-7046874699264482/3710883327';

export function BannerBottom() {
  return (
    <View style={{ alignItems: 'center' }}>
      <BannerAd
        unitId={bannerUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
}
