import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Worker } from '../types/worker';
import { Language } from '../utils/translations';

// --- Component Props ---
interface WorkerRegistrationProps {
  onComplete: (workerData: Worker) => void;
  language: Language;
}

export default function WorkerRegistration({ onComplete, language }: WorkerRegistrationProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const initialWorker = location.state?.worker as Worker | null;

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    pinCode: '',
    userType: 'daily' as 'daily' | 'skilled',
    jobTypes: [] as string[],
    skills: [] as string[],
    photo: null as string | null,
  });

  useEffect(() => {
    if (!initialWorker) {
      console.error("No worker data found, redirecting to login.");
      navigate('/login');
    }
  }, [initialWorker, navigate]);

  // --- CORRECTED handleSubmit function ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialWorker) return;

    // This new version explicitly builds the final object,
    // which prevents any accidental key duplication.
    const completeWorkerData: Worker = {
      // Core data from the previous step (login)
      uid: initialWorker.uid,
      phoneNumber: initialWorker.phoneNumber,
      
      // Data from the registration form
      name: formData.name,
      age: parseInt(formData.age) || undefined, // Handle empty string
      pincode: formData.pinCode,
      userType: formData.userType,
      profilePhotoUrl: formData.photo || '',
      
      // Conditionally set job types or skills based on userType
      dailyJobTypes: formData.userType === 'daily' ? formData.jobTypes : [],
      skills: formData.userType === 'skilled' ? formData.skills : [],
      
      // Default values for a new user
      isVerified: false,
      averageRating: 0,
      jobsCompleted: 0,
      createdAt: new Date().toISOString(),
      language: language,
      isAvailableToday: true,
      
      // Add other fields from your Worker type with default values
      experience: 0, 
      location: formData.pinCode,
    };

    onComplete(completeWorkerData);
  };

  if (!initialWorker) {
    return <div>Loading...</div>;
  }

  // --- JSX for your registration form goes here ---
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{t('workerRegistration.title')}</h1>
      <form onSubmit={handleSubmit}>
        {/* Add your form fields here, for example: */}
        <div className="mt-4">
          <label htmlFor="name">{t('workerRegistration.personalInfo.name')}</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        {/* ... other form fields for age, pincode, userType, etc. ... */}
        <button type="submit" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded">
          {t('workerRegistration.registration.button')}
        </button>
      </form>
    </div>
  );
}
