import type { ConversationMessage } from "../../../domain/entities/conversation-message.entity.js";
import type { ConversationRepository } from "../../../domain/repositories/conversation.repository.js";
import type { ConversationMessageRepository } from "../../../domain/repositories/conversation-message.repository.js";
import type { ChatbotConfigRepository } from "../../../domain/repositories/chatbot-config.repository.js";
import type { AIProvider } from "../../interfaces/ai-provider.types.js";
import { AppError } from "../../../domain/errors/app-error.js";
import { AppMessage } from "../../../constants/appMessage.js";
import { HttpStatusCode } from "../../../constants/httpStatusCode.js";

export interface SendWidgetMessageInput {
  organizationId: string;
  conversationId: string;
  visitorId: string;
  message: string;
}

export interface SendWidgetMessageOutput {
  userMessage: ConversationMessage;
  assistantMessage: ConversationMessage;
}

export class SendWidgetMessageUseCase {
  constructor(
    private readonly _conversationRepository: ConversationRepository,
    private readonly _conversationMessageRepository: ConversationMessageRepository,
    private readonly _chatbotConfigRepository: ChatbotConfigRepository,
    private readonly _createAIProvider: (provider: string) => AIProvider,
  ) {}

  async execute(
    input: SendWidgetMessageInput,
  ): Promise<SendWidgetMessageOutput> {
    const conversation =
      await this._conversationRepository.findByIdAndOrganizationIdAndVisitorId(
        input.conversationId,
        input.organizationId,
        input.visitorId,
      );

    if (!conversation) {
      throw new AppError(
        AppMessage.CONVERSATION_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (conversation.status !== "ACTIVE") {
      throw new AppError(
        AppMessage.CONVERSATION_CLOSED,
        HttpStatusCode.FORBIDDEN,
      );
    }

    const config =
      await this._chatbotConfigRepository.findByOrganizationId(
        input.organizationId,
      );

    if (!config || config.status !== "ACTIVE") {
      throw new AppError(
        AppMessage.CHATBOT_CONFIG_INACTIVE,
        HttpStatusCode.FORBIDDEN,
      );
    }

    const userMessage =
      await this._conversationMessageRepository.create({
        conversationId: conversation.id,
        organizationId: input.organizationId,
        role: "USER",
        content: input.message.trim(),
      });

    const history =
      await this._conversationMessageRepository.findByConversationId(
        conversation.id,
        input.organizationId,
        20,
      );

    const provider = this._createAIProvider(config.provider);

    const aiResponse = await provider.generateResponse({
      systemPrompt: config.systemPrompt,
      messages: history.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      model: config.model,
      temperature: config.temperature,
      maxOutputTokens: config.maxOutputTokens,
    });

    const assistantMessage =
      await this._conversationMessageRepository.create({
        conversationId: conversation.id,
        organizationId: input.organizationId,
        role: "ASSISTANT",
        content: aiResponse.content,
        provider: aiResponse.provider,
        model: aiResponse.model,
        inputTokens: aiResponse.inputTokens ?? null,
        outputTokens: aiResponse.outputTokens ?? null,
      });

    return {
      userMessage,
      assistantMessage,
    };
  }
}