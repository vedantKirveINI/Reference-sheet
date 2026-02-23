import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonEn from './locales/en/common.json';
import gridEn from './locales/en/grid.json';
import viewsEn from './locales/en/views.json';

import commonEs from './locales/es/common.json';
import gridEs from './locales/es/grid.json';
import viewsEs from './locales/es/views.json';

const resources = {
  en: {
    common: commonEn,
    grid: gridEn,
    views: viewsEn,
  },
  es: {
    common: commonEs,
    grid: gridEs,
    views: viewsEs,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'grid', 'views'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
