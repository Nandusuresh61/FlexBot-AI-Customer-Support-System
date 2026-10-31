import type { AIProvider } from "../../interfaces/ai-provider.types.js";
import type { ChatbotConfigRepository } from "../../../domain/repositories/chatbot-config.repository.js";
import { AppError } from "../../../domain/errors/app-error.js";
import { AppMessage } from "../../../constants/appMessage.js";
import { HttpStatusCode } from "../../../constants/httpStatusCode.js";

type AIProviderResolver = (provider: string) => AIProvider;

export interface GenerateChatbotResponseInput {
  organizationId: string;
  message: string;
}

export class GenerateChatbotResponseUseCase {
  constructor(
    private readonly _chatbotConfigRepository: ChatbotConfigRepository,
    private readonly _resolveAIProvider: AIProviderResolver,
  ) {}

  async execute(input: GenerateChatbotResponseInput) {
    const config = await this._chatbotConfigRepository.findByOrganizationId(
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

    const provider = this._resolveAIProvider(config.provider);

    return provider.generateResponse({
      systemPrompt: config.systemPrompt,
      userMessage: input.message,
      model: config.model,
      temperature: config.temperature,
      maxOutputTokens: config.maxOutputTokens,
    });
  }
}
