import type { Conversation } from "../../../domain/entities/conversation.entity.js";
import { Conversation as ConversationEntity } from "../../../domain/entities/conversation.entity.js";
import type { ConversationDocument } from "../models/conversation.model.js";

type ConversationDocumentWithId = ConversationDocument & {
  _id: unknown;
};

export const toConversationEntity = (
  document: ConversationDocumentWithId,
): Conversation => {
  return new ConversationEntity({
    id: String(document._id),
    organizationId: String(document.organizationId),
    chatbotConfigId: String(document.chatbotConfigId),
    visitorId: document.visitorId,
    status: document.status,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  });
};