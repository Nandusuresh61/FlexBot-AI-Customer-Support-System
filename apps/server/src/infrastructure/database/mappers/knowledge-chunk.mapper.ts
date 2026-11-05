import { KnowledgeChunk } from "../../../domain/entities/knowledge-chunk.entity.js";
import type { HydratedDocument } from "mongoose";
import type { KnowledgeChunkDocument } from "../models/knowledge-chunk.model.js";

type KnowledgeChunkHydratedDocument = HydratedDocument<KnowledgeChunkDocument>;

export class KnowledgeChunkMapper {
  static toDomain(doc: KnowledgeChunkHydratedDocument): KnowledgeChunk {
    return new KnowledgeChunk({
      id: doc._id.toString(),
      organizationId: doc.organizationId.toString(),
      chatbotConfigId: doc.chatbotConfigId.toString(),
      documentId: doc.documentId.toString(),
      chunkIndex: doc.chunkIndex,
      content: doc.content,
      createdAt: doc.createdAt,
    });
  }
}
