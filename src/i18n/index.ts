import { I18n } from 'i18n-js';
import { getLocales } from 'react-native-localize';

import pt from './translations/pt-BR';
import en from './translations/en';
import es from './translations/es';

const DEFAULT_LOCALE = 'pt';

const i18n = new I18n({
  pt,
  'pt-BR': pt,
  en,
  es,
});

i18n.enableFallback = true;
i18n.defaultLocale = DEFAULT_LOCALE;

type SupportedLocale = 'pt' | 'en' | 'es';

function pickLocale(): SupportedLocale {
  const localeTag = getLocales()[0]?.languageTag?.toLowerCase() ?? DEFAULT_LOCALE;

  if (localeTag.startsWith('pt')) return 'pt';
  if (localeTag.startsWith('es')) return 'es';

  return 'en';
}

export function setI18nConfig() {
  i18n.locale = pickLocale();
}

setI18nConfig();

export function t(
  key: string,
  params?: Record<string, string | number | boolean>,
) {
  return i18n.t(key, params);
}
