import type {
  ConversationRepository,
  ConversationStats,
  CreateConversationInput,
  ListConversationsInput,
  ListConversationsResult,
} from "../../../domain/repositories/conversation.repository.js";
import type { Conversation } from "../../../domain/entities/conversation.entity.js";
import { ConversationModel } from "../models/conversation.model.js";
import { toConversationEntity } from "../mappers/conversation.mapper.js";

export class MongoConversationRepository implements ConversationRepository {
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

  async findByIdAndOrganizationIdAndVisitorId(
    id: string,
    organizationId: string,
    visitorId: string,
  ): Promise<Conversation | null> {
    const document = await ConversationModel.findOne({
      _id: id,
      organizationId,
      visitorId,
    }).lean();

    return document
      ? toConversationEntity(
          document as Parameters<typeof toConversationEntity>[0],
        )
      : null;
  }

  async listByOrganization(
    input: ListConversationsInput,
  ): Promise<ListConversationsResult> {
    const filter: {
      organizationId: string;
      visitorId?: string;
      status?: "ACTIVE" | "CLOSED";
    } = {
      organizationId: input.organizationId,
    };

    if (input.visitorId) {
      filter.visitorId = input.visitorId;
    }

    if (input.status) {
      filter.status = input.status;
    }

    const skip = (input.page - 1) * input.limit;

    const [documents, total] = await Promise.all([
      ConversationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(input.limit)
        .lean(),

      ConversationModel.countDocuments(filter),
    ]);

    return {
      conversations: documents.map((document) =>
        toConversationEntity(
          document as Parameters<typeof toConversationEntity>[0],
        ),
      ),
      total,
    };
  }

  async getStatsByOrganization(
    organizationId: string,
  ): Promise<ConversationStats> {
    const [result] = await ConversationModel.aggregate<ConversationStats>([
      {
        $match: {
          organizationId,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0],
            },
          },
          closed: {
            $sum: {
              $cond: [{ $eq: ["$status", "CLOSED"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          active: 1,
          closed: 1,
        },
      },
    ]);

    return result ?? { total: 0, active: 0, closed: 0 };
  }
}
