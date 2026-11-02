import { Conversation } from "../entities/conversation.entity";

export interface CreateConversationInput {
  organizationId: string;
  chatbotConfigId: string;
  visitorId: string;
}

export interface ListConversationsInput {
  organizationId: string;
  status?: "ACTIVE" | "CLOSED";
  page: number;
  limit: number;
}

export interface ListConversationsResult {
  conversations: Conversation[];
  total: number;
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

  findByIdAndOrganizationIdAndVisitorId(
    id: string,
    organizationId: string,
    visitorId: string,
  ): Promise<Conversation | null>;

  listByOrganization(
    input: ListConversationsInput,
  ): Promise<ListConversationsResult>;
}
