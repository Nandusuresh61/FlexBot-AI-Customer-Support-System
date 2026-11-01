import {
  ConversationMessage,
  type ConversationMessageProps,
} from "../../../domain/entities/conversation-message.entity.js";
import type { ConversationMessageDocument } from "../models/conversation-message.model.js";

type ConversationMessageDocumentWithId = ConversationMessageDocument & {
  _id: unknown;
};

export const toConversationMessageEntity = (
  document: ConversationMessageDocumentWithId,
): ConversationMessage => {
  return new ConversationMessage({
    id: String(document._id),
    conversationId: String(document.conversationId),
    organizationId: String(document.organizationId),
    role: document.role,
    content: document.content,
    provider: document.provider,
    model: document.model,
    inputTokens: document.inputTokens,
    outputTokens: document.outputTokens,
    createdAt: document.createdAt,
  } satisfies ConversationMessageProps);
};