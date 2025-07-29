interface VoiceSettings {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export class SpeechService {
  private static instance: SpeechService;
  private settings: VoiceSettings = {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  };

  private constructor() {}

  static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  updateSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  getVoices(): SpeechSynthesisVoice[] {
    return speechSynthesis.getVoices();
  }

  getVoicesByLanguage(language: string): SpeechSynthesisVoice[] {
    const voices = this.getVoices();
    const langCode = this.getLanguageCode(language);
    
    return voices.filter(voice => 
      voice.lang.startsWith(langCode) || 
      voice.lang.startsWith('en') // fallback to English
    );
  }

  private getLanguageCode(language: string): string {
    const languageMap: Record<string, string> = {
      'English': 'en',
      'Hindi': 'hi',
      'Tamil': 'ta',
      'Gujarati': 'gu',
    };
    
    return languageMap[language] || 'en';
  }

  async speak(text: string, language: string = 'English'): Promise<void> {
    if (!('speechSynthesis' in window)) {
      throw new Error('Speech synthesis not supported');
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language
    const langCode = this.getLanguageCode(language);
    utterance.lang = `${langCode}-${langCode === 'en' ? 'US' : 'IN'}`;
    
    // Apply settings
    utterance.rate = this.settings.rate || 1.0;
    utterance.pitch = this.settings.pitch || 1.0;
    utterance.volume = this.settings.volume || 1.0;

    // Set voice if specified
    if (this.settings.voice) {
      utterance.voice = this.settings.voice;
    } else {
      // Auto-select best voice for language
      const voices = this.getVoicesByLanguage(language);
      if (voices.length > 0) {
        // Prefer Google voices, then others
        const googleVoice = voices.find(v => v.name.includes('Google'));
        utterance.voice = googleVoice || voices[0];
      }
    }

    return new Promise((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech error: ${event.error}`));
      
      speechSynthesis.speak(utterance);
    });
  }

  cancel(): void {
    speechSynthesis.cancel();
  }

  pause(): void {
    speechSynthesis.pause();
  }

  resume(): void {
    speechSynthesis.resume();
  }

  isSpeaking(): boolean {
    return speechSynthesis.speaking;
  }
}

export const speechService = SpeechService.getInstance();
