export interface KnowledgeChunkProps {
  id: string;
  organizationId: string;
  chatbotConfigId: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  createdAt: Date;
}

export class KnowledgeChunk {
  constructor(private readonly props: KnowledgeChunkProps) {}

  get id(): string {
    return this.props.id;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get chatbotConfigId(): string {
    return this.props.chatbotConfigId;
  }

  get documentId(): string {
    return this.props.documentId;
  }

  get chunkIndex(): number {
    return this.props.chunkIndex;
  }

  get content(): string {
    return this.props.content;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
