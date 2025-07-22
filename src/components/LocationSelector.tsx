import React from 'react';
<<<<<<< HEAD
import { MapPin, Globe, Volume2 } from 'lucide-react';
=======
import { MapPin, Globe } from 'lucide-react';
>>>>>>> 918e47b69a25f18c24c1ba831f603e85a99d422d
import { useLanguage } from '../hooks/useLanguage';

interface LocationSelectorProps {
  onLocationChoice: (choice: 'nearby' | 'all') => void;
  className?: string;
}

export default function LocationSelector({ onLocationChoice, className = '' }: LocationSelectorProps) {
  const { t } = useLanguage();

<<<<<<< HEAD
  // Placeholder for audio playback functionality
  const handleAudioPlayback = (text: string) => {
    // In a real application, this would use the Web Speech API or a pre-recorded audio file.
    // For example:
    // const utterance = new SpeechSynthesisUtterance(text);
    // window.speechSynthesis.speak(utterance);
    console.log(`Playing audio: ${text}`);
  };

=======
>>>>>>> 918e47b69a25f18c24c1ba831f603e85a99d422d
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
        {t('chooseLocation')}
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => onLocationChoice('nearby')}
<<<<<<< HEAD
          aria-label={`${t('nearbyJobs')}. ${t('nearbyJobsDescription')}`}
          className="p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-300 flex items-center space-x-4 hover:shadow-lg"
=======
          className="p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 flex items-center space-x-4 hover:shadow-lg"
>>>>>>> 918e47b69a25f18c24c1ba831f603e85a99d422d
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-lg font-bold text-gray-900">{t('nearbyJobs')}</h4>
<<<<<<< HEAD
            <p className="text-gray-600 text-sm">{t('nearbyJobsDescription')}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the main button's onClick
              handleAudioPlayback(`${t('nearbyJobs')}. ${t('nearbyJobsDescription')}`);
            }}
            aria-label={t('playAudioForNearbyJobs')}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Volume2 className="w-6 h-6 text-gray-500" />
          </button>
=======
            <p className="text-gray-600 text-sm">Jobs within 10km of your location</p>
          </div>
>>>>>>> 918e47b69a25f18c24c1ba831f603e85a99d422d
          <div className="text-3xl">📍</div>
        </button>
        
        <button
          onClick={() => onLocationChoice('all')}
<<<<<<< HEAD
          aria-label={`${t('allJobs')}. ${t('allJobsDescription')}`}
          className="p-6 rounded-2xl border-2 border-gray-200 hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-all duration-300 flex items-center space-x-4 hover:shadow-lg"
=======
          className="p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 flex items-center space-x-4 hover:shadow-lg"
>>>>>>> 918e47b69a25f18c24c1ba831f603e85a99d422d
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Globe className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-lg font-bold text-gray-900">{t('allJobs')}</h4>
<<<<<<< HEAD
            <p className="text-gray-600 text-sm">{t('allJobsDescription')}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAudioPlayback(`${t('allJobs')}. ${t('allJobsDescription')}`);
            }}
            aria-label={t('playAudioForAllJobs')}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Volume2 className="w-6 h-6 text-gray-500" />
          </button>
=======
            <p className="text-gray-600 text-sm">All available jobs in your city</p>
          </div>
>>>>>>> 918e47b69a25f18c24c1ba831f603e85a99d422d
          <div className="text-3xl">🌍</div>
        </button>
      </div>
    </div>
  );
}