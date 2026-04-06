import { I18n } from 'i18n-js';
import { getLocales } from 'react-native-localize';

import ptBR from './translations/pt-BR';
import en from './translations/en';

const i18n = new I18n({
  en,
  'pt-BR': ptBR,
  pt: ptBR,
});

i18n.enableFallback = true;

function pickLocale() {
  const localeTag = getLocales()[0]?.languageTag ?? 'en';

  // pt-PT, pt-AO, etc -> pt
  if (localeTag.startsWith('pt')) return 'pt-BR';

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
