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

// --- API Service Import ---
// This is the bridge between your frontend and backend
import { registerOrLoginUser, updateUserProfile } from './services/apiService';

function App() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This effect only handles the initial loading state.
  // The LanguageDetector plugin in i18n.ts handles loading the language automatically.
  useEffect(() => {
    // In a real production app, you might check for a stored auth token here
    // to automatically log in the user.
    setIsLoading(false);
  }, []);

  /**
   * Handles the login process after the user verifies their OTP.
   * This function sends the Firebase token to the backend.
   */
  const handleLogin = async (phoneNumber: string, token: string) => {
    try {
      const response = await registerOrLoginUser(token);
      
      if (response.isNewUser) {
        // For a new user, navigate to registration and pass the initial user data
        navigate('/register', { state: { worker: response.user } });
      } else {
        // For an existing user, set their data and go to the dashboard
        setWorker(response.user);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login failed:", error);
      // You could show an error notification to the user here
    }
  };

  /**
   * Handles the final step of registration.
   * This function sends the completed user profile to the backend.
   */
  const handleRegistrationComplete = async (workerData: Worker) => {
    try {
      const updatedWorker = await updateUserProfile(workerData.id, workerData);
      setWorker(updatedWorker);
      navigate('/dashboard');
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  /**
   * Handles any updates to the worker's profile from the dashboard.
   */
  const handleUpdateWorker = (updatedWorker: Worker) => {
    setWorker(updatedWorker);
    // The actual update is saved to the backend by the component that triggers it
    // (e.g., the toggleAvailability button in the dashboard).
  };

  /**
   * Handles changing the application language.
   */
  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang);
    // After selecting a language, the user should proceed to the login page.
    navigate('/login');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Routes>
        {/* Route 1: The main landing page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Route 2: The language selection screen */}
        <Route 
          path="/select-language" 
          element={
            <LanguageSelector 
              currentLanguage={i18n.language as Language}
              onLanguageChange={handleLanguageChange}
            />
          } 
        />

        {/* Route 3: The phone login screen */}
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
        
        {/* Route 4: The worker registration screen */}
        <Route
          path="/register"
          element={
            <WorkerRegistration 
              onComplete={handleRegistrationComplete} 
              language={i18n.language as Language}
            />
          }
        />
        
        {/* Route 5: The main dashboard (Protected Route) */}
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
              // If no worker is logged in, redirect to the login page
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* A catch-all route to redirect any other path to the landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
