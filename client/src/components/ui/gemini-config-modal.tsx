import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ExternalLink } from "lucide-react";

interface GeminiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GeminiConfigModal({ isOpen, onClose }: GeminiConfigModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");
  const { toast } = useToast();

  const validateApiKeyMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await apiRequest('POST', '/api/gemini/validate', { apiKey: key });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        toast({
          title: "Success",
          description: "Gemini API key is valid and has been saved.",
        });
        // Store API key in localStorage for demo purposes
        localStorage.setItem('gemini_api_key', apiKey);
        onClose();
      } else {
        toast({
          title: "Invalid API Key",
          description: "The provided API key is not valid. Please check and try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Validation Error",
        description: error instanceof Error ? error.message : "Failed to validate API key",
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/gemini/test', {
        message: "Hello, can you help me practice English?",
        language: "English",
        mode: "freeChat"
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Connection Test Successful",
        description: `Gemini responded: "${data.response.substring(0, 100)}..."`,
      });
    },
    onError: (error) => {
      toast({
        title: "Connection Test Failed",
        description: error instanceof Error ? error.message : "Failed to test connection",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key.",
        variant: "destructive",
      });
      return;
    }
    
    validateApiKeyMutation.mutate(apiKey);
  };

  const handleTestConnection = () => {
    testConnectionMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Gemini API</DialogTitle>
          <DialogDescription>
            Set up your Google Gemini API key to enable real AI conversations.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="apiKey" className="text-sm font-medium">
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Gemini API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-2">
              Get your API key from{" "}
              <a 
                href="https://ai.google.dev/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center"
              >
                Google AI Studio
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </p>
          </div>
          
          <div>
            <Label htmlFor="model" className="text-sm font-medium">
              Model
            </Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={handleSave}
              disabled={validateApiKeyMutation.isPending}
              className="flex-1"
            >
              {validateApiKeyMutation.isPending ? "Validating..." : "Save Configuration"}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
          
          <Button
            variant="secondary"
            onClick={handleTestConnection}
            disabled={testConnectionMutation.isPending || !apiKey}
            className="w-full"
          >
            {testConnectionMutation.isPending ? "Testing..." : "Test Connection"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
