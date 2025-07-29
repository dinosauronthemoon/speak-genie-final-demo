import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Volume2 } from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";

interface VoiceControlsProps {
  language: string;
}

export default function VoiceControls({ language }: VoiceControlsProps) {
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [speechSpeed, setSpeechSpeed] = useState([1.0]);
  const [voicePitch, setVoicePitch] = useState([1.0]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const { updateSettings } = useSpeech();

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      const filteredVoices = voices.filter(voice => {
        const lang = language.toLowerCase();
        return (
          (lang === 'english' && voice.lang.startsWith('en')) ||
          (lang === 'hindi' && voice.lang.startsWith('hi')) ||
          (lang === 'tamil' && voice.lang.startsWith('ta')) ||
          (lang === 'gujarati' && voice.lang.startsWith('gu')) ||
          voice.lang.startsWith('en') // fallback to English
        );
      });
      
      setAvailableVoices(filteredVoices);
      
      if (filteredVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(filteredVoices[0].name);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [language, selectedVoice]);

  useEffect(() => {
    updateSettings({
      voice: selectedVoice,
      rate: speechSpeed[0],
      pitch: voicePitch[0],
    });
  }, [selectedVoice, speechSpeed, voicePitch, updateSettings]);

  const getVoiceDisplayName = (voice: SpeechSynthesisVoice) => {
    if (voice.name.includes('Google')) {
      return `Google ${voice.lang.includes('en') ? 'English' : language}`;
    }
    if (voice.name.includes('Microsoft')) {
      return `Microsoft ${voice.name.split(' ')[1] || 'Voice'}`;
    }
    if (voice.name.includes('Apple')) {
      return `Apple ${voice.name}`;
    }
    return voice.name;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Volume2 className="w-5 h-5 text-primary" />
          <span>Voice Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Voice
          </Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {availableVoices.map((voice) => (
                <SelectItem key={voice.name} value={voice.name}>
                  {getVoiceDisplayName(voice)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Speed Control */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Speech Speed
          </Label>
          <Slider
            value={speechSpeed}
            onValueChange={setSpeechSpeed}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Slow</span>
            <span>Normal</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Pitch Control */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Voice Pitch
          </Label>
          <Slider
            value={voicePitch}
            onValueChange={setVoicePitch}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>Normal</span>
            <span>High</span>
          </div>
        </div>

        {/* Current Settings Display */}
        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600 space-y-1">
            <div>Speed: {speechSpeed[0].toFixed(1)}x</div>
            <div>Pitch: {voicePitch[0].toFixed(1)}x</div>
            <div>Language: {language}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
