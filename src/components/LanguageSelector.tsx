import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';

type Language = 'mr' | 'hi' | 'en';

const LanguageSelector = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');

  const languages = [
    { code: 'mr' as Language, name: 'मराठी', flag: '🇮🇳' },
    { code: 'hi' as Language, name: 'हिंदी', flag: '🇮🇳' },
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
  ];

  useEffect(() => {
    const storedLang = (localStorage.getItem('language') as Language) || (i18n.language as Language) || 'en';
    setSelectedLanguage(storedLang);
    i18n.changeLanguage(storedLang);
  }, []);

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    i18n.changeLanguage(language);
    localStorage.setItem('language', language); // fixed this line
  };

  const selectedLang = languages.find((lang) => lang.code === selectedLanguage);

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center w-full px-4 py-2 text-sm text-blue-500 hover:bg-blue-50 transition-colors duration-150"
          id="language-menu"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {selectedLang ? (
            <>
              <span className="mr-2 text-lg">{selectedLang.flag}</span>
              <span className="text-blue-600 font-medium">{selectedLang.name}</span>
            </>
          ) : (
            <span className="text-blue-500">{t('choose_language')}</span>
          )}
          <ChevronDown
            className={`w-4 h-4 ml-2 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-blue-200 focus:outline-none border border-blue-100"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu"
        >
          <div className="py-1" role="none">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`flex items-center w-full px-4 py-2 text-sm hover:bg-blue-50 transition-colors duration-150 ${
                  selectedLanguage === language.code
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-blue-500'
                }`}
                role="menuitem"
              >
                <span className="mr-2 text-lg">{language.flag}</span>
                {language.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
