import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
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

  const handleLogin = (phone: string) => {
    setPhoneNumber(phone);
    const existingWorker = localStorage.getItem(`worker_${phone}`);
    if (existingWorker) {
      const parsed = JSON.parse(existingWorker);
      setWorker(parsed);
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleRegistrationComplete = (workerData: Worker) => {
    setWorker(workerData);
    localStorage.setItem(`worker_${workerData.phoneNumber}`, JSON.stringify(workerData));
    navigate('/dashboard');
  };

  const handleUpdateWorker = (updatedWorker: Worker) => {
    setWorker(updatedWorker);
    localStorage.setItem(`worker_${updatedWorker.phoneNumber}`, JSON.stringify(updatedWorker));
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
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Language selection route */}
        <Route 
          path="/select-language" 
          element={
            <LanguageSelector 
              currentLanguage={language} 
              onLanguageChange={handleLanguageChange}
            />
          } 
        />

        {/* Login route */}
        <Route 
          path="/login" 
          element={
            <PhoneLogin 
              onLogin={handleLogin} 
              onLanguageChange={() => navigate('/select-language')}
            />
          } 
        />

        {/* Registration route */}
        <Route
          path="/register"
          element={
            <WorkerRegistration
              phoneNumber={phoneNumber}
              onComplete={handleRegistrationComplete}
              language={language}
            />
          }
        />

        {/* Dashboard route */}
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
              <div className="text-center mt-20">
                <p className="text-red-500">Please log in first.</p>
                <button 
                  onClick={() => navigate('/login')}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Go to Login
                </button>
              </div>
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
