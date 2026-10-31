import { AppMessage } from "../../../constants/appMessage.js";
import { HttpStatusCode } from "../../../constants/httpStatusCode.js";
import { AppError } from "../../../domain/errors/app-error.js";
import type {
  ChatbotConfigRepository,
  CreateChatbotConfigInput,
} from "../../../domain/repositories/chatbot-config.repository.js";
import type { OrganizationRepository } from "../../../domain/repositories/organization.repository.js";

export class CreateChatbotConfigUseCase {
  constructor(
    private readonly _chatbotConfigRepository: ChatbotConfigRepository,
    private readonly _organizationRepository: OrganizationRepository,
  ) {}

  async execute(input: CreateChatbotConfigInput) {
    const organization = await this._organizationRepository.findById(
      input.organizationId,
    );

    if (!organization) {
      throw new AppError(
        AppMessage.ORGANIZATION_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (organization.status !== "ACTIVE") {
      throw new AppError(
        AppMessage.ORGANIZATION_NOT_ACTIVE,
        HttpStatusCode.FORBIDDEN,
      );
    }

    return this._chatbotConfigRepository.create(input);
  }
}
