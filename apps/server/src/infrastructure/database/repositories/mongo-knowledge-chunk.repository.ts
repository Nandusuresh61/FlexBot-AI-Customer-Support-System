import type {
  CreateKnowledgeChunkInput,
  KnowledgeChunkRepository,
} from "../../../domain/repositories/knowledge-chunk.repository.js";
import type { KnowledgeChunk } from "../../../domain/entities/knowledge-chunk.entity.js";
import { KnowledgeChunkModel } from "../models/knowledge-chunk.model.js";
import { KnowledgeChunkMapper } from "../mappers/knowledge-chunk.mapper.js";

export class MongoKnowledgeChunkRepository
  implements KnowledgeChunkRepository
{
  async createMany(
    chunks: CreateKnowledgeChunkInput[],
  ): Promise<KnowledgeChunk[]> {
    if (chunks.length === 0) return [];

    const documents = await KnowledgeChunkModel.insertMany(chunks, {
      ordered: true,
    });

    return documents.map((doc) =>
      KnowledgeChunkMapper.toDomain(doc),
    );
  }

  async listByDocumentId(
    documentId: string,
    organizationId: string,
  ): Promise<KnowledgeChunk[]> {
    const documents = await KnowledgeChunkModel.find({
      documentId,
      organizationId,
    }).sort({ chunkIndex: 1 });

    return documents.map((doc) =>
      KnowledgeChunkMapper.toDomain(doc),
    );
  }

  async deleteByDocumentId(
    documentId: string,
    organizationId: string,
  ): Promise<void> {
    await KnowledgeChunkModel.deleteMany({
      documentId,
      organizationId,
    });
  }
}