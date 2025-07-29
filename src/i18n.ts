import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { translations } from "./utils/translations";

i18n.use(initReactI18next).init({
  resources: translations,
  lng: localStorage.getItem('appLanguage') || "en",
  fallbackLng: "en",
  debug: true, // Enable debug mode to see what's happening
  interpolation: {
    escapeValue: false
  },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage']
  }
});

console.log("i18n initialized with languages:", Object.keys(translations));
console.log("Current language:", i18n.language);
console.log("Marathi translations available:", !!translations.mr);
console.log("Marathi heroTitle:", translations.mr?.translation?.heroTitle);

export default i18n;
