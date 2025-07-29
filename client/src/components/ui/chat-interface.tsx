import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mic, Send, Volume2, Bot, User, Theater } from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

interface ChatInterfaceProps {
  conversationId: string;
  language: string;
  mode: 'freeChat' | 'roleplay';
  scenario?: string | null;
  onModeChange: (mode: 'freeChat' | 'roleplay') => void;
}

export default function ChatInterface({ 
  conversationId, 
  language, 
  mode, 
  scenario,
  onModeChange 
}: ChatInterfaceProps) {
  const [textInput, setTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { speak, startListening, stopListening, isListening, isSupported } = useSpeech();

  // Fetch messages for this conversation
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', `/api/conversations/${conversationId}/messages`, {
        content,
        language,
        isVoiceMessage: isRecording,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId, 'stats'] });
      
      // Speak the AI response
      if (data.aiMessage) {
        speak(data.aiMessage.content, language);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!textInput.trim()) return;
    
    const content = textInput.trim();
    setTextInput("");
    await sendMessageMutation.mutateAsync(content);
  };

  const handleVoiceInput = async () => {
    if (!isSupported) {
      toast({
        title: "Speech not supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      const result = await stopListening();
      setIsRecording(false);
      if (result) {
        setTextInput(result);
      }
    } else {
      setIsRecording(true);
      startListening({
        language: language === 'English' ? 'en-US' : 
                  language === 'Hindi' ? 'hi-IN' :
                  language === 'Tamil' ? 'ta-IN' :
                  language === 'Gujarati' ? 'gu-IN' : 'en-US',
        onResult: (transcript) => {
          setTextInput(transcript);
        },
        onError: (error) => {
          setIsRecording(false);
          toast({
            title: "Speech recognition error",
            description: error,
            variant: "destructive",
          });
        }
      });
    }
  };

  const playMessage = async (content: string) => {
    await speak(content, language);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return new Date(date).toLocaleTimeString();
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-primary" />
            <span>AI Voice Tutor</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Powered by</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Google Gemini
            </Badge>
          </div>
        </div>
        
        {/* Chat Mode Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1 mt-4">
          <Button
            variant={mode === 'freeChat' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => onModeChange('freeChat')}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Free Chat
          </Button>
          <Button
            variant={mode === 'roleplay' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => onModeChange('roleplay')}
          >
            <Theater className="w-4 h-4 mr-2" />
            Roleplay
          </Button>
        </div>
        
        {scenario && (
          <Badge variant="outline" className="w-fit mt-2">
            {scenario.charAt(0).toUpperCase() + scenario.slice(1)} Scenario
          </Badge>
        )}
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="p-0">
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Start your conversation!</p>
              <p className="text-sm text-gray-500">
                I can help you practice {language} with real AI responses.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="bg-primary text-white p-2 rounded-full">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`rounded-lg p-3 max-w-xs inline-block ${
                      message.role === 'user'
                        ? 'message-user ml-auto'
                        : 'message-assistant'
                    }`}
                  >
                    <p className={message.role === 'user' ? 'text-white' : 'text-gray-800'}>
                      {message.content}
                    </p>
                  </div>
                  <div className={`flex items-center mt-2 space-x-2 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}>
                    {message.role === 'assistant' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-primary hover:underline h-auto p-0"
                        onClick={() => playMessage(message.content)}
                      >
                        <Volume2 className="w-3 h-3 mr-1" />
                        Play
                      </Button>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(message.createdAt!)}
                    </span>
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="bg-secondary text-white p-2 rounded-full">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Voice Input Controls */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleVoiceInput}
              className={`p-4 rounded-full transition-colors ${
                isListening ? 'voice-recording' : 'voice-idle'
              }`}
              disabled={!isSupported}
            >
              <Mic className="w-5 h-5" />
            </Button>
            
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Type your message or use voice input..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <Button 
              onClick={handleSendMessage}
              disabled={!textInput.trim() || sendMessageMutation.isPending}
              className="bg-secondary hover:bg-secondary/90 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
          
          {isListening && (
            <div className="mt-3 text-center">
              <div className="text-sm text-gray-500">
                <div className="w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse-red mr-2"></div>
                Recording... Speak now ({language} supported)
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
