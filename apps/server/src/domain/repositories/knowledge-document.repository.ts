import type { KnowledgeDocument } from "../entities/knowledge-document.entity.js";

export interface CreateKnowledgeDocumentInput {
  organizationId: string;
  chatbotConfigId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
}

export interface KnowledgeDocumentRepository {
  create(
    input: CreateKnowledgeDocumentInput,
  id?: string,
  status?: KnowledgeDocument["status"],
  chunkCount?: number,
  createdAt?: Date,
    updatedAt?: Date,
  ): Promise<KnowledgeDocument>;

  findById(id: string): Promise<KnowledgeDocument | null>;

  findByIdAndOrganizationId(
    id: string,
    organizationId: string,
  ): Promise<KnowledgeDocument | null>;

  listByOrganization(
    organizationId: string,
  ): Promise<KnowledgeDocument[]>;

  updateStatus(
    id: string,
    status: KnowledgeDocument["status"],
    chunkCount?: number,
  ): Promise<KnowledgeDocument | null>;

  delete(id: string, organizationId: string): Promise<boolean>;
}