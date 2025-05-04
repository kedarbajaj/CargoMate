
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from '../locales/en.json';
import hiTranslation from '../locales/hi.json';
import teTranslation from '../locales/te.json';
import taTranslation from '../locales/ta.json';
import mrTranslation from '../locales/mr.json';
import guTranslation from '../locales/gu.json';

// Configure i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      hi: {
        translation: hiTranslation
      },
      te: {
        translation: teTranslation
      },
      ta: {
        translation: taTranslation
      },
      mr: {
        translation: mrTranslation
      },
      gu: {
        translation: guTranslation
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already safes from XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    react: {
      useSuspense: true,
    }
  });

// Export language configurations
export const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' }
];

// Helper to get language name
export const getLanguageName = (code: string): string => {
  const language = availableLanguages.find(lang => lang.code === code);
  return language ? language.name : 'English';
};

export default i18n;
