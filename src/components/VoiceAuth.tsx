import React, { useState, useRef } from 'react';
import { Phone, Mic, ShieldCheck, ShieldAlert, Loader, ArrowRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

type AuthStep = 'phone' | 'otp' | 'enroll_prompt' | 'enroll_recording' | 'login_prompt' | 'login_recording' | 'verifying' | 'error';

interface VoiceAuthProps {
  onLoginSuccess: (token: string) => void;
  className?: string;
}

export default function VoiceAuth({ onLoginSuccess, className = '' }: VoiceAuthProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // --- MOCK API & UTILITY FUNCTIONS ---

  const handlePhoneSubmit = async () => {
    // TODO: API call to check if phone number exists.
    // If it exists, move to 'login_prompt'.
    // If not, move to 'otp' for new user enrollment.
    console.log(`Checking phone number: ${phoneNumber}`);
    const userExists = Math.random() > 0.5; // Mock API response
    if (userExists) {
      setStep('login_prompt');
    } else {
      // In a real app, you would send an OTP here.
      // For this demo, we'll skip to the enrollment prompt.
      setStep('enroll_prompt');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = event => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        // Stop all media tracks to turn off the microphone indicator
        stream.getTracks().forEach(track => track.stop());
        
        if (step === 'enroll_recording') {
          await handleEnrollment(audioBlob);
        } else if (step === 'login_recording') {
          await handleVerification(audioBlob);
        }
      };

      mediaRecorder.current.start();
      setStep(step === 'enroll_prompt' ? 'enroll_recording' : 'login_recording');
    } catch (err) {
      console.error("Microphone access denied:", err);
      setError(t('micAccessDenied'));
      setStep('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setStep('verifying');
    }
  };

  const handleEnrollment = async (audioBlob: Blob) => {
    // TODO: Implement backend API call for enrollment.
    // 1. Create a FormData object.
    // 2. Append the audioBlob and phoneNumber.
    // 3. POST to your /enroll endpoint.
    // 4. The backend creates a voiceprint with a Speaker Verification service.
    console.log('Enrolling with audio blob:', audioBlob);
    await new Promise(res => setTimeout(res, 2000)); // Mock network delay
    onLoginSuccess('fake-enrollment-token');
  };

  const handleVerification = async (audioBlob: Blob) => {
    // TODO: Implement backend API call for verification.
    // 1. Create a FormData object.
    // 2. Append the audioBlob and phoneNumber.
    // 3. POST to your /verify endpoint.
    // 4. The backend compares the new audio to the stored voiceprint.
    console.log('Verifying with audio blob:', audioBlob);
    await new Promise(res => setTimeout(res, 2000)); // Mock network delay
    const isVerified = Math.random() > 0.3; // Mock API response
    if (isVerified) {
      onLoginSuccess('fake-verification-token');
    } else {
      setError(t('voiceMatchFail'));
      setStep('error');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'phone':
        return (
          <>
            <h3 className="text-2xl font-bold text-center mb-2">{t('welcome')}</h3>
            <p className="text-center text-gray-600 mb-8">{t('enterPhoneToStart')}</p>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t('enterPhoneNumber')}
                className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button onClick={handlePhoneSubmit} className="w-full mt-6 bg-blue-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              {t('continue')} <ArrowRight />
            </button>
          </>
        );
      
      case 'enroll_prompt':
      case 'login_prompt':
        const isEnrolling = step === 'enroll_prompt';
        return (
          <div className="text-center flex flex-col items-center">
            <h3 className="text-2xl font-bold mb-2">{isEnrolling ? t('createVoicePassword') : t('speakToLogin')}</h3>
            <p className="text-gray-600 mb-8">{t('pressAndHoldMic')}</p>
            <p className="text-lg font-semibold bg-gray-100 px-4 py-2 rounded-lg mb-8">"{t('voiceAuthPhrase')}"</p>
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg transform active:scale-95 transition-transform"
            >
              <Mic size={48} />
            </button>
          </div>
        );

      case 'enroll_recording':
      case 'login_recording':
        return (
          <div className="text-center flex flex-col items-center">
            <h3 className="text-2xl font-bold mb-2">{t('recording')}</h3>
            <p className="text-gray-600 mb-8">{t('releaseToStop')}</p>
            <p className="text-lg font-semibold bg-gray-100 px-4 py-2 rounded-lg mb-8">"{t('voiceAuthPhrase')}"</p>
            <button className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
              <Mic size={48} />
            </button>
          </div>
        );

      case 'verifying':
        return (
          <div className="text-center flex flex-col items-center">
            <Loader className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <h3 className="text-2xl font-bold">{t('verifyingVoice')}</h3>
          </div>
        );

      case 'error':
        return (
          <div className="text-center flex flex-col items-center">
            <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">{t('errorOccurred')}</h3>
            <p className="text-gray-600 mb-8">{error}</p>
            <button onClick={() => setStep('phone')} className="w-full mt-4 bg-gray-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-gray-700">
              {t('tryAgain')}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-8 shadow-lg w-full max-w-md ${className}`}>
      {renderStep()}
    </div>
  );
}

```

### How to Use It

You would replace your existing authentication components with this new `VoiceAuth` component. You'll also need to add the following translation keys to your language files:

*   `welcome`: "Welcome!"
*   `enterPhoneToStart`: "Please enter your phone number to begin."
*   `createVoicePassword`: "Create Your Voice Password"
*   `speakToLogin`: "Speak to Log In"
*   `pressAndHoldMic`: "Press and hold the button and say:"
*   `voiceAuthPhrase`: "My voice is my password"
*   `recording`: "Recording..."
*   `releaseToStop`: "Release the button to stop."
*   `verifyingVoice`: "Verifying your voice..."
*   `errorOccurred`: "An Error Occurred"
*   `micAccessDenied`: "Microphone access was denied. Please enable it in your browser settings."
*   `voiceMatchFail`: "Your voice did not match. Please try again."
*   `tryAgain`: "Try Again"

This component provides a complete, user-friendly flow for voice authentication. The next critical step is to build the backend and integrate a speaker verification service to handle the actual voice analysis.

<!--
[PROMPT_SUGGESTION]How do I set up a simple backend endpoint to receive the audio file?[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]Can you add a visualizer to show the microphone is picking up audio?[/PROMPT_SUGGESTION]
