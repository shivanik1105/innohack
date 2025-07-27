import React, { useState, useEffect, useRef } from 'react';
import { Phone, ArrowRight, Check } from 'lucide-react';
import VoiceButton from './VoiceButton';
import LanguageSelector from './LanguageSelector'; // Assuming this component exists
import { useTranslation } from 'react-i18next';
import { auth } from '../config/firebase'; 
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

// --- FIX for 'grecaptcha' error ---
declare const grecaptcha: any;

// --- CORRECTED Component Props ---
// This interface now includes all the props being passed from App.tsx
interface PhoneLoginProps {
  onLogin: (phoneNumber: string, token: string) => void;
  onLanguageChange: (language: 'en' | 'hi' | 'mr') => void; // Added this prop
  language: 'en' | 'hi' | 'mr'; // Added this prop
}

export default function PhoneLogin({ onLogin, onLanguageChange, language }: PhoneLoginProps) {
  const { t, i18n } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  // The step state now correctly includes the initial language selection
  const [step, setStep] = useState<'language' | 'phone' | 'otp'>('language');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // This effect sets up the invisible reCAPTCHA verifier required by Firebase
  useEffect(() => {
    if (recaptchaContainerRef.current) {
      try {
        const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          'size': 'invisible',
          'callback': () => {
            console.log("reCAPTCHA resolved.");
          }
        });
        (window as any).recaptchaVerifier = verifier;
      } catch (e) {
        console.error("Error setting up reCAPTCHA", e);
        setError("Could not initialize login. Please refresh.");
      }
    }
  }, []);

  // Handler for when a language is selected from the LanguageSelector component
  const handleLanguageSelect = (selectedLanguage: 'en' | 'hi' | 'mr') => {
    i18n.changeLanguage(selectedLanguage);
    onLanguageChange(selectedLanguage); // Notify the parent component
    setStep('phone');
  };

  // Handler to send the OTP via Firebase
  const handlePhoneSubmit = async () => {
    const fullPhoneNumber = `+91${phoneNumber}`;
    if (phoneNumber.length !== 10) {
      setError(t('errorInvalidPhone'));
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: any) {
      console.error("Firebase OTP Send Error:", err);
      setError(t('errorSendOTP'));
      // It's good practice to reset reCAPTCHA on error
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.render().then((widgetId: any) => {
          if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset(widgetId);
          }
        });
      }
    }
    setIsLoading(false);
  };

  // Handler to verify the OTP and complete the login
  const handleOtpSubmit = async () => {
    if (otp.length !== 6) {
      setError(t('errorInvalidOTP'));
      return;
    }
    if (!confirmationResult) {
      setError("Please request an OTP first.");
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const userCredential = await confirmationResult.confirm(otp);
      // After verification, get the secure ID token to send to the backend
      const token = await userCredential.user.getIdToken();
      console.log("User logged in:", userCredential.user);
      // Pass both the phone number and the token to the parent component
      onLogin(userCredential.user.phoneNumber || phoneNumber, token);
    } catch (err: any) {
      console.error("Firebase OTP Verify Error:", err);
      setError(t('errorInvalidOTP'));
    }
    setIsLoading(false);
  };

  // Handler for voice input
  const handleVoiceInput = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (step === 'phone') {
      setPhoneNumber(numbers.slice(0, 10));
    } else {
      setOtp(numbers.slice(0, 6));
    }
  };

  // --- RENDER LOGIC ---

  const renderContent = () => {
    switch (step) {
      case 'language':
        return (
          <LanguageSelector
            currentLanguage={language}
            onLanguageChange={handleLanguageSelect}
          />
        );
      case 'phone':
        return (
          <div className="space-y-6">
            <div>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-xl text-gray-500">+91</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder={t('phonePlaceholder')}
                  className="w-full p-4 pl-12 text-xl text-center border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
                  maxLength={10}
                />
              </div>
            </div>
            <VoiceButton
              onVoiceInput={handleVoiceInput}
              placeholder={`${t('enterPhone')} - ${t('speakNumber')}`}
              className="justify-center"
            />
            <button
              onClick={handlePhoneSubmit}
              disabled={phoneNumber.length !== 10 || isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  {t('sendOTP')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        );
      case 'otp':
        return (
          <div className="space-y-6">
            <div>
              <div className="relative">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder={t('otpPlaceholder')}
                  className="w-full p-4 text-xl text-center border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none tracking-widest"
                  maxLength={6}
                />
              </div>
            </div>
            <VoiceButton
              onVoiceInput={handleVoiceInput}
              placeholder={`${t('enterOTP')} - ${t('speakOTP')}`}
              className="justify-center"
            />
            <button
              onClick={handleOtpSubmit}
              disabled={otp.length !== 6 || isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  {t('login')}
                  <Check className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
            <button
              onClick={() => { setStep('phone'); setError(''); }}
              className="w-full text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {t('changeNumber')}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div ref={recaptchaContainerRef}></div>
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {step !== 'language' && (
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 'phone' ? t('enterPhone') : t('enterOTP')}
            </h1>
            <p className="text-gray-600">
              {step === 'phone' ? t('phoneLogin') : `${t('sentTo')} +91${phoneNumber}`}
            </p>
            <button
              onClick={() => setStep('language')}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              🌐 {t('changeLanguage')}
            </button>
          </div>
        )}

        {error && <p className="mb-4 text-sm text-center text-red-600 bg-red-100 p-2 rounded-lg">{error}</p>}

        {renderContent()}
      </div>
    </div>
  );
}
