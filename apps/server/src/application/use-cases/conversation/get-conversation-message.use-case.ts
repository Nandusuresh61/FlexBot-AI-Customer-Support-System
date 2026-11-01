import { HttpStatusCode } from "../../../constants/httpStatusCode.js";
import { AppMessage } from "../../../constants/appMessage.js";
import { ConversationRepository } from "../../../domain/repositories/conversation.repository.js";
import { ConversationMessageRepository } from "../../../domain/repositories/conversation-message.repository.js";
import { AppError } from "../../../domain/errors/app-error.js";

interface GetConversationMessagesInput {
  organizationId: string;
  conversationId: string;
  limit?: number;
}

export class GetConversationMessagesUseCase {
  constructor(
    private readonly _conversationRepository: ConversationRepository,
    private readonly _conversationMessageRepository: ConversationMessageRepository,
  ) {}

  async execute(input: GetConversationMessagesInput) {
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

    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);

    return this._conversationMessageRepository.findByConversationId(
      input.conversationId,
      input.organizationId,
      limit,
    );
  }
}
