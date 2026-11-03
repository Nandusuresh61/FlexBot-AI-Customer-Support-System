import type { ConversationRepository } from "../../../domain/repositories/conversation.repository.js";
import { AppError } from "../../../domain/errors/app-error.js";
import { AppMessage } from "../../../constants/appMessage.js";
import { HttpStatusCode } from "../../../constants/httpStatusCode.js";

interface GetConversationDetailsInput {
  organizationId: string;
  conversationId: string;
}

export class GetConversationDetailsUseCase {
  constructor(
    private readonly _conversationRepository: ConversationRepository,
  ) {}

  async execute(input: GetConversationDetailsInput) {
    const conversation =
      await this._conversationRepository.findByIdAndOrganizationId(
        input.conversationId,
        input.organizationId,
      );

    if (!conversation) {
      throw new AppError(
        AppMessage.CONVERSATION_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    return conversation;
  }
}