import { ConversationMessage } from "../entities/conversation-message.entity";

export interface CreateConversationMessageInput {
  conversationId: string;
  organizationId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  provider?: string | null;
  model?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
}

export interface ConversationMessageRepository {
  create(
    input: CreateConversationMessageInput,
  ): Promise<ConversationMessage>;

  findByConversationId(
    conversationId: string,
    organizationId: string,
    limit?: number,
  ): Promise<ConversationMessage[]>;
}