import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface VoiceButtonProps {
  onVoiceInput: (text: string) => void;
  placeholder: string;
  className?: string;
}

export default function VoiceButton({ onVoiceInput, placeholder, className = '' }: VoiceButtonProps) {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      // Set language based on user preference
      const langMap = {
        'hi': 'hi-IN',
        'en': 'en-US',
        'mr': 'mr-IN'
      };
      recognitionInstance.lang = langMap[language] || 'hi-IN';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onVoiceInput(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, [onVoiceInput, language]);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap = {
        'hi': 'hi-IN',
        'en': 'en-US',
        'mr': 'mr-IN'
      };
      utterance.lang = langMap[language] || 'hi-IN';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={() => speakText(placeholder)}
        className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
        title="🔊 Listen"
      >
        <Volume2 className="w-5 h-5" />
      </button>
      
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-4 rounded-full transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}
        title={isListening ? '🛑 Stop' : '🎤 Speak'}
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