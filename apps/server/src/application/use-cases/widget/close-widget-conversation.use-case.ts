import type { ConversationRepository } from "../../../domain/repositories/conversation.repository.js";
import { HttpStatusCode } from "../../../constants/httpStatusCode.js";
import { AppMessage } from "../../../constants/appMessage.js";
import { AppError } from "../../../domain/errors/app-error.js";

interface CloseWidgetConversationInput {
  organizationId: string;
  conversationId: string;
  visitorId: string;
}

export class CloseWidgetConversationUseCase {
  constructor(
    private readonly _conversationRepository: ConversationRepository,
  ) {}

  async execute(input: CloseWidgetConversationInput) {
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

    if (conversation.status === "CLOSED") {
      return conversation;
    }

    return this._conversationRepository.updateStatus(
      input.conversationId,
        input.organizationId,
      "CLOSED",
    );
  }
}