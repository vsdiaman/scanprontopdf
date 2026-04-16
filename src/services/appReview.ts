import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';
import StoreReview from 'react-native-store-review';

const ANDROID_APP_ID = 'br.com.huolong.scanprontopdf';
const IOS_APP_ID = '0000000000';

const REVIEW_STORAGE_KEYS = {
  successfulActionCount: '@app_review_successful_action_count',
  promptShownCount: '@app_review_prompt_shown_count',
  lastPromptDate: '@app_review_last_prompt_date',
};

const REVIEW_FREQUENCY_LIMITS = {
  minimumSuccessfulActionsBeforePrompt: 1,
  maximumPromptShownCount: 3,
  minimumDaysBetweenPrompts: 30,
};

function toSafeNumber(value: string | null) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

async function getStoredNumber(storageKey: string) {
  try {
    const storedValue = await AsyncStorage.getItem(storageKey);
    return toSafeNumber(storedValue);
  } catch {
    return 0;
  }
}

export async function incrementSuccessfulActionCount() {
  try {
    const currentCount = await getStoredNumber(
      REVIEW_STORAGE_KEYS.successfulActionCount,
    );
    const nextCount = currentCount + 1;
    await AsyncStorage.setItem(
      REVIEW_STORAGE_KEYS.successfulActionCount,
      String(nextCount),
    );
    return nextCount;
  } catch {
    return 0;
  }
}

export async function markReviewPromptShown() {
  try {
    const currentShownCount = await getStoredNumber(
      REVIEW_STORAGE_KEYS.promptShownCount,
    );
    const nextShownCount = currentShownCount + 1;

    await AsyncStorage.multiSet([
      [REVIEW_STORAGE_KEYS.promptShownCount, String(nextShownCount)],
      [REVIEW_STORAGE_KEYS.lastPromptDate, new Date().toISOString()],
    ]);
  } catch {
    // silent fail to avoid blocking user flow
  }
}

function hasMinimumDaysBetweenPrompts(lastPromptDateValue: string | null) {
  if (!lastPromptDateValue) return true;

  const lastPromptTimestamp = Date.parse(lastPromptDateValue);
  if (Number.isNaN(lastPromptTimestamp)) return true;

  const daysElapsed =
    (Date.now() - lastPromptTimestamp) / (1000 * 60 * 60 * 24);

  return daysElapsed >= REVIEW_FREQUENCY_LIMITS.minimumDaysBetweenPrompts;
}

export async function shouldAskForReview() {
  try {
    const [successfulActionCount, promptShownCount, lastPromptDateValue] =
      await Promise.all([
        getStoredNumber(REVIEW_STORAGE_KEYS.successfulActionCount),
        getStoredNumber(REVIEW_STORAGE_KEYS.promptShownCount),
        AsyncStorage.getItem(REVIEW_STORAGE_KEYS.lastPromptDate),
      ]);

    if (
      successfulActionCount <
      REVIEW_FREQUENCY_LIMITS.minimumSuccessfulActionsBeforePrompt
    ) {
      return false;
    }

    if (
      promptShownCount >= REVIEW_FREQUENCY_LIMITS.maximumPromptShownCount
    ) {
      return false;
    }

    return hasMinimumDaysBetweenPrompts(lastPromptDateValue);
  } catch {
    return false;
  }
}

export async function requestAppReview() {
  try {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return false;

    await StoreReview.requestReview();
    return true;
  } catch {
    return false;
  }
}

async function openUrlWithFallback(primaryUrl: string, fallbackUrl: string) {
  try {
    const canOpenPrimaryUrl = await Linking.canOpenURL(primaryUrl);
    if (canOpenPrimaryUrl) {
      await Linking.openURL(primaryUrl);
      return true;
    }
  } catch {
    // fallback to web url
  }

  try {
    await Linking.openURL(fallbackUrl);
    return true;
  } catch {
    return false;
  }
}

export async function openStoreReviewPage() {
  if (Platform.OS === 'android') {
    const playStoreNativeUrl = `market://details?id=${ANDROID_APP_ID}`;
    const playStoreWebUrl = `https://play.google.com/store/apps/details?id=${ANDROID_APP_ID}`;

    return openUrlWithFallback(playStoreNativeUrl, playStoreWebUrl);
  }

  if (Platform.OS === 'ios') {
    const appStoreNativeUrl = `itms-apps://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`;
    const appStoreWebUrl = `https://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`;

    return openUrlWithFallback(appStoreNativeUrl, appStoreWebUrl);
  }

  return false;
}

export async function maybeAskForReview() {
  try {
    const shouldPrompt = await shouldAskForReview();
    if (!shouldPrompt) return false;

    const requestedNativeReview = await requestAppReview();
    const openedStorePage = requestedNativeReview
      ? false
      : await openStoreReviewPage();

    if (requestedNativeReview || openedStorePage) {
      await markReviewPromptShown();
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
