import React, { useState } from 'react';
import PhoneLogin from './components/PhoneLogin';
import WorkerRegistration from './components/WorkerRegistration';
import WorkerDashboard from './components/WorkerDashboard';
import { Worker } from './types/worker';

function App() {
  const [currentStep, setCurrentStep] = useState<'login' | 'registration' | 'dashboard'>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [worker, setWorker] = useState<Worker | null>(null);

  const handleLogin = (phone: string) => {
    setPhoneNumber(phone);
    // Check if user exists (mock check)
    const existingWorker = localStorage.getItem(`worker_${phone}`);
    if (existingWorker) {
      setWorker(JSON.parse(existingWorker));
      setCurrentStep('dashboard');
    } else {
      setCurrentStep('registration');
    }
  };

  const handleRegistrationComplete = (workerData: Worker) => {
    setWorker(workerData);
    localStorage.setItem(`worker_${workerData.phoneNumber}`, JSON.stringify(workerData));
    setCurrentStep('dashboard');
  };

  const handleUpdateWorker = (updatedWorker: Worker) => {
    setWorker(updatedWorker);
    localStorage.setItem(`worker_${updatedWorker.phoneNumber}`, JSON.stringify(updatedWorker));
  };

  return (
    <div className="min-h-screen">
      {currentStep === 'login' && (
        <PhoneLogin onLogin={handleLogin} />
      )}
      
      {currentStep === 'registration' && (
        <WorkerRegistration 
          phoneNumber={phoneNumber}
          onComplete={handleRegistrationComplete}
        />
      )}
      
      {currentStep === 'dashboard' && worker && (
        <WorkerDashboard 
          worker={worker}
          onUpdateWorker={handleUpdateWorker}
        />
      )}
    </div>
  );
}

export default App;