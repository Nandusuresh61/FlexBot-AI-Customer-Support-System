import type { Conversation } from "../../../domain/entities/conversation.entity.js";
import type { ConversationRepository } from "../../../domain/repositories/conversation.repository.js";
import type { ChatbotConfigRepository } from "../../../domain/repositories/chatbot-config.repository.js";
import { AppError } from "../../../domain/errors/app-error.js";
import { AppMessage } from "../../../constants/appMessage.js";
import { HttpStatusCode } from "../../../constants/httpStatusCode.js";

export interface CreateConversationInput {
  organizationId: string;
  visitorId: string;
}

export class CreateConversationUseCase {
  constructor(
    private readonly _conversationRepository: ConversationRepository,
    private readonly _chatbotConfigRepository: ChatbotConfigRepository,
  ) {}

  async execute(input: CreateConversationInput): Promise<Conversation> {
    const config =
      await this._chatbotConfigRepository.findByOrganizationId(
        input.organizationId,
      );

    if (!config) {
      throw new AppError(
        AppMessage.CHATBOT_CONFIG_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (config.status !== "ACTIVE") {
      throw new AppError(
        AppMessage.CHATBOT_CONFIG_INACTIVE,
        HttpStatusCode.FORBIDDEN,
      );
    }

    return this._conversationRepository.create({
      organizationId: input.organizationId,
      chatbotConfigId: config.id,
      visitorId: input.visitorId,
    });
  }
}