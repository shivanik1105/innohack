import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PhoneLogin from './components/PhoneLogin';
import WorkerRegistration from './components/WorkerRegistration';
import WorkerDashboard from './components/WorkerDashboard';
import { Worker } from './types/worker';
import LandingPage from './components/LandingPage';

import LanguageTest from './components/LanguageTest';
import OCRTestPage from './components/OCRTestPage';

import { Language } from './utils/translations';

// API Service Import - This is the bridge to your backend
import { registerOrLoginUser, updateUserProfile } from './services/apiService';

// Wrapper component to handle registration with state
function WorkerRegistrationWrapper({ onComplete, language }: { onComplete: (worker: Worker) => void, language: Language }) {
  const location = useLocation();

  // Get the worker data from navigation state
  const workerFromState = location.state?.worker as Worker;

  // If no worker data in state, redirect to login
  if (!workerFromState || !workerFromState.phoneNumber) {
    return <Navigate to="/login" replace />;
  }

  return (
    <WorkerRegistration
      phoneNumber={workerFromState.phoneNumber}
      userId={(workerFromState as any).uid || workerFromState.id}
      onComplete={onComplete}
      language={language}
    />
  );
}

function App() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // --- FIX: State to control navigation after state update ---
  const [shouldNavigate, setShouldNavigate] = useState<{path: string, state?: any} | null>(null);

  useEffect(() => {
    // This effect handles navigation AFTER a state update has occurred.
    if (shouldNavigate) {
      navigate(shouldNavigate.path, { state: shouldNavigate.state });
      setShouldNavigate(null); // Reset the trigger
    }
  }, [shouldNavigate, navigate]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleLogin = (response: { is_new_user: boolean; user: Worker }) => {
    try {
      if (response.is_new_user) {
        // For a new user, we can navigate directly because we don't need to wait for state.
        navigate('/register', { state: { worker: response.user } });
      } else {
        // For an existing user, set the worker state and then trigger navigation.
        setWorker(response.user);
        setShouldNavigate({ path: '/dashboard' });
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleRegistrationComplete = async (workerData: Worker) => {
    try {
      const updatedWorker = await updateUserProfile(workerData.id, workerData);
      // Set the worker state and then trigger navigation.
      setWorker(updatedWorker);
      setShouldNavigate({ path: '/dashboard' });
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleUpdateWorker = (updatedWorker: Worker) => {
    setWorker(updatedWorker);
  };



  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/test" element={<LanguageTest />} />
        <Route path="/ocr-test" element={<OCRTestPage />} />
        


        <Route
          path="/login"
          element={
            <PhoneLogin
              onLogin={handleLogin}
              language={i18n.language as Language}
            />
          }
        />
        
        <Route
          path="/register"
          element={
            <WorkerRegistrationWrapper
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
