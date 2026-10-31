import { AppError } from "../../../domain/errors/app-error.js";
import { AppMessage } from "../../../constants/appMessage.js";
import { HttpStatusCode } from "../../../constants/httpStatusCode.js";
import type {
  ChatbotConfigRepository,
  UpdateChatbotConfigInput,
} from "../../../domain/repositories/chatbot-config.repository.js";
import type { OrganizationRepository } from "../../../domain/repositories/organization.repository.js";

export class UpdateChatbotConfigUseCase {
  constructor(
    private readonly _chatbotConfigRepository: ChatbotConfigRepository,
    private readonly _organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    organizationId: string,
    input: UpdateChatbotConfigInput,
  ) {
    const organization = await this._organizationRepository.findById(
      organizationId,
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

    const existingConfig =
      await this._chatbotConfigRepository.findByOrganizationId(
        organizationId,
      );

    if (!existingConfig) {
      throw new AppError(
        AppMessage.CHATBOT_CONFIG_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    const updatedConfig =
      await this._chatbotConfigRepository.updateByOrganizationId(
        organizationId,
        input,
      );

    if (!updatedConfig) {
      throw new AppError(
        AppMessage.CHATBOT_CONFIG_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    return updatedConfig;
  }
}