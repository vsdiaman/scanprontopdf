import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';

const interstitialUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-7046874699264482/7315086418';

// não spammar
const COOLDOWN_MS = 90_000;

let interstitialAd: InterstitialAd | null = null;
let isLoaded = false;
let lastShownAt = 0;

function getInterstitialAd() {
  if (interstitialAd) return interstitialAd;

  interstitialAd = InterstitialAd.createForAdRequest(interstitialUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    isLoaded = true;
  });

  interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    isLoaded = false;
    loadInterstitial();
  });

  interstitialAd.addAdEventListener(AdEventType.ERROR, () => {
    isLoaded = false;
    loadInterstitial();
  });

  return interstitialAd;
}

export function loadInterstitial() {
  const ad = getInterstitialAd();
  if (!isLoaded) ad.load();
}

export async function showInterstitialIfReady() {
  const now = Date.now();

  if (!isLoaded) return false;
  if (now - lastShownAt < COOLDOWN_MS) return false;

  lastShownAt = now;
  await interstitialAd!.show();
  return true;
}
