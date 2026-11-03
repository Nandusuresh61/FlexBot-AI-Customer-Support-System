import type { ConversationRepository } from "../../../domain/repositories/conversation.repository.js";
import { AppError } from "../../../domain/errors/app-error.js";
import { AppMessage } from "../../../constants/appMessage.js";
import { HttpStatusCode } from "../../../constants/httpStatusCode.js";

export class GetConversationStatsUseCase {
  constructor(
    private readonly _conversationRepository: ConversationRepository,
  ) {}

  async execute(organizationId: string) {
    if (!organizationId.trim()) {
      throw new AppError(
        AppMessage.INVALID_REQUEST_PARAMETERS,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    return this._conversationRepository.getStatsByOrganization(
      organizationId,
    );
  }
}