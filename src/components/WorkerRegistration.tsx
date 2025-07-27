import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Briefcase, Camera,
  ChevronRight, Check, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Worker } from '../types/worker';
import { useTranslation } from 'react-i18next';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

interface WorkerRegistrationProps {
  phoneNumber: string;
  onComplete?: (workerData: Worker) => void;
  language?: 'en' | 'hi' | 'mr';
}

interface FormData {
  name: string;
  age: string;
  pinCode: string;
  workerType: 'daily' | 'skilled' | '';
  jobTypes: string[];
  photo: File | null;
  isAvailableToday: boolean;
}

const jobCategories = {
  daily: [
    { id: 'helper', name: 'Helper' },
    { id: 'loader', name: 'Loader' },
    { id: 'cleaner', name: 'Cleaner' },
    { id: 'laborer', name: 'Laborer' }
  ],
  
  
  skilled: [
    { id: 'plumber', name: 'Plumber' },
    { id: 'electrician', name: 'Electrician' },
    { id: 'painter', name: 'Painter' },
    { id: 'carpenter', name: 'Carpenter' },
    { id: 'mason', name: 'Mason' },
    { id: 'welder', name: 'Welder' }
  ]
};

export default function WorkerRegistration({ phoneNumber, onComplete, language: propLanguage }: WorkerRegistrationProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('appLanguage') as 'en' | 'hi' | 'mr' | null;
    if (storedLang) {
      i18n.changeLanguage(storedLang);
      setLanguage(storedLang);
    } else if (propLanguage) {
      i18n.changeLanguage(propLanguage);
      setLanguage(propLanguage);
    }
  }, [i18n, propLanguage]);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    pinCode: '',
    workerType: '',
    jobTypes: [],
    photo: null,
    isAvailableToday: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleJobTypeToggle = (jobId: string) => {
    setFormData(prev => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(jobId)
        ? prev.jobTypes.filter(id => id !== jobId)
        : [...prev.jobTypes, jobId]
    }));
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert(t('workerRegistration.errors.notImage'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(t('workerRegistration.errors.sizeExceeded'));
        return;
      }
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      alert(t('workerRegistration.validation.nameRequired'));
      return false;
    }
    const age = parseInt(formData.age);
    if (isNaN(age)) {
      alert(t('workerRegistration.validation.ageInvalid'));
      return false;
    }
    if (age < 18 || age > 75) {
      alert(t('workerRegistration.validation.ageRange'));
      return false;
    }
    if (!/^\d{6}$/.test(formData.pinCode)) {
      alert(t('workerRegistration.validation.pinInvalid'));
      return false;
    }
    if (!formData.workerType) {
      alert(t('workerRegistration.validation.workerTypeRequired'));
      return false;
    }
    if (formData.jobTypes.length === 0) {
      alert(t('workerRegistration.validation.jobTypeRequired'));
      return false;
    }
    if (!formData.photo) {
      alert(t('workerRegistration.validation.photoRequired'));
      return false;
    }
    return true;
  };

  const handleComplete = async () => {
    if (!validateForm()) return;
    if (!formData.photo) return;

    setIsSubmitting(true);

    try {
      const base64Photo = await fileToBase64(formData.photo);

      const workerData: Worker = {
        name: formData.name,
        phone: phoneNumber,
        experience: parseInt(formData.age),
        jobTypes: formData.jobTypes,
        location: formData.pinCode,
        photoUrl: base64Photo,
      };

      if (onComplete) {
        onComplete(workerData);
      }

      setShowSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Registration failed:', error);
      alert(t('workerRegistration.errors.registrationFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const buttonHover = {
    scale: 1.03,
    transition: { duration: 0.2 }
  };

  const buttonTap = {
    scale: 0.98
  };

  const isFormIncomplete = 
    !formData.name || 
    !formData.age || 
    !formData.pinCode ||
    !formData.workerType ||
    formData.jobTypes.length === 0 ||
    !formData.photo;

  return (
    <div className="bg-gradient-to-tr from-[#fdfbfb] to-[#ebedee] min-h-[100dvh] flex items-center justify-center px-6">
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white p-8 rounded-xl max-w-sm w-full text-center"
            >
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('workerRegistration.registration.complete')}</h3>
              <p className="text-gray-600 mb-6">{t('workerRegistration.registration.redirecting')}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  className="bg-green-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl w-full">
        {/* Left Panel - Navigation */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("workerRegistration.title")}</h1>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t("workerRegistration.stepsTitle")}</h2>
          
          <div className="mb-8">
            <h3 className="text-md font-medium text-gray-700 mb-3">{t("fillAllSections")}</h3>
            <p className="text-sm text-gray-500 mb-4">{t("completeFields")}</p>
            
            <ul className="space-y-2">
              {Object.values(t('workerRegistration.sections', { returnObjects: true })).map((section: string) => (
                <motion.li 
                  key={section}
                  whileHover={{ x: 5 }}
                  className="flex items-center p-2 rounded-md hover:bg-blue-50 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                  {section}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Middle Panel - Form Input */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('workerRegistration.personalInfo.title')}</h2>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-4">
                {t('workerRegistration.personalInfo.description')}
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('workerRegistration.personalInfo.name')}</label>
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder={t('workerRegistration.personalInfo.namePlaceholder')}
                      required
                    />
                  </motion.div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('workerRegistration.personalInfo.age')}</label>
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={handleInputChange('age')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder={t('workerRegistration.personalInfo.agePlaceholder')}
                      min="18"
                      max="75"
                      required
                    />
                  </motion.div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('workerRegistration.personalInfo.pinCode')}</label>
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <input
                      type="text"
                      value={formData.pinCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder={t('workerRegistration.personalInfo.pinPlaceholder')}
                      maxLength={6}
                      required
                    />
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-4">
                <motion.button
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    workerType: 'daily', 
                    jobTypes: [] 
                  }))}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    formData.workerType === 'daily' 
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {t('workerRegistration.workType.daily')}
                </motion.button>
                <motion.button
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    workerType: 'skilled', 
                    jobTypes: [] 
                  }))}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    formData.workerType === 'skilled' 
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {t('workerRegistration.workType.skilled')}
                </motion.button>
              </div>

              {formData.workerType && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {formData.workerType === 'daily' 
                      ? t('workerRegistration.workType.selectDaily') 
                      : t('workerRegistration.workType.selectSkilled')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(jobCategories[formData.workerType] || []).map((job) => (
                      
                      <motion.button
  key={job.id}
  whileHover={buttonHover}
  whileTap={buttonTap}
  onClick={() => handleJobTypeToggle(job.id)}
  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
    formData.jobTypes.includes(job.id)
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
  }`}
>
  {t(`workerRegistration.jobTypes.${job.id}`)}
</motion.button>

                    ))}
                  </div>
                </div>
              )}
            </div>
                        
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">{t('workerRegistration.photo.title')}</h3>
              
              <input
                type="file"
                accept="image/*"
                capture="user"
                onChange={handlePhotoCapture}
                className="hidden"
                id="photo-input"
              />
              <motion.label
                whileHover={buttonHover}
                whileTap={buttonTap}
                htmlFor="photo-input"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <Camera className="w-5 h-5 mr-2" />
                {t('workerRegistration.photo.upload')}
              </motion.label>
              {formData.photo && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-3 text-sm text-green-600 flex items-center"
                >
                  <Check className="w-4 h-4 mr-1" /> {t('workerRegistration.photo.uploaded')}
                </motion.span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Preview */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('workerRegistration.preview.title')}</h2>
          
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">{t('workerRegistration.preview.personal')}</h3>
              {formData.name && (
                <p className="text-gray-700 font-medium">{formData.name}</p>
              )}
              {formData.age && (
                <p className="text-gray-700">{t('workerRegistration.personalInfo.age')}: {formData.age}</p>
              )}
              {formData.pinCode && (
                <p className="text-gray-700">{t('workerRegistration.personalInfo.pinCode')}: {formData.pinCode}</p>
              )}
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">{t('workerRegistration.preview.work')}</h3>
              {formData.workerType && (
                <p className="text-gray-700 capitalize">
                  {formData.workerType === 'daily' 
                    ? t('workerRegistration.workType.daily') 
                    : t('workerRegistration.workType.skilled')}
                </p>
              )}
              {formData.jobTypes.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    {formData.workerType === 'daily' 
                      ? t('workerRegistration.preview.selectedJobs') 
                      : t('workerRegistration.preview.selectedSkills')}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.jobTypes.map(jobId => {
                      const job = [...jobCategories.daily, ...jobCategories.skilled].find(j => j.id === jobId);
                      return job ? (
                        <motion.span 
                          key={job.id}
                          whileHover={{ scale: 1.05 }}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {t(`workerRegistration.jobTypes.${job.id}`)}
                        </motion.span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">{t('workerRegistration.preview.photo')}</h3>
              {formData.photo ? (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-md"
                >
                  <img 
                    src={URL.createObjectURL(formData.photo)} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center shadow-md">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
              )}
            </div>

            <div className="mt-8">
              <motion.button
                whileHover={buttonHover}
                whileTap={buttonTap}
                onClick={handleComplete}
                disabled={isFormIncomplete || isSubmitting}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center ${
                  isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-colors`}
              >
                {isSubmitting ? t('workerRegistration.registration.processing') : (
                  <>
                    {t('workerRegistration.registration.button')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
