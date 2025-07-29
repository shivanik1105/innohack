import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, MapPin, User, Briefcase, 
  ToggleLeft, ToggleRight, Mic, Volume2,
  CheckCircle, Clock, DollarSign
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { localizeNumber } from '../utils/numberLocalization';

interface DailyWorkerFlowProps {
  onComplete: (workerData: any) => void;
}

export default function DailyWorkerFlow({ onComplete }: DailyWorkerFlowProps) {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isListening, setIsListening] = useState(false);
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    name: '',
    age: '',
    pinCode: '',
    jobTypes: [] as string[],
    isAvailableToday: true
  });

  const jobOptions = [
    { id: 'helper', name: t('helper'), icon: '🔧' },
    { id: 'loader', name: t('loader'), icon: '📦' },
    { id: 'cleaner', name: t('cleaner'), icon: '🧹' },
    { id: 'laborer', name: t('laborer'), icon: '👷' }
  ];

  const handleVoiceInput = (field: string) => {
    setIsListening(true);
    // Simulate voice input
    setTimeout(() => {
      setIsListening(false);
      // In real implementation, this would use Web Speech API
      if (field === 'name') {
        setFormData(prev => ({ ...prev, name: 'राहुल शर्मा' }));
      }
    }, 2000);
  };

  const handleJobTypeToggle = (jobId: string) => {
    setFormData(prev => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(jobId)
        ? prev.jobTypes.filter(id => id !== jobId)
        : [...prev.jobTypes, jobId].slice(0, 2) // Max 2 job types
    }));
  };

  const handleSubmit = () => {
    const workerData = {
      ...formData,
      userType: 'daily',
      id: `daily_${formData.phoneNumber}`,
      photo: null,
      aadhaarCardImage: null,
      rating: 0,
      totalJobs: 0,
      verificationStatus: 'basic',
      createdAt: new Date().toISOString(),
      language: i18n.language
    };
    onComplete(workerData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Phone className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('phoneLogin')}
              </h2>
              <p className="text-gray-600">{t('enterPhoneToStart')}</p>
            </div>

            <div className="space-y-4">
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) 
                }))}
                placeholder={localizeNumber('9876543210', i18n.language)}
                className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              />
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep(2)}
                disabled={formData.phoneNumber.length !== 10}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t('sendOTP')}
              </motion.button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <User className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('basicInfo')}
              </h2>
              <p className="text-gray-600">{t('tellUsAboutYourself')}</p>
            </div>

            <div className="space-y-4">
              {/* Name Input with Voice */}
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('yourName')}
                  className="w-full p-4 pr-12 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleVoiceInput('name')}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                    isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isListening ? <Volume2 className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </motion.button>
              </div>

              {/* Age */}
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder={localizeNumber('25', i18n.language)}
                min="18"
                max="65"
                className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              />

              {/* Pin Code */}
              <input
                type="text"
                value={formData.pinCode}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) 
                }))}
                placeholder={localizeNumber('110001', i18n.language)}
                className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep(3)}
                disabled={!formData.name || !formData.age || !formData.pinCode}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t('next')}
              </motion.button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Briefcase className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('typeOfWork')}
              </h2>
              <p className="text-gray-600">{t('selectUpTo2JobTypes')}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {jobOptions.map((job) => (
                <motion.button
                  key={job.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleJobTypeToggle(job.id)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.jobTypes.includes(job.id)
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{job.icon}</div>
                  <div className="font-semibold">{job.name}</div>
                </motion.button>
              ))}
            </div>

            {/* Availability Toggle */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{t('availableToday')}</h3>
                  <p className="text-sm text-gray-600">{t('canYouWorkToday')}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    isAvailableToday: !prev.isAvailableToday 
                  }))}
                  className={`p-2 rounded-full ${
                    formData.isAvailableToday ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {formData.isAvailableToday ? 
                    <ToggleRight className="w-8 h-8" /> : 
                    <ToggleLeft className="w-8 h-8" />
                  }
                </motion.button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={formData.jobTypes.length === 0}
              className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5 inline mr-2" />
              {t('startWorking')}
            </motion.button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full mx-1 ${
                step <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderStep()}
        </div>

        {/* Voice Instructions */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            🎤 {t('useVoiceInstructions')}
          </p>
        </div>
      </div>
    </div>
  );
}
