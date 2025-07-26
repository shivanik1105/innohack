// src/hooks/useLanguage.ts
import { useState, useEffect } from 'react';
import { Language, translations, TranslationKey } from '../utils/translations';

const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') return 'hi'; // SSR fallback
  
  const saved = localStorage.getItem('preferred_language');
  const validLanguages: Language[] = ['en', 'hi', 'mr'];
  return saved && validLanguages.includes(saved as Language) 
    ? saved as Language 
    : 'hi';
};

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(getStoredLanguage);

  useEffect(() => {
    localStorage.setItem('preferred_language', language);
  }, [language]);

  const t = (path: TranslationKey): string => {
    const keys = path.split('.');
    let result: any = translations[language];
    
    for (const key of keys) {
      result = result?.[key];
      if (result === undefined) break;
    }

    if (typeof result === 'string') return result;

    // Fallback to English
    result = translations.en;
    for (const key of keys) {
      result = result?.[key];
      if (result === undefined) break;
    }

    if (typeof result === 'string') {
      if (import.meta.env.DEV) {
        console.warn(`Missing ${language} translation for "${path}"`);
      }
      return result;
    }

    if (import.meta.env.DEV) {
      console.error(`Missing all translations for "${path}"`);
    }
    return path;
  };

  const changeLanguage = (newLanguage: Language) => {
    if (!(newLanguage in translations)) {
      throw new Error(`Unsupported language: ${newLanguage}`);
    }
    setLanguage(newLanguage);
  };

  return { language, t, changeLanguage };
}