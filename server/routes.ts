import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateGeminiResponse, validateGeminiApiKey } from "./services/gemini";
import { insertConversationSchema, insertMessageSchema, insertSessionStatsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const conversation = insertConversationSchema.parse(req.body);
      const newConversation = await storage.createConversation(conversation);
      
      // Create initial session stats
      await storage.createSessionStats({
        conversationId: newConversation.id,
        messageCount: 0,
        voiceMessageCount: 0,
        duration: 0,
        language: conversation.language,
      });
      
      res.json(newConversation);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create conversation" });
    }
  });

  // Get conversation by ID
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message and get AI response
  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = req.params.id;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        conversationId,
        role: "user"
      });

      // Get conversation details
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Save user message
      const userMessage = await storage.createMessage(messageData);

      // Get conversation history for context
      const conversationHistory = await storage.getMessagesByConversation(conversationId);
      const historyContext = conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate AI response using Gemini
      const aiResponse = await generateGeminiResponse(
        messageData.content,
        conversation.language,
        conversation.mode as 'freeChat' | 'roleplay',
        conversation.scenario || undefined,
        historyContext
      );

      // Save AI response
      const aiMessage = await storage.createMessage({
        conversationId,
        role: "assistant",
        content: aiResponse,
        language: conversation.language,
        isVoiceMessage: false,
      });

      // Update session stats
      const currentStats = await storage.getSessionStats(conversationId);
      if (currentStats) {
        await storage.updateSessionStats(conversationId, {
          messageCount: (currentStats.messageCount || 0) + 2, // user + AI
          voiceMessageCount: messageData.isVoiceMessage ? 
            (currentStats.voiceMessageCount || 0) + 1 : (currentStats.voiceMessageCount || 0),
        });
      }

      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Message processing error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to process message" 
      });
    }
  });

  // Get session stats
  app.get("/api/conversations/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getSessionStats(req.params.id);
      if (!stats) {
        return res.status(404).json({ message: "Session stats not found" });
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session stats" });
    }
  });

  // Update session duration
  app.patch("/api/conversations/:id/stats", async (req, res) => {
    try {
      const { duration } = req.body;
      const stats = await storage.updateSessionStats(req.params.id, { duration });
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to update session stats" });
    }
  });

  // Validate Gemini API key
  app.post("/api/gemini/validate", async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey) {
        return res.status(400).json({ message: "API key is required" });
      }

      const isValid = await validateGeminiApiKey(apiKey);
      res.json({ valid: isValid });
    } catch (error) {
      res.status(500).json({ message: "Failed to validate API key" });
    }
  });

  // Test Gemini connection
  app.post("/api/gemini/test", async (req, res) => {
    try {
      const { message, language, mode, scenario } = req.body;
      
      const response = await generateGeminiResponse(
        message || "Hello, can you help me practice English?",
        language || "English",
        mode || "freeChat",
        scenario
      );

      res.json({ response });
    } catch (error) {
      console.error("Gemini test error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to connect to Gemini API" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
