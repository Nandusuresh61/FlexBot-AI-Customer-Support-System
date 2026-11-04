import { Types } from "mongoose";
import { KnowledgeDocument } from "../../../domain/entities/knowledge-document.entity.js";
import type { KnowledgeDocumentModelType } from "../models/knowledge-document.model.js";

export class KnowledgeDocumentMapper {
  static toDomain(
    doc: KnowledgeDocumentModelType & {
      _id: Types.ObjectId;
      createdAt: Date;
      updatedAt: Date;
    },
  ): KnowledgeDocument {
    return new KnowledgeDocument({
      id: doc._id.toString(),
      organizationId: doc.organizationId.toString(),
      chatbotConfigId: doc.chatbotConfigId.toString(),
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      fileSize: doc.fileSize,
      storageKey: doc.storageKey,
      status: doc.status,
      chunkCount: doc.chunkCount,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
