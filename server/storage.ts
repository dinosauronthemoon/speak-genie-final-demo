import { type User, type InsertUser, type Conversation, type InsertConversation, type Message, type InsertMessage, type SessionStats, type InsertSessionStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserGeminiKey(userId: string, apiKey: string): Promise<User>;

  // Conversation methods
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation>;

  // Message methods
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Session stats methods
  getSessionStats(conversationId: string): Promise<SessionStats | undefined>;
  createSessionStats(stats: InsertSessionStats): Promise<SessionStats>;
  updateSessionStats(conversationId: string, updates: Partial<SessionStats>): Promise<SessionStats>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private sessionStats: Map<string, SessionStats>;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.sessionStats = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      preferredLanguage: insertUser.preferredLanguage || "English",
      geminiApiKey: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserGeminiKey(userId: string, apiKey: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { ...user, geminiApiKey: apiKey };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conversation) => conversation.userId === userId
    );
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      userId: null,
      scenario: insertConversation.scenario || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    const updatedConversation = { 
      ...conversation, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      conversationId: insertMessage.conversationId || null,
      isVoiceMessage: insertMessage.isVoiceMessage || false,
      voiceSettings: insertMessage.voiceSettings || null,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getSessionStats(conversationId: string): Promise<SessionStats | undefined> {
    return Array.from(this.sessionStats.values()).find(
      (stats) => stats.conversationId === conversationId
    );
  }

  async createSessionStats(insertStats: InsertSessionStats): Promise<SessionStats> {
    const id = randomUUID();
    const stats: SessionStats = {
      ...insertStats,
      id,
      conversationId: insertStats.conversationId || null,
      messageCount: insertStats.messageCount || 0,
      voiceMessageCount: insertStats.voiceMessageCount || 0,
      duration: insertStats.duration || 0,
      createdAt: new Date(),
    };
    this.sessionStats.set(id, stats);
    return stats;
  }

  async updateSessionStats(conversationId: string, updates: Partial<SessionStats>): Promise<SessionStats> {
    const existingStats = Array.from(this.sessionStats.values()).find(
      (stats) => stats.conversationId === conversationId
    );
    
    if (!existingStats) {
      throw new Error("Session stats not found");
    }
    
    const updatedStats = { ...existingStats, ...updates };
    this.sessionStats.set(existingStats.id, updatedStats);
    return updatedStats;
  }
}

export const storage = new MemStorage();
