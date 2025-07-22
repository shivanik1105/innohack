import React, { useState } from 'react';
import { User, MapPin, Camera, Briefcase, CheckCircle } from 'lucide-react';
import IconButton from './IconButton';
import VoiceButton from './VoiceButton';
import { useLanguage } from '../hooks/useLanguage';

interface WorkerRegistrationProps {
  phoneNumber: string;
  onComplete: (workerData: any) => void;
}

const dailyJobTypes = [
  { id: 'helper', hindi: 'सहायक', english: 'Helper', icon: '🤝' },
  { id: 'loader', hindi: 'लोडर', english: 'Loader', icon: '📦' },
  { id: 'cleaner', hindi: 'सफाई कर्मी', english: 'Cleaner', icon: '🧹' },
  { id: 'laborer', hindi: 'मजदूर', english: 'Laborer', icon: '👷' }
];

const skilledJobTypes = [
  { id: 'plumber', hindi: 'नलसाज', english: 'Plumber', icon: '🔧' },
  { id: 'electrician', hindi: 'बिजली मिस्त्री', english: 'Electrician', icon: '⚡' },
  { id: 'painter', hindi: 'रंगसाज', english: 'Painter', icon: '🎨' },
  { id: 'carpenter', hindi: 'बढ़ई', english: 'Carpenter', icon: '🔨' },
  { id: 'mason', hindi: 'राजमिस्त्री', english: 'Mason', icon: '🧱' },
  { id: 'welder', hindi: 'वेल्डर', english: 'Welder', icon: '🔥' }
];

export default function WorkerRegistration({ phoneNumber, onComplete }: WorkerRegistrationProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    pinCode: '',
    workerType: '' as 'daily' | 'skilled' | '',
    jobTypes: [] as string[],
    photo: null as File | null,
    isAvailableToday: true
  });

  const handleVoiceInput = (field: string) => (text: string) => {
    if (field === 'age') {
      const numbers = text.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [field]: numbers }));
    } else if (field === 'pinCode') {
      const numbers = text.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [field]: numbers }));
    } else {
      setFormData(prev => ({ ...prev, [field]: text }));
    }
  };

  const handleJobTypeToggle = (jobId: string) => {
    setFormData(prev => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(jobId)
        ? prev.jobTypes.filter(id => id !== jobId)
        : [...prev.jobTypes, jobId]
    }));
  };

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.name.length > 0;
      case 2: return formData.age.length > 0 && formData.pinCode.length === 6;
      case 3: return formData.workerType.length > 0;
      case 4: return formData.jobTypes.length > 0;
      default: return true;
    }
  };

  const handleComplete = () => {
    onComplete({
      phoneNumber,
      ...formData,
      age: parseInt(formData.age),
      id: Date.now().toString(),
      rating: 0,
      totalJobs: 0,
      verificationStatus: 'pending',
      createdAt: new Date()
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">{t('progress')}</span>
            <span className="text-sm font-medium text-gray-600">{step}/5</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('whatsYourName')}
              </h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('enterName')}
                  className="w-full p-4 text-xl text-center border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
                />
                
                <VoiceButton
                  onVoiceInput={handleVoiceInput('name')}
                  placeholder={t('speakName')}
                  className="justify-center"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('ageAndPin')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    {t('age')}
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="25"
                    className="w-full p-4 text-xl text-center border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
                    min="18"
                    max="65"
                  />
                  <VoiceButton
                    onVoiceInput={handleVoiceInput('age')}
                    placeholder={t('speakAge')}
                    className="justify-center mt-2"
                  />
                </div>
                
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    {t('pinCode')}
                  </label>
                  <input
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    placeholder="110001"
                    className="w-full p-4 text-xl text-center border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
                    maxLength={6}
                  />
                  <VoiceButton
                    onVoiceInput={handleVoiceInput('pinCode')}
                    placeholder={t('speakPin')}
                    className="justify-center mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('workType')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, workerType: 'daily' }))}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    formData.workerType === 'daily'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-4xl mb-3">👷‍♂️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('dailyWorker')}
                  </h3>
                  <p className="text-gray-600">
                    {t('dailyWage')}
                  </p>
                </button>
                
                <button
                  onClick={() => setFormData(prev => ({ ...prev, workerType: 'skilled' }))}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    formData.workerType === 'skilled'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-4xl mb-3">🔧</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('skilledWorker')}
                  </h3>
                  <p className="text-gray-600">
                    {t('specialSkills')}
                  </p>
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {formData.workerType === 'daily' 
                  ? t('selectWork')
                  : t('selectSkills')
                }
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(formData.workerType === 'daily' ? dailyJobTypes : skilledJobTypes).map((job) => (
                  <button
                    key={job.id}
                    onClick={() => handleJobTypeToggle(job.id)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      formData.jobTypes.includes(job.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{job.icon}</div>
                    <div className="font-bold text-gray-900">{t(job.id as any)}</div>
                  </button>
                ))}
              </div>
              
              <p className="text-sm text-gray-600">
                {t('selectOneOrMore')}
              </p>
            </div>
          )}

          {step === 5 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('takePhoto')}
              </h2>
              
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handlePhotoCapture}
                  className="hidden"
                  id="photo-input"
                />
                
                <label
                  htmlFor="photo-input"
                  className="inline-block bg-blue-600 text-white px-8 py-4 rounded-2xl font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  📸 {t('takePhoto')}
                </label>
                
                {formData.photo && (
                  <div className="text-green-600 font-semibold">
                    ✅ Photo captured
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-2xl">
                <h3 className="font-bold text-gray-900 mb-2">
                  {t('availableToday')}
                </h3>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, isAvailableToday: true }))}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      formData.isAvailableToday
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    ✅ {t('yes')}
                  </button>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, isAvailableToday: false }))}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      !formData.isAvailableToday
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    ❌ {t('no')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                ← {t('back')}
              </button>
            )}
            
            <div className="flex-1"></div>
            
            {step < 5 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
              >
                {t('next')} →
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {t('complete')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}