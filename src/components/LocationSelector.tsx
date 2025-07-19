import React from 'react';
import { MapPin, Globe } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface LocationSelectorProps {
  onLocationChoice: (choice: 'nearby' | 'all') => void;
  className?: string;
}

export default function LocationSelector({ onLocationChoice, className = '' }: LocationSelectorProps) {
  const { t } = useLanguage();

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
        {t('chooseLocation')}
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => onLocationChoice('nearby')}
          className="p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 flex items-center space-x-4 hover:shadow-lg"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-lg font-bold text-gray-900">{t('nearbyJobs')}</h4>
            <p className="text-gray-600 text-sm">Jobs within 10km of your location</p>
          </div>
          <div className="text-3xl">📍</div>
        </button>
        
        <button
          onClick={() => onLocationChoice('all')}
          className="p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 flex items-center space-x-4 hover:shadow-lg"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Globe className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-lg font-bold text-gray-900">{t('allJobs')}</h4>
            <p className="text-gray-600 text-sm">All available jobs in your city</p>
          </div>
          <div className="text-3xl">🌍</div>
        </button>
      </div>
    </div>
  );
}