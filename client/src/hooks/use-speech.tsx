import { useState, useCallback, useRef } from "react";

interface SpeechSettings {
  voice?: string;
  rate?: number;
  pitch?: number;
}

interface SpeechRecognitionOptions {
  language?: string;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [settings, setSettings] = useState<SpeechSettings>({
    rate: 1.0,
    pitch: 1.0,
  });
  
  const recognitionRef = useRef<any>(null);
  const isSupported = 'speechSynthesis' in window && 'webkitSpeechRecognition' in window;

  const speak = useCallback(async (text: string, language: string = 'English') => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language code based on language name
    const languageMap: Record<string, string> = {
      'English': 'en-US',
      'Hindi': 'hi-IN',
      'Tamil': 'ta-IN',
      'Gujarati': 'gu-IN',
    };
    
    utterance.lang = languageMap[language] || 'en-US';
    utterance.rate = settings.rate || 1.0;
    utterance.pitch = settings.pitch || 1.0;

    // Find and set the preferred voice
    if (settings.voice) {
      const voices = speechSynthesis.getVoices();
      const voice = voices.find(v => v.name === settings.voice);
      if (voice) {
        utterance.voice = voice;
      }
    }

    return new Promise<void>((resolve) => {
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      speechSynthesis.speak(utterance);
    });
  }, [settings]);

  const startListening = useCallback((options: SpeechRecognitionOptions = {}) => {
    if (!('webkitSpeechRecognition' in window)) {
      options.onError?.('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = options.language || 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      options.onResult?.(transcript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      options.onError?.(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          resolve(transcript);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (!recognitionRef.current?.onresult) {
            resolve(null);
          }
        };
        
        recognitionRef.current.stop();
      } else {
        setIsListening(false);
        resolve(null);
      }
    });
  }, [isListening]);

  const updateSettings = useCallback((newSettings: SpeechSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return {
    speak,
    startListening,
    stopListening,
    updateSettings,
    isListening,
    isSupported,
    settings,
  };
}
