export type MessageRole = "USER" | "ASSISTANT";

export interface ConversationMessageProps {
  id: string;
  conversationId: string;
  organizationId: string;
  role: MessageRole;
  content: string;
  provider?: string | null;
  model?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  createdAt: Date;
}

export class ConversationMessage {
  readonly id: string;
  readonly conversationId: string;
  readonly organizationId: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly provider: string | null;
  readonly model: string | null;
  readonly inputTokens: number | null;
  readonly outputTokens: number | null;
  readonly createdAt: Date;

  constructor(props: ConversationMessageProps) {
    if (!props.id.trim()) throw new Error("Message ID is required");
    if (!props.conversationId.trim()) {
      throw new Error("Conversation ID is required");
    }
    if (!props.organizationId.trim()) {
      throw new Error("Organization ID is required");
    }
    if (!["USER", "ASSISTANT"].includes(props.role)) {
      throw new Error("Invalid message role");
    }
    if (!props.content.trim()) throw new Error("Message content is required");

    this.id = props.id;
    this.conversationId = props.conversationId;
    this.organizationId = props.organizationId;
    this.role = props.role;
    this.content = props.content;
    this.provider = props.provider ?? null;
    this.model = props.model ?? null;
    this.inputTokens = props.inputTokens ?? null;
    this.outputTokens = props.outputTokens ?? null;
    this.createdAt = props.createdAt;
  }
}