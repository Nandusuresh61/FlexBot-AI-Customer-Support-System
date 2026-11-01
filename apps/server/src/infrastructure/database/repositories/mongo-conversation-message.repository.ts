import type {
  ConversationMessageRepository,
  CreateConversationMessageInput,
} from "../../../domain/repositories/conversation-message.repository.js";
import type { ConversationMessage } from "../../../domain/entities/conversation-message.entity.js";
import { ConversationMessageModel } from "../models/conversation-message.model.js";
import { toConversationMessageEntity } from "../mappers/conversation-message.mapper.js";

export class MongoConversationMessageRepository
  implements ConversationMessageRepository
{
  async create(
    input: CreateConversationMessageInput,
  ): Promise<ConversationMessage> {
    const document = await ConversationMessageModel.create(input);

    return toConversationMessageEntity(
      document.toObject() as Parameters<
        typeof toConversationMessageEntity
      >[0],
    );
  }

  async findByConversationId(
    conversationId: string,
    organizationId: string,
    limit = 50,
  ): Promise<ConversationMessage[]> {
    const documents = await ConversationMessageModel.find({
      conversationId,
      organizationId,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return documents
      .reverse()
      .map((document) =>
        toConversationMessageEntity(
          document as Parameters<
            typeof toConversationMessageEntity
          >[0],
        ),
      );
  }
}