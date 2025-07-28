// components/VoiceButton.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

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
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const langMap: Record<string, string> = {
    hi: 'hi-IN',
    en: 'en-US',
    mr: 'mr-IN',
  };

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn('SpeechRecognition API not supported');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = langMap[language] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onVoiceInput(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, [language, onVoiceInput]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langMap[language] || 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button onClick={() => speakText(placeholder)} className="p-3 bg-blue-100 text-blue-600 rounded-full">
        <Volume2 />
      </button>
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-4 rounded-full ${isListening ? 'bg-red-500' : 'bg-green-500'} text-white`}
      >
        {isListening ? <MicOff /> : <Mic />}
      </button>
      {isListening && <span className="text-sm text-gray-600 animate-pulse">🎧 Listening...</span>}
    </div>
  );
}
