import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../utils/translations';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  className?: string;
}

const languages = [
  { code: 'hi' as Language, name: 'हिंदी', flag: '🇮🇳' },
  { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
  { code: 'mr' as Language, name: 'मराठी', flag: '🇮🇳' }
];

export default function LanguageSelector({ currentLanguage, onLanguageChange, className = '' }: LanguageSelectorProps) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-lg ${className}`}>
      <div className="flex items-center justify-center mb-4">
        <Globe className="w-6 h-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">भाषा चुनें / Choose Language / भाषा निवडा</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center space-x-3 ${
              currentLanguage === lang.code
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300 text-gray-700'
            }`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span className="text-xl font-semibold">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}