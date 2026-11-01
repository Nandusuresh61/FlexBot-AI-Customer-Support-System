import type { ConversationMessageRepository } from "../../../domain/repositories/conversation-message.repository.js";
import type { ConversationRepository } from "../../../domain/repositories/conversation.repository.js";
import { HttpStatusCode } from "../../../constants/httpStatusCode.js";
import { AppMessage } from "../../../constants/appMessage.js";
import { AppError } from "../../../domain/errors/app-error.js";

interface GetWidgetConversationMessagesInput {
  organizationId: string;
  conversationId: string;
  visitorId: string;
  limit?: number;
}

export class GetWidgetConversationMessagesUseCase {
  constructor(
    private readonly _conversationRepository: ConversationRepository,
    private readonly _conversationMessageRepository: ConversationMessageRepository,
  ) {}

  async execute(input: GetWidgetConversationMessagesInput) {
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

    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);

    return this._conversationMessageRepository.findByConversationId(
      input.conversationId,
      input.organizationId,
      limit,
    );
  }
}