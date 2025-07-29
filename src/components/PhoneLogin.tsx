import React, { useState, useRef } from 'react';
import { Phone, ArrowRight, Check } from 'lucide-react';
import VoiceButton from './VoiceButton';
import LanguageSelector from './LanguageSelector'; // Assuming this component exists
import { useTranslation } from 'react-i18next';
import { Language } from '../utils/translations';
import { Worker } from '../types/worker';
import { localizeNumber } from '../utils/numberLocalization';

// --- API Service Import for Fast2SMS ---
import { sendOtp, verifyOtp } from '../services/apiService'; 

interface PhoneLoginProps {
  onLogin: (response: { is_new_user: boolean; user: Worker }) => void;
  language: Language;
}

export default function PhoneLogin({ onLogin }: PhoneLoginProps) {
  const { t, i18n } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  // The step state now correctly includes the initial language selection
  const [step, setStep] = useState<'language' | 'phone' | 'otp'>('language');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  const handlePhoneSubmit = async () => {
    if (phoneNumber.length !== 10) {
      setError(t('errorInvalidPhone'));
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      // Call your backend, which then calls Fast2SMS
      await sendOtp(phoneNumber);
      setStep('otp');
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setError(err.message || "Failed to send OTP.");
    }
    setIsLoading(false);
  };

  const handleOtpSubmit = async () => {
    if (otp.length !== 6) {
      setError(t('errorInvalidOTP'));
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      // Call your backend to verify the OTP
      const response = await verifyOtp(otp, phoneNumber);
      onLogin(response); // Pass the entire response (with user data) to the parent
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setError(err.message || "Invalid OTP.");
    }
    setIsLoading(false);
  };

  // Handler for voice input
  const handleVoiceInput = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (step === 'phone') setPhoneNumber(numbers.slice(0, 10));
    else setOtp(numbers.slice(0, 6));
  };

  const renderContent = () => {
    if (step === 'language') {
      return (
        <LanguageSelector
          onLanguageSelect={(lang) => {
            i18n.changeLanguage(lang);
            setStep('phone');
          }}
        />
      );
    }

    return (
      <>
        {step === 'phone' ? (
          <div className="space-y-6">
            <div>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-xl text-gray-500">+91</span>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder={localizeNumber(t('phonePlaceholder'), i18n.language)} className="w-full p-4 pl-12 text-xl text-center border-2 border-gray-200 rounded-2xl" maxLength={10} />
              </div>
            </div>
            <VoiceButton onVoiceInput={handleVoiceInput} placeholder={`${t('enterPhone')} - ${t('speakNumber')}`} className="justify-center" />
            <button onClick={handlePhoneSubmit} disabled={phoneNumber.length !== 10 || isLoading} className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-2xl font-semibold text-lg disabled:opacity-50 flex items-center justify-center">
              {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <>{t('sendOTP')} <ArrowRight className="w-5 h-5 ml-2" /></>}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="relative">
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder={localizeNumber(t('otpPlaceholder'), i18n.language)} className="w-full p-4 text-xl text-center border-2 border-gray-200 rounded-2xl tracking-widest" maxLength={6} />
              </div>
            </div>
            <VoiceButton onVoiceInput={handleVoiceInput} placeholder={`${t('enterOTP')} - ${t('speakOTP')}`} className="justify-center" />
            <button onClick={handleOtpSubmit} disabled={otp.length !== 6 || isLoading} className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-2xl font-semibold text-lg disabled:opacity-50 flex items-center justify-center">
              {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <>{t('login')} <Check className="w-5 h-5 ml-2" /></>}
            </button>
            <button onClick={() => { setStep('phone'); setError(''); }} className="w-full text-blue-600 p-2 rounded-lg hover:bg-blue-50">
              {t('changeNumber')}
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
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
          <div className="mt-2">
            <select
              value={i18n.language}
              onChange={(e) => {
                const newLang = e.target.value;
                i18n.changeLanguage(newLang);
                localStorage.setItem('appLanguage', newLang);
              }}
              className="text-sm text-blue-600 bg-transparent border border-blue-300 rounded px-2 py-1"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
            </select>
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-center text-red-600 bg-red-100 p-2 rounded-lg">{error}</p>}

        {step === 'phone' ? (
          <div className="space-y-6">
            <div>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-xl text-gray-500">+91</span>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder={localizeNumber(t('phonePlaceholder'), i18n.language)} className="w-full p-4 pl-12 text-xl text-center border-2 border-gray-200 rounded-2xl" maxLength={10} />
              </div>
            </div>
            <VoiceButton onVoiceInput={handleVoiceInput} placeholder={`${t('enterPhone')} - ${t('speakNumber')}`} className="justify-center" />
            <button onClick={handlePhoneSubmit} disabled={phoneNumber.length !== 10 || isLoading} className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-2xl font-semibold text-lg disabled:opacity-50 flex items-center justify-center">
              {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <>{t('sendOTP')} <ArrowRight className="w-5 h-5 ml-2" /></>}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="relative">
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder={localizeNumber(t('otpPlaceholder'), i18n.language)} className="w-full p-4 text-xl text-center border-2 border-gray-200 rounded-2xl tracking-widest" maxLength={6} />
              </div>
            </div>
            <VoiceButton onVoiceInput={handleVoiceInput} placeholder={`${t('enterOTP')} - ${t('speakOTP')}`} className="justify-center" />
            <button onClick={handleOtpSubmit} disabled={otp.length !== 6 || isLoading} className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-2xl font-semibold text-lg disabled:opacity-50 flex items-center justify-center">
              {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <>{t('login')} <Check className="w-5 h-5 ml-2" /></>}
            </button>
            <button onClick={() => { setStep('phone'); setError(''); }} className="w-full text-blue-600 p-2 rounded-lg hover:bg-blue-50">
              {t('changeNumber')}
            </button>
          </div>
        )}
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
