import type {
  ConversationRepository,
  ListConversationsInput,
} from "../../../domain/repositories/conversation.repository.js";
import { AppError } from "../../../domain/errors/app-error.js";
import { AppMessage } from "../../../constants/appMessage.js";
import { HttpStatusCode } from "../../../constants/httpStatusCode.js";

export class ListConversationsUseCase {
  constructor(
    private readonly _conversationRepository: ConversationRepository,
  ) {}

  async execute(input: ListConversationsInput) {
    if (!input.organizationId.trim()) {
      throw new AppError(
        AppMessage.INVALID_REQUEST_PARAMETERS,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const page = Math.max(1, Math.floor(input.page || 1));
    const limit = Math.min(100, Math.max(1, Math.floor(input.limit || 20)));

    if (
      input.status !== undefined &&
      input.status !== "ACTIVE" &&
      input.status !== "CLOSED"
    ) {
      throw new AppError(
        AppMessage.INVALID_REQUEST_PARAMETERS,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    return this._conversationRepository.listByOrganization({
      organizationId: input.organizationId,
      status: input.status,
      page,
      limit,
    });
  }
}