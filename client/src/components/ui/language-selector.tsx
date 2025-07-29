import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export default function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  const languages = [
    { code: 'English', label: '🇺🇸 English', flag: '🇺🇸' },
    { code: 'Hindi', label: '🇮🇳 Hindi', flag: '🇮🇳' },
    { code: 'Tamil', label: '🇮🇳 Tamil', flag: '🇮🇳' },
    { code: 'Gujarati', label: '🇮🇳 Gujarati', flag: '🇮🇳' },
  ];

  return (
    <Select value={selectedLanguage} onValueChange={onLanguageChange}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center space-x-2">
              <span className="flag-emoji">{language.flag}</span>
              <span>{language.code}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
