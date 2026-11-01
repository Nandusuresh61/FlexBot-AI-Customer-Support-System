import { Conversation } from "../entities/conversation.entity";

export interface CreateConversationInput {
  organizationId: string;
  chatbotConfigId: string;
  visitorId: string;
}

export interface ConversationRepository {
  create(input: CreateConversationInput): Promise<Conversation>;

  findById(id: string): Promise<Conversation | null>;

  findByIdAndOrganizationId(
    id: string,
    organizationId: string,
  ): Promise<Conversation | null>;

  updateStatus(
    id: string,
    organizationId: string,
    status: "ACTIVE" | "CLOSED",
  ): Promise<Conversation | null>;
}