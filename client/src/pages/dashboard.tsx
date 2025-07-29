import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ChatInterface from "@/components/ui/chat-interface";
import VoiceControls from "@/components/ui/voice-controls";
import RoleplayScenarios from "@/components/ui/roleplay-scenarios";
import LanguageSelector from "@/components/ui/language-selector";
import GeminiConfigModal from "@/components/ui/gemini-config-modal";
import SessionStats from "@/components/ui/session-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MessageCircle, Key, Play, Users } from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import { useGemini } from "@/hooks/use-gemini";

type ChatMode = 'freeChat' | 'roleplay';
type Scenario = 'school' | 'store' | 'home' | 'restaurant';

export default function Dashboard() {
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [chatMode, setChatMode] = useState<ChatMode>('freeChat');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const { testGeminiConnection } = useGemini();
  const { speak, isSupported: speechSupported } = useSpeech();

  const handleQuickDemo = async () => {
    if (speechSupported) {
      await speak("Hello! I'm your AI tutor powered by Google Gemini. I can help you practice English in multiple languages. What would you like to learn today?", selectedLanguage);
    }
  };

  const handleStartFreeChat = async () => {
    try {
      // Create new conversation
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Free Chat Session',
          language: selectedLanguage,
          mode: 'freeChat'
        })
      });
      
      if (response.ok) {
        const conversation = await response.json();
        setConversationId(conversation.id);
        setChatMode('freeChat');
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  const handleScenarioSelect = async (scenario: Scenario) => {
    try {
      // Create new roleplay conversation
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${scenario.charAt(0).toUpperCase() + scenario.slice(1)} Roleplay`,
          language: selectedLanguage,
          mode: 'roleplay',
          scenario
        })
      });
      
      if (response.ok) {
        const conversation = await response.json();
        setConversationId(conversation.id);
        setSelectedScenario(scenario);
        setChatMode('roleplay');
      }
    } catch (error) {
      console.error("Failed to start roleplay:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white p-2 rounded-lg">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SpeakGenie</h1>
                <p className="text-sm text-gray-500">AI Voice Tutor Platform</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-primary font-medium">Dashboard</a>
              <a href="#" className="text-gray-600 hover:text-primary">Roleplay</a>
              <a href="#" className="text-gray-600 hover:text-primary">Analytics</a>
              <a href="#" className="text-gray-600 hover:text-primary">Settings</a>
            </nav>

            <div className="flex items-center space-x-4">
              <LanguageSelector 
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
              />
              
              <Button 
                onClick={() => setShowGeminiModal(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Key className="w-4 h-4 mr-2" />
                Gemini API
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Quick Demo Section */}
        <div className="mb-8">
          <Card className="gradient-primary text-white border-0">
            <CardContent className="p-8">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold mb-4">🎤 Practice Speaking with AI Tutor</h2>
                <p className="text-lg mb-6 opacity-90">
                  Learn English through interactive voice conversations powered by Google Gemini AI. 
                  Perfect for children aged 6-16!
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={handleQuickDemo}
                    className="bg-white text-primary hover:bg-gray-100"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Launch Quick Demo
                  </Button>
                  <Button 
                    onClick={handleStartFreeChat}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-primary"
                    size="lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start Free Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            {conversationId ? (
              <ChatInterface 
                conversationId={conversationId}
                language={selectedLanguage}
                mode={chatMode}
                scenario={selectedScenario}
                onModeChange={setChatMode}
              />
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Start a Conversation</h3>
                  <p className="text-gray-600 mb-4">Choose "Start Free Chat" or select a roleplay scenario to begin.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Controls */}
          <div className="space-y-6">
            <RoleplayScenarios 
              onScenarioSelect={handleScenarioSelect}
              selectedScenario={selectedScenario}
            />
            
            <VoiceControls language={selectedLanguage} />
            
            {conversationId && (
              <SessionStats conversationId={conversationId} />
            )}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary text-white p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real AI Conversations</h3>
            <p className="text-gray-600">
              Powered by Google Gemini for authentic, context-aware roleplay scenarios in multiple languages.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-secondary text-white p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Language Support</h3>
            <p className="text-gray-600">
              Practice in Hindi, Tamil, Gujarati, and English with intelligent AI responses in each language.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-accent text-white p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <Mic className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice-to-Voice Chat</h3>
            <p className="text-gray-600">
              Seamless speech recognition and synthesis for natural conversation practice.
            </p>
          </div>
        </div>
      </div>

      <GeminiConfigModal 
        isOpen={showGeminiModal}
        onClose={() => setShowGeminiModal(false)}
      />
    </div>
  );
}
