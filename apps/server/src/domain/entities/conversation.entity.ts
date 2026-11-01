export type ConversationStatus = "ACTIVE" | "CLOSED";

export interface ConversationProps {
  id: string;
  organizationId: string;
  chatbotConfigId: string;
  visitorId: string;
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Conversation {
  readonly id: string;
  readonly organizationId: string;
  readonly chatbotConfigId: string;
  readonly visitorId: string;
  readonly status: ConversationStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ConversationProps) {
    if (!props.id.trim()) throw new Error("Conversation ID is required");
    if (!props.organizationId.trim()) throw new Error("Organization ID is required");
    if (!props.chatbotConfigId.trim()) throw new Error("Chatbot config ID is required");
    if (!props.visitorId.trim()) throw new Error("Visitor ID is required");

    if (!["ACTIVE", "CLOSED"].includes(props.status)) {
      throw new Error("Invalid conversation status");
    }

    this.id = props.id;
    this.organizationId = props.organizationId;
    this.chatbotConfigId = props.chatbotConfigId;
    this.visitorId = props.visitorId;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}