import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useGemini() {
  const testConnectionMutation = useMutation({
    mutationFn: async (params: {
      message?: string;
      language?: string;
      mode?: string;
      scenario?: string;
    }) => {
      const response = await apiRequest('POST', '/api/gemini/test', params);
      return response.json();
    },
  });

  const validateApiKeyMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      const response = await apiRequest('POST', '/api/gemini/validate', { apiKey });
      return response.json();
    },
  });

  const testGeminiConnection = async (params?: {
    message?: string;
    language?: string;
    mode?: string;
    scenario?: string;
  }) => {
    try {
      const result = await testConnectionMutation.mutateAsync({
        message: "Hello, can you help me practice English?",
        language: "English",
        mode: "freeChat",
        ...params,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const validateApiKey = async (apiKey: string) => {
    try {
      const result = await validateApiKeyMutation.mutateAsync(apiKey);
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    testGeminiConnection,
    validateApiKey,
    isTestingConnection: testConnectionMutation.isPending,
    isValidatingKey: validateApiKeyMutation.isPending,
  };
}
