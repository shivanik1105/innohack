import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Briefcase, Camera,
  ChevronRight, Check, ArrowRight, CreditCard
} from 'lucide-react';

import { Worker } from '../types/worker';
import { useTranslation } from 'react-i18next';
import i18n from "i18next";

import { getLocalizedImage } from '../utils/languageImages';

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
  userId?: string;
  onComplete?: (workerData: Worker) => void;
  language?: 'en' | 'hi' | 'mr';
}

interface FormData {
  name: string;
  age: string;
  pinCode: string;
  workerType: 'daily' | 'skilled' | '';
  gender: 'male' | 'female' | 'other' | '';
  jobTypes: string[];
  photo: File | null;
  aadhaar: File | null;
  isAvailableToday: boolean;
  extractedAadhaarNumber?: string;
  extractedName?: string;
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

export default function WorkerRegistration({ phoneNumber, userId, onComplete, language: propLanguage }: WorkerRegistrationProps) {
  const { t, i18n } = useTranslation();
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
    gender: '',
    pinCode: '',
    workerType: '',
    jobTypes: [],
    photo: null,
    aadhaar: null,
    isAvailableToday: true,
    extractedAadhaarNumber: '',
    extractedName: '',
  });

  // Debug: Monitor formData changes
  useEffect(() => {
    console.log('🔍 FormData updated:', {
      hasAadhaar: !!formData.aadhaar,
      aadhaarFileName: formData.aadhaar?.name,
      hasPhoto: !!formData.photo,
      name: formData.name
    });
  }, [formData]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customJobType, setCustomJobType] = useState('');
  const [showCustomJobInput, setShowCustomJobInput] = useState(false);



  const handleJobTypeToggle = (jobId: string) => {
    setFormData(prev => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(jobId)
        ? prev.jobTypes.filter(id => id !== jobId)
        : [...prev.jobTypes, jobId]
    }));
  };

  const handleAddCustomJobType = () => {
    if (customJobType.trim() && !formData.jobTypes.includes(customJobType.trim())) {
      setFormData(prev => ({
        ...prev,
        jobTypes: [...prev.jobTypes, customJobType.trim()]
      }));
      setCustomJobType('');
      setShowCustomJobInput(false);
    }
  };

  const handleRemoveJobType = (jobId: string) => {
    setFormData(prev => ({
      ...prev,
      jobTypes: prev.jobTypes.filter(id => id !== jobId)
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

  const handleAadhaarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('application/pdf')) {
        alert(t('workerRegistration.errors.aadhaarInvalidFormat'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(t('workerRegistration.errors.aadhaarSizeExceeded'));
        return;
      }

      // Verify name on Aadhaar matches entered name
      if (formData.name.trim()) {
        // Start verification process - don't set file yet
        setIsVerifying(true);
        console.log('🔄 Starting Aadhaar verification...'); // Debug log

        try {
          const formDataForVerification = new FormData();
          formDataForVerification.append('aadhaar_image', file);
          formDataForVerification.append('name', formData.name);

          const response = await fetch('http://127.0.0.1:8000/api/verify-aadhaar/', {
            method: 'POST',
            body: formDataForVerification
          });

          console.log('📡 Response status:', response.status); // Debug log

          if (response.ok) {
            const result = await response.json();
            console.log('📋 Aadhaar verification result:', result); // Debug log

            if (result.success) {
              if (result.verification_status === 'verified') {
                // Extract Aadhaar number and name from OCR
                const extractedData = result.extracted_data || {};
                console.log('✅ Verification successful! Setting Aadhaar file...'); // Debug log
                console.log('📋 Extracted data:', extractedData); // Debug log
                console.log('🔢 Aadhaar number:', extractedData.aadhaar_number); // Debug log

                // Only set file after successful verification
                setFormData(prev => ({
                  ...prev,
                  aadhaar: file,
                  extractedAadhaarNumber: extractedData.aadhaar_number || '',
                  extractedName: extractedData.name || ''
                }));

                setIsVerifying(false);
                alert('✅ Aadhaar verified successfully! Name matches.');
              } else {
                console.log('⚠️ Partial verification - setting file...'); // Debug log

                // Set file for partial verification too
                setFormData(prev => ({
                  ...prev,
                  aadhaar: file,
                  extractedAadhaarNumber: result.extracted_data?.aadhaar_number || '',
                  extractedName: result.extracted_data?.name || ''
                }));

                setIsVerifying(false);
                alert('⚠️ Aadhaar uploaded but name verification needs review. Please ensure the name matches your Aadhaar card.');
              }
            } else {
              console.log('❌ Verification failed:', result.error); // Debug log
              setIsVerifying(false);
              alert('❌ Aadhaar verification failed: ' + (result.error || 'Unknown error'));
              // Don't set the file if verification completely failed
            }
          } else {
            const errorResult = await response.json().catch(() => ({ error: 'Network error' }));
            console.log('🌐 Server response:', errorResult); // Debug log
            setIsVerifying(false);

            // Handle specific verification failures
            if (errorResult.verification_status === 'name_mismatch') {
              alert('❌ Name Verification Failed: ' + errorResult.message);
            } else if (errorResult.verification_status === 'failed') {
              alert('❌ Aadhaar Verification Failed: ' + (errorResult.message || 'Could not process Aadhaar card'));
            } else {
              alert('❌ Aadhaar verification failed: ' + (errorResult.error || errorResult.message || 'Server error'));
            }
            // Don't set the file if there's a verification error
          }
        } catch (error) {
          console.error('🚨 Aadhaar verification error:', error);
          setIsVerifying(false);
          alert('❌ Error during verification. Please try again.');
          // Don't set the file if there's an error
        }
      } else {
        alert('Please enter your name first before uploading Aadhaar card.');
      }
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
      const [base64Photo, base64Aadhaar] = await Promise.all([
        fileToBase64(formData.photo),
        formData.aadhaar ? fileToBase64(formData.aadhaar) : Promise.resolve(null)
      ]);

      const workerData: Worker = {
        id: userId || crypto.randomUUID(),
        phoneNumber: phoneNumber,
        name: formData.name,
        age: parseInt(formData.age),
        pinCode: formData.pinCode,
        gender: formData.gender as 'male' | 'female' | 'other' | 'prefer-not-to-say',
        email: '', // Will be filled later if needed
        dateOfBirth: '', // Will be calculated from age or filled later
        aadhaarNumber: formData.extractedAadhaarNumber || '',
        photo: base64Photo,
        aadhaarCardImage: base64Aadhaar,
        workerType: formData.workerType as 'daily' | 'skilled' | 'semi-skilled',
        isAvailableToday: formData.isAvailableToday,
        jobTypes: formData.jobTypes,
        rating: 0,
        totalJobs: 0,
        verificationStatus: 'pending',
        createdAt: new Date().toISOString(),
        language: language,
      };

      setShowSuccess(true);

      // Call onComplete callback after showing success
      setTimeout(() => {
        if (onComplete) {
          onComplete(workerData);
        }
      }, 2000);
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
    !formData.gender ||
    !formData.pinCode ||
    !formData.extractedAadhaarNumber ||
    !formData.workerType ||
    formData.jobTypes.length === 0 ||
    !formData.photo;

  // Debug logging for form completion
  console.log('🔍 Form validation check:', {
    name: !!formData.name,
    age: !!formData.age,
    gender: !!formData.gender,
    pinCode: !!formData.pinCode,
    extractedAadhaarNumber: !!formData.extractedAadhaarNumber,
    extractedAadhaarNumberValue: formData.extractedAadhaarNumber,
    workerType: !!formData.workerType,
    jobTypes: formData.jobTypes.length > 0,
    photo: !!formData.photo,
    isFormIncomplete
  });

  return (
    <div className="bg-gradient-to-tr from-[#fdfbfb] to-[#ebedee] min-h-screen flex items-center justify-center p-4">
      {/* Language-specific background pattern */}
      <div
        className="absolute inset-0 opacity-5 bg-repeat pointer-events-none"
        style={{
          backgroundImage: `url(${getLocalizedImage('registration', 'hero', i18n.language)})`,
          backgroundSize: '200px 200px'
        }}
      />
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

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Navigation (30%) */}
        {/* <motion.div 
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="w-full lg:w-[30%] bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
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
        </motion.div> */}

        {/* Middle Panel - Form Input (40%) */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.1 }}
          className="w-full lg:w-[40%] bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('Title')}</h2>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-4">
                {t('workerRegistration.personalInfo.description')}
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('workerRegistration.personalInfo.name')}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder={t('workerRegistration.personalInfo.namePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('workerRegistration.personalInfo.age')}</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder={t('workerRegistration.personalInfo.agePlaceholder')}
                    min="18"
                    max="75"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('workerRegistration.personalInfo.pinCode')}</label>
                  <div>
                    <input
                      type="text"
                      value={formData.pinCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder={t('workerRegistration.personalInfo.pinPlaceholder')}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('workerRegistration.personalInfo.gender')}
                  </label>
                  <div>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        gender: e.target.value as 'male' | 'female' | 'other' | ''
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    >
                      <option value="">{t('workerRegistration.personalInfo.selectGender')}</option>
                      <option value="male">{t('workerRegistration.personalInfo.male')}</option>
                      <option value="female">{t('workerRegistration.personalInfo.female')}</option>
                      <option value="other">{t('workerRegistration.personalInfo.preferNotToSay')}</option>
                    </select>
                  </div>
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
                  {t('Daily')}
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
                  {t('Skilled')}
                </motion.button>
              </div>

              {formData.workerType && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {formData.workerType === 'daily'
                      ? t('selectDaily')
                      : t('Select Skills')}
                  </h4>

                  {/* Selected Job Types */}
                  {formData.jobTypes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-2">{t('selectedJobTypes')}:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.jobTypes.map((jobType) => (
                          <motion.div
                            key={jobType}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            <span>{jobType}</span>
                            <button
                              onClick={() => handleRemoveJobType(jobType)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Select Options */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-2">{t('quickSelect')}:</p>
                    <div className="flex flex-wrap gap-2">
                      {(jobCategories[formData.workerType] || []).slice(0, 4).map((job) => (
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
                          {t(`${job.id}`)}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Job Type Input */}
                  <div>
                    {!showCustomJobInput ? (
                      <motion.button
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                        onClick={() => setShowCustomJobInput(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        + {t('addCustomJobType')}
                      </motion.button>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={customJobType}
                          onChange={(e) => setCustomJobType(e.target.value)}
                          placeholder={t('enterJobType')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddCustomJobType()}
                        />
                        <motion.button
                          whileHover={buttonHover}
                          whileTap={buttonTap}
                          onClick={handleAddCustomJobType}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                        >
                          {t('add')}
                        </motion.button>
                        <motion.button
                          whileHover={buttonHover}
                          whileTap={buttonTap}
                          onClick={() => {
                            setShowCustomJobInput(false);
                            setCustomJobType('');
                          }}
                          className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400"
                        >
                          {t('cancel')}
                        </motion.button>
                      </div>
                    )}
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

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">{t('workerRegistration.aadhaar.title')}</h3>

              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleAadhaarUpload}
                className="hidden"
                id="aadhaar-input"
                disabled={isVerifying}
              />
              <motion.label
                whileHover={buttonHover}
                whileTap={buttonTap}
                htmlFor="aadhaar-input"
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
                  isVerifying
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                <Camera className="w-5 h-5 mr-2" />
                {isVerifying ? 'Verifying...' : t('workerRegistration.aadhaar.upload')}
              </motion.label>

              {/* Show verification status */}
              {isVerifying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ml-3 text-sm text-blue-600 flex items-center bg-blue-50 px-3 py-1 rounded-full border border-blue-200"
                >
                  <div className="w-4 h-4 mr-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">Verifying Aadhaar...</span>
                </motion.div>
              )}

              {/* Show success status only after verification */}
              {!isVerifying && formData.aadhaar && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ml-3 text-sm text-green-600 flex items-center bg-green-50 px-3 py-1 rounded-full border border-green-200"
                >
                  <Check className="w-4 h-4 mr-1" />
                  <span className="font-medium">{t('workerRegistration.aadhaar.uploaded')}</span>
                  <span className="ml-2 text-xs text-green-500">({formData.aadhaar.name})</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Preview (30%) */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.2 }}
          className="w-full lg:w-[30%] bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('Title')}</h2>
          
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">{t('Personal')}</h3>
              {formData.name && (
                <p className="text-gray-700 font-medium">{formData.name}</p>
              )}
              {formData.age && (
                <p className="text-gray-700">{t('Age')}: {formData.age}</p>
              )}
              {formData.pinCode && (
                <p className="text-gray-700">{t('PinCode')}: {formData.pinCode}</p>
              )}
              {formData.extractedAadhaarNumber && (
                <p className="text-gray-700 flex items-center">
                  <CreditCard className="w-4 h-4 mr-1" />
                  {t('AadhaarNumber')}:
                  {formData.extractedAadhaarNumber.substring(0, 4)}-XXXX-XXXX-{formData.extractedAadhaarNumber.substring(8)}
                </p>
              )}
              {formData.gender && (
                <p className="text-gray-700">
                  {t('Gender')}: {t(`${formData.gender}`)}
                </p>
              )}
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">{t('work')}</h3>
              {formData.workerType && (
                <p className="text-gray-700 capitalize">
                  {formData.workerType === 'daily' 
                    ? t('daily') 
                    : t('skilled')}
                </p>
              )}
              {formData.jobTypes.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    {formData.workerType === 'daily' 
                      ? t('selectedJobs') 
                      : t('Selected Skills')}
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
                          {t(`${job.id}`)}
                        </motion.span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">{t('photo')}</h3>
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