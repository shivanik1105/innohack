import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translations } from './utils/translations'; // Your translations file

// This is the configuration that tells i18next how to work.
i18n
  // 1. Use the language detector plugin
  .use(LanguageDetector)
  // 2. Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // 3. Initialize i18next
  .init({
    // Your translation resources
    resources: translations,
    
    // The default language to use if no other language is detected
    fallbackLng: 'en',

    // Configuration for the language detector
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator'],
      
      // The key to look for in localStorage
      lookupLocalStorage: 'language',

      // Cache user language on
      caches: ['localStorage'],
    },

    // React-specific configuration
    react: {
      useSuspense: false, // Set to false to avoid issues with Suspense
    },

    // Debugging options
    debug: true, // Set to false in production
  });

export default i18n;
