export type KnowledgeDocumentStatus =
  | "UPLOADED"
  | "PROCESSING"
  | "READY"
  | "FAILED";

export interface KnowledgeDocumentProps {
  id: string;
  organizationId: string;
  chatbotConfigId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  status: KnowledgeDocumentStatus;
  chunkCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class KnowledgeDocument {
  constructor(private readonly props: KnowledgeDocumentProps) {}

  get id(): string {
    return this.props.id;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get chatbotConfigId(): string {
    return this.props.chatbotConfigId;
  }

  get fileName(): string {
    return this.props.fileName;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get fileSize(): number {
    return this.props.fileSize;
  }

  get status(): KnowledgeDocumentStatus {
    return this.props.status;
  }

  get chunkCount(): number {
    return this.props.chunkCount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}