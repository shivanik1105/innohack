import React from 'react';
import { useTranslation } from 'react-i18next';
import { localizeNumber } from '../utils/numberLocalization';
import { getLocalizedImage } from '../utils/languageImages';

export default function LanguageTest() {
  const { t, i18n } = useTranslation();

  const testNumbers = ['123', '10,000', '98765 43210', '123456'];
  const testKeys = ['name', 'Age', 'PinCode', 'rahul', 'phoneLogin', 'enterPhone'];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('appLanguage', lang);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Language & Localization Test</h1>
      
      {/* Language Switcher */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Current Language: {i18n.language}</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => changeLanguage('en')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            English
          </button>
          <button 
            onClick={() => changeLanguage('hi')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            हिंदी
          </button>
          <button 
            onClick={() => changeLanguage('mr')}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            मराठी
          </button>
        </div>
      </div>

      {/* Number Localization Test */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Number Localization Test</h2>
        <div className="grid grid-cols-2 gap-4">
          {testNumbers.map((num) => (
            <div key={num} className="p-2 bg-white rounded border">
              <div className="text-sm text-gray-600">Original: {num}</div>
              <div className="text-lg font-semibold">
                Localized: {localizeNumber(num, i18n.language)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Translation Test */}
      <div className="mb-8 p-4 bg-green-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Translation Test</h2>
        <div className="grid grid-cols-2 gap-4">
          {testKeys.map((key) => (
            <div key={key} className="p-2 bg-white rounded border">
              <div className="text-sm text-gray-600">Key: {key}</div>
              <div className="text-lg font-semibold">
                Translation: {t(key)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Localization Test */}
      <div className="mb-8 p-4 bg-purple-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Language-Specific Images</h2>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Registration Hero Image</div>
            <img 
              src={getLocalizedImage('registration', 'hero', i18n.language)}
              alt="Hero"
              className="w-32 h-32 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Form Test */}
      <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Form Input Test</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('name')}</label>
            <input 
              type="text" 
              placeholder={t('rahul')}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('Age')}</label>
            <input 
              type="number" 
              placeholder={localizeNumber('23', i18n.language)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('PinCode')}</label>
            <input 
              type="text" 
              placeholder={localizeNumber('111111', i18n.language)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Voice Test Info */}
      <div className="p-4 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Voice Support Status</h2>
        <div className="space-y-2">
          <div>
            <strong>Speech Recognition Support:</strong> {
              'SpeechRecognition' in window || 'webkitSpeechRecognition' in window 
                ? '✅ Supported' 
                : '❌ Not Supported'
            }
          </div>
          <div>
            <strong>Current Language Code:</strong> {
              i18n.language === 'hi' ? 'hi-IN' :
              i18n.language === 'mr' ? 'mr-IN' :
              'en-US'
            }
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Note: Voice recognition requires HTTPS and microphone permissions
          </div>
        </div>
      </div>
    </div>
  );
}
