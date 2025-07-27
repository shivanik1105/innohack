import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { translations } from "./utils/translations";

i18n.use(initReactI18next).init({
  resources: translations,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});
console.log(
  "Loaded resources (helper):",
  (i18n.options.resources?.en?.translation as any)?.jobTypes?.helper
);export default i18n;
