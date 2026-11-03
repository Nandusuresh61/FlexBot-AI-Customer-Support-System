import { Conversation } from "../entities/conversation.entity";

export interface CreateConversationInput {
  organizationId: string;
  chatbotConfigId: string;
  visitorId: string;
}

export interface ListConversationsInput {
  organizationId: string;
  visitorId?: string;
  status?: "ACTIVE" | "CLOSED";
  page: number;
  limit: number;
}

export interface ListConversationsResult {
  conversations: Conversation[];
  total: number;
}

export interface ConversationStats {
  total: number;
  active: number;
  closed: number;
}

export interface ConversationTimelineItem {
  date: string;
  count: number;
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

  getStatsByOrganization(organizationId: string): Promise<ConversationStats>;

  getTimelineByOrganization(
    organizationId: string,
    from: Date,
    to: Date,
  ): Promise<ConversationTimelineItem[]>;
}
