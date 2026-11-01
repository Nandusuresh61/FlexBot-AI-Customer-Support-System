import type {
  ConversationRepository,
  CreateConversationInput,
} from "../../../domain/repositories/conversation.repository.js";
import type { Conversation } from "../../../domain/entities/conversation.entity.js";
import { ConversationModel } from "../models/conversation.model.js";
import { toConversationEntity } from "../mappers/conversation.mapper.js";

export class MongoConversationRepository
  implements ConversationRepository
{
  async create(input: CreateConversationInput): Promise<Conversation> {
    const document = await ConversationModel.create(input);

    return toConversationEntity(
      document.toObject() as Parameters<typeof toConversationEntity>[0],
    );
  }

  async findById(id: string): Promise<Conversation | null> {
    const document = await ConversationModel.findById(id).lean();

    return document
      ? toConversationEntity(
          document as Parameters<typeof toConversationEntity>[0],
        )
      : null;
  }

  async findByIdAndOrganizationId(
    id: string,
    organizationId: string,
  ): Promise<Conversation | null> {
    const document = await ConversationModel.findOne({
      _id: id,
      organizationId,
    }).lean();

    return document
      ? toConversationEntity(
          document as Parameters<typeof toConversationEntity>[0],
        )
      : null;
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: "ACTIVE" | "CLOSED",
  ): Promise<Conversation | null> {
    const document = await ConversationModel.findOneAndUpdate(
      { _id: id, organizationId },
      { $set: { status } },
      { new: true, runValidators: true },
    ).lean();

    return document
      ? toConversationEntity(
          document as Parameters<typeof toConversationEntity>[0],
        )
      : null;
  }
}