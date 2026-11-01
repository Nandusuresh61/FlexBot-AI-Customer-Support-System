import type { ChatbotConfig } from "../entities/chatbot-config.entity.js";

export interface CreateChatbotConfigInput {
  organizationId: string;
  chatbotName: string;
  description?: string | null;
  welcomeMessage: string;
  systemPrompt: string;
  provider: ChatbotConfig["provider"];
  model: string;
  temperature: number;
  maxOutputTokens: number;
  supportedLanguage: string;
  fallbackMessage: string;
  status?: ChatbotConfig["status"];
}

export interface UpdateChatbotConfigInput {
  chatbotName?: string;
  description?: string | null;
  welcomeMessage?: string;
  systemPrompt?: string;
  provider?: ChatbotConfig["provider"];
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  supportedLanguage?: string;
  fallbackMessage?: string;
  status?: ChatbotConfig["status"];
}

export interface ChatbotConfigRepository {
  create(input: CreateChatbotConfigInput): Promise<ChatbotConfig>;

  findByOrganizationId(
    organizationId: string,
  ): Promise<ChatbotConfig | null>;

  updateByOrganizationId(
    organizationId: string,
    input: UpdateChatbotConfigInput,
  ): Promise<ChatbotConfig | null>;
}