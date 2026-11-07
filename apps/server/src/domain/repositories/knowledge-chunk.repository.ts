import type { KnowledgeChunk } from "../entities/knowledge-chunk.entity.js";

export interface CreateKnowledgeChunkInput {
  organizationId: string;
  chatbotConfigId: string;
  documentId: string;
  chunkIndex: number;
  content: string;
}

export interface KnowledgeChunkRepository {
  createMany(chunks: CreateKnowledgeChunkInput[]): Promise<KnowledgeChunk[]>;
  listByDocumentId(
    documentId: string,
    organizationId: string,
  ): Promise<KnowledgeChunk[]>;
  deleteByDocumentId(
    documentId: string,
    organizationId: string,
  ): Promise<void>;
}