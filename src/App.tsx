import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PhoneLogin from './components/PhoneLogin';
import WorkerRegistration from './components/WorkerRegistration';
import WorkerDashboard from './components/WorkerDashboard';
import { Worker } from './types/worker';
import LandingPage from './components/LandingPage';
import LanguageSelector from './components/LanguageSelector';
import { Language } from './utils/translations';

// API Service Import - The bridge to your backend
import { registerOrLoginUser, updateUserProfile } from './services/apiService';

function App() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The LanguageDetector plugin in i18n.ts handles loading the language.
    // This effect is for checking a persistent user session in the future.
    setIsLoading(false);
  }, []);

  const handleLogin = async (phoneNumber: string, token: string) => {
    try {
      const response = await registerOrLoginUser(token);
      if (response.isNewUser) {
        navigate('/register', { state: { worker: response.user } });
      } else {
        setWorker(response.user);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleRegistrationComplete = async (workerData: Worker) => {
    try {
      const updatedWorker = await updateUserProfile(workerData.uid, workerData);
      setWorker(updatedWorker);
      navigate('/dashboard');
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleUpdateWorker = (updatedWorker: Worker) => {
    setWorker(updatedWorker);
  };

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang);
    navigate('/login');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route 
          path="/select-language" 
          element={
            <LanguageSelector 
              currentLanguage={i18n.language as Language}
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
              language={i18n.language as Language}
            />
          } 
        />
        
        <Route
          path="/register"
          element={
            <WorkerRegistration 
              onComplete={handleRegistrationComplete} 
              language={i18n.language as Language}
            />
          }
        />
        
        <Route
          path="/dashboard"
          element={
            worker ? (
              <WorkerDashboard 
                worker={worker} 
                onUpdateWorker={handleUpdateWorker}
                language={i18n.language as Language}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
