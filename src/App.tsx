import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import PhoneLogin from './components/PhoneLogin';
import WorkerRegistration from './components/WorkerRegistration';
// --- FIX: Corrected the component import name ---
import WorkerDashboard from './components/WorkerDashboard'; 
import { Worker } from './types/worker';
import LandingPage from './components/LandingPage';
import LanguageSelector from './components/LanguageSelector';
import i18n from './i18n';
import { Language } from './utils/translations';

// --- API Service Import ---
// This is the bridge between your frontend and backend
import { registerOrLoginUser, updateUserProfile } from './service/apiservice';

function App() {
  const navigate = useNavigate();
  // The worker state now holds the complete user profile from the backend
  const [worker, setWorker] = useState<Worker | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true); // To handle initial auth check

  // This effect checks if a user is already logged in when the app loads
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && ['en', 'hi', 'mr'].includes(savedLang)) {
      i18n.changeLanguage(savedLang);
      setLanguage(savedLang);
    }
    // In a real app with persistent sessions, you would verify a stored token here.
    // For now, we'll just assume no user is logged in on startup.
    setIsLoading(false);
  }, [i18n]);

  /**
   * Handles the login process after the user verifies their OTP.
   * This function sends the Firebase token to the backend.
   */
  const handleLogin = async (phoneNumber: string, token: string) => {
    try {
      // Call the backend to verify the token and get user data
      const response = await registerOrLoginUser(token);
      
      if (response.isNewUser) {
        // If it's a new user, navigate to the registration page
        // Pass the new user data (with uid and phone number) to the registration component
        navigate('/register', { state: { worker: response.user } });
      } else {
        // If it's an existing user, set their data and go to the dashboard
        setWorker(response.user);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login failed:", error);
      // You can show an error message to the user here
    }
  };

  /**
   * Handles the final step of registration.
   * This function sends the completed user profile to the backend.
   */
  const handleRegistrationComplete = async (workerData: Worker) => {
    try {
      // The user's uid is already in the workerData from the previous step
      // We send the complete profile to the backend's PATCH endpoint to update it
      const updatedWorker = await updateUserProfile(workerData.uid, workerData);
      setWorker(updatedWorker);
      navigate('/dashboard');
    } catch (error) {
      console.error("Registration failed:", error);
      // You can show an error message to the user here
    }
  };

  /**
   * Handles any updates to the worker's profile from the dashboard.
   */
  const handleUpdateWorker = (updatedWorker: Worker) => {
    setWorker(updatedWorker);
    // The update is saved to the backend via the component itself (e.g., toggleAvailability)
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
    navigate('/login');
  };

  if (isLoading) {
    // Show a loading spinner while checking for an existing session
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
              language={language} 
            />
          } 
        />
        
        <Route
          path="/register"
          element={
            <WorkerRegistration 
              onComplete={handleRegistrationComplete} 
              language={language}
            />
          }
        />
        
        <Route
          path="/dashboard"
          element={
            worker ? (
              // --- FIX: Corrected the component name ---
              <WorkerDashboard 
                worker={worker} 
                onUpdateWorker={handleUpdateWorker}
                language={language} 
              />
            ) : (
              // If the user tries to access the dashboard without being logged in, redirect them to the login page
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
