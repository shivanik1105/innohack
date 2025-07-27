import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import PhoneLogin from './components/PhoneLogin';
import WorkerRegistration from './components/WorkerRegistration';
import WorkerDashboard from './components/WorkerDashboard';
import { Worker } from './types/worker';
import LandingPage from './components/LandingPage';
import LanguageSelector from './components/LanguageSelector';
import i18n from './i18n';

function App() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [worker, setWorker] = useState<Worker | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');

  // ✅ Sync language from localStorage and i18n
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'en' | 'hi' | 'mr';
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
      setLanguage(savedLang);
    }
  }, []);

  // ✅ Sync user session from localStorage
  useEffect(() => {
    const savedWorker = localStorage.getItem('currentWorker');
    if (savedWorker) {
      setWorker(JSON.parse(savedWorker));
    }
  }, []);

  const handleLogin = (phone: string) => {
    setPhoneNumber(phone);
    const existingWorker = localStorage.getItem(`worker_${phone}`);
    if (existingWorker) {
      const parsed = JSON.parse(existingWorker);
      setWorker(parsed);
      localStorage.setItem('currentWorker', JSON.stringify(parsed));
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleRegistrationComplete = (workerData: Worker) => {
    setWorker(workerData);
    localStorage.setItem(`worker_${workerData.phoneNumber}`, JSON.stringify(workerData));
    localStorage.setItem('currentWorker', JSON.stringify(workerData));
    navigate('/dashboard');
  };

  const handleUpdateWorker = (updatedWorker: Worker) => {
    setWorker(updatedWorker);
    localStorage.setItem(`worker_${updatedWorker.phoneNumber}`, JSON.stringify(updatedWorker));
    localStorage.setItem('currentWorker', JSON.stringify(updatedWorker));
  };

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route 
          path="/select-language" 
          element={
            <LanguageSelector 
              currentLanguage={language} 
              onLanguageChange={handleLanguageChange}
            />
          } 
        />

        <Route 
          path="/login" 
          element={
            <PhoneLogin 
              onLogin={handleLogin} 
              onLanguageChange={() => navigate('/select-language')}
            />
          } 
        />

        <Route
          path="/register"
          element={
            phoneNumber ? (
              <WorkerRegistration
                phoneNumber={phoneNumber}
                onComplete={handleRegistrationComplete}
                language={language}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            worker ? (
              <WorkerDashboard 
                worker={worker} 
                onUpdateWorker={handleUpdateWorker}
                language={language}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
