import React, { useEffect, useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import i18n from '../i18n';

type Language = 'mr' | 'hi' | 'en';

const LanguageSelector: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const navigate = useNavigate();
  const location = useLocation();

  const languages = [
    { code: 'mr' as Language, name: 'मराठी', flag: '🇮🇳' },
    { code: 'hi' as Language, name: 'हिंदी', flag: '🇮🇳' },
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
  ];

  useEffect(() => {
    const storedLang = (localStorage.getItem('appLanguage') as Language) || (i18n.language as Language) || 'en';
    setSelectedLanguage(storedLang);
    i18n.changeLanguage(storedLang);
  }, []);

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language);
    localStorage.setItem('appLanguage', language);
    setIsOpen(false);

    // ✅ Return to the previous page after a short delay (for smooth transition)
    setTimeout(() => {
      navigate(-1); // Go back to the previous screen
    }, 300);
  };

  const selectedLang = languages.find((lang) => lang.code === selectedLanguage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('choose_language')}</h1>
        <p className="text-gray-600 mb-6">{t('select_language_to_continue')}</p>

        {/* Language Selector Button */}
        <div className="relative inline-block text-left w-full">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full px-4 py-3 text-base text-blue-600 bg-white border border-blue-200 rounded-xl shadow-sm hover:bg-blue-50 transition duration-150"
            id="language-menu"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            {selectedLang ? (
              <>
                <span className="mr-2 text-xl">{selectedLang.flag}</span>
                <span className="font-medium">{selectedLang.name}</span>
              </>
            ) : (
              <span className="text-blue-500">{t('choose_language')}</span>
            )}
            <ChevronDown
              className={`w-5 h-5 ml-2 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div
              className="absolute left-0 right-0 z-20 mt-2 bg-white rounded-xl shadow-lg border border-blue-200 ring-1 ring-blue-100 focus:outline-none animate-fadeIn"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="language-menu"
            >
              <div className="py-1" role="none">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`flex items-center w-full px-4 py-2 text-base transition-colors duration-150 ${
                      selectedLanguage === language.code
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-blue-500 hover:bg-blue-50'
                    }`}
                    role="menuitem"
                  >
                    <span className="mr-2 text-xl">{language.flag}</span>
                    {language.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
