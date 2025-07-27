import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

// --- FIX for all SpeechRecognition errors ---
// This comprehensive block informs TypeScript about the entire Web Speech API,
// including the main class, its events, and all related properties.
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
  
  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
  }

  var SpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };

  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start(): void;
    stop(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
  }
}

// --- Component Props ---
interface VoiceButtonProps {
  onVoiceInput: (text: string) => void;
  placeholder: string;
  className?: string;
}

export default function VoiceButton({
  onVoiceInput,
  placeholder,
  className = '',
}: VoiceButtonProps) {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  // Using useRef is more stable for the recognition instance than useState
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const langMap: Record<string, string> = {
    hi: 'hi-IN',
    en: 'en-US',
    mr: 'mr-IN',
  };

  // Initialize the speech recognition engine
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.warn('SpeechRecognition API is not supported in this browser.');
      return;
    }

    const recognitionInstance = new SpeechRecognitionAPI();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = langMap[language] || 'en-US';

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onVoiceInput(transcript);
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognitionInstance;
  }, [language, onVoiceInput]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      // No need to set isListening to false here, the 'onend' event will handle it.
      recognitionRef.current.stop();
    }
  };

  // Function to have the browser speak the placeholder text
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any previous speech to avoid overlap
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langMap[language] || 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
        console.warn('SpeechSynthesis API is not supported in this browser.');
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Button to read the placeholder text aloud */}
      <button
        type="button" // Prevent form submission
        onClick={() => speakText(placeholder)}
        className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
        title="Listen to the instruction"
      >
        <Volume2 className="w-5 h-5" />
      </button>

      {/* Button to start/stop voice recognition */}
      <button
        type="button" // Prevent form submission
        onClick={isListening ? stopListening : startListening}
        className={`p-4 rounded-full transition-all duration-300 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}
        title={isListening ? 'Stop recording' : 'Start recording'}
      >
        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>

      {isListening && (
        <div className="text-sm text-gray-600 animate-pulse">
          🎧 Listening...
        </div>
      )}
    </div>
  );
}
