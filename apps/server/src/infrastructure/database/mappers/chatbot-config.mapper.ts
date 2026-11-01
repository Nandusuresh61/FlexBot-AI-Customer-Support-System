import type { ChatbotConfig } from "../../../domain/entities/chatbot-config.entity.js";
import { ChatbotConfig as ChatbotConfigEntity } from "../../../domain/entities/chatbot-config.entity.js";
import type { ChatbotConfigDocument } from "../models/chatbot-config.model.js";

export const toChatbotConfigEntity = (
  document: ChatbotConfigDocument & { _id: unknown },
): ChatbotConfig => {
  return new ChatbotConfigEntity({
    id: String(document._id),
    organizationId: String(document.organizationId),
    chatbotName: document.chatbotName,
    description: document.description ?? null,
    welcomeMessage: document.welcomeMessage,
    systemPrompt: document.systemPrompt,
    provider: document.provider,
    model: document.model,
    temperature: document.temperature,
    maxOutputTokens: document.maxOutputTokens,
    supportedLanguage: document.supportedLanguage,
    fallbackMessage: document.fallbackMessage,
    status: document.status,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  });
};