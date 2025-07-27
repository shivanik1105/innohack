import React from 'react';
import { MapPin, Globe, Volume2 } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface LocationSelectorProps {
  onLocationChoice: (choice: 'nearby' | 'all') => void;
  className?: string;
}

export default function LocationSelector({ onLocationChoice, className = '' }: LocationSelectorProps) {
  const { t } = useLanguage();

  const handleAudioPlayback = (text: string) => {
    // For real usage, use Web Speech API
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
        {t('chooseLocation')}
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {/* Nearby Jobs Button */}
        <button
          onClick={() => onLocationChoice('nearby')}
          
          aria-label={`${t('nearbyJobs')}. ${t("nearbyJobsDescription")}`}
          className="p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-300 flex items-center space-x-4 hover:shadow-lg"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-lg font-bold text-gray-900">{t('nearbyJobs')}</h4>
 
            <p className="text-gray-600 text-sm">{t('nearbyJobsDescription')}</p>
            <p className="text-gray-600 text-sm">Jobs within 10km of your location</p>
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleAudioPlayback(`${t('nearbyJobs')}. ${t('nearbyJobsDescription')}`);
            }}
            aria-label={t('playAudioForNearbyJobs')}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <Volume2 className="w-6 h-6 text-gray-500" />
  
            <p className="text-gray-600 text-sm">Jobs within 10km of your location</p>
          </div>
          <div className="text-3xl">📍</div>
        </button>

        {/* All Jobs Button */}
        <button
          onClick={() => onLocationChoice('all')}
 
          aria-label={`${t('allJobs')}. ${t('allJobsDescription')}`}
          className="p-6 rounded-2xl border-2 border-gray-200 hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-all duration-300 flex items-center space-x-4 hover:shadow-lg"
  
          
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Globe className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-lg font-bold text-gray-900">{t('allJobs')}</h4>
 
            <p className="text-gray-600 text-sm">{t('allJobsDescription')}</p>
            <p className="text-gray-600 text-sm">All available jobs in your city</p>
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleAudioPlayback(`${t('allJobs')}. ${t('allJobsDescription')}`);
            }}
            aria-label={t('playAudioForNearbyJobs')}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <Volume2 className="w-6 h-6 text-gray-500" />
  
            <p className="text-gray-600 text-sm">All available jobs in your city</p>
          
          </div>
          <div className="text-3xl">🌍</div>
        </button>
      </div>
    </div>
  );
}
