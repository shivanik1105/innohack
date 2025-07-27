import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PhoneLogin from './components/PhoneLogin';
import WorkerRegistration from './components/WorkerRegistration';
import EnhancedWorkerDashboard from './components/WorkerDashboard';
import { Worker } from './types/worker';
import LandingPage from './components/LandingPage';
import LanguageSelector from './components/LanguageSelector';
import { Language } from './utils/translations';

// --- API Service Import ---
import { registerOrLoginUser, updateUserProfile } from './service/apiservice';

function App() {
  const navigate = useNavigate();
  const { i18n } = useTranslation(); // Use the i18n instance directly

  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This effect now only handles the initial loading state.
  // The LanguageDetector plugin handles loading the language automatically.
  useEffect(() => {
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

  // --- SIMPLIFIED Language Change Handler ---
  // This function now only tells i18next to change the language.
  // The LanguageDetector will automatically save the new language to localStorage.
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
              currentLanguage={i18n.language as Language} // Get language directly from i18n
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
              language={i18n.language as Language} // Pass language directly from i18n
            />
          } 
        />
        
        <Route
          path="/register"
          element={
            <WorkerRegistration 
              onComplete={handleRegistrationComplete} 
              language={i18n.language as Language} // Pass language directly from i18n
            />
          }
        />
        
        <Route
          path="/dashboard"
          element={
            worker ? (
              <EnhancedWorkerDashboard 
                worker={worker} 
                onUpdateWorker={handleUpdateWorker}
                language={i18n.language as Language} // Pass language directly from i18n
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
