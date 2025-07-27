import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, ArrowRight, Check } from 'lucide-react';
import VoiceButton from './VoiceButton';
import { useTranslation } from 'react-i18next';

interface PhoneLoginProps {
  onLogin: (phoneNumber: string) => void;
  onLanguageChange: () => void;
  language: 'en' | 'hi' | 'mr';
}

export default function PhoneLogin({ onLogin, onLanguageChange }: PhoneLoginProps) {
  
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  
    const [language, setLanguage] = useState<string>('en');
     useEffect(() => {
      const storedLang = localStorage.getItem('appLanguage');
      if (storedLang === 'hi' || storedLang === 'mr' || storedLang === 'en') {
        i18n.changeLanguage(storedLang); // ✅ Works now
        setLanguage(storedLang);
      }
    }, []); // ✅ Remove i18n from dependency array
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = async () => {
    if (phoneNumber.length === 10) {
      setIsLoading(true);
      console.log("OTP correct, calling onLogin with", phoneNumber);
      setTimeout(() => {
        setIsLoading(false);
        setStep('otp');
      }, 1500);
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.length === 6) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLogin(phoneNumber);
      }, 1500);
    }
  };

  const handleVoiceInput = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (step === 'phone') {
      setPhoneNumber(numbers.slice(0, 10));
    } else {
      setOtp(numbers.slice(0, 6));
    }
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
            {step === 'phone' ? t('phoneLogin') : t('enterOTP')}
          </p>

          <button
            onClick={() => navigate('/select-language', { state: { from: location.pathname, step } })}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            🌐 {t('changeLanguage')}
          </button>

        {step === 'phone' ? (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3 text-center">
                {t('enterPhone')}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  placeholder={t('phonePlaceholder')}
                  className="w-full p-4 text-xl text-center border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
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
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3 text-center">
                {t('enterOTP')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder={t('otpPlaceholder')}
                  className="w-full p-4 text-xl text-center border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none tracking-widest"
                  maxLength={6}
                />
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">
                {t('sentTo')} {phoneNumber}
              </p>
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
              onClick={() => setStep('phone')}
              className="w-full text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {t('changeNumber')}
            </button>
          </div>
        )}
      </div>
    </div>
      </div>
  );

}