import { Types } from "mongoose";
import type {
  KnowledgeDocumentRepository,
  CreateKnowledgeDocumentInput,
} from "../../../domain/repositories/knowledge-document.repository.js";
import { KnowledgeDocument } from "../../../domain/entities/knowledge-document.entity.js";
import { KnowledgeDocumentModel } from "../models/knowledge-document.model.js";
import { KnowledgeDocumentMapper } from "../mappers/knowledge-document.mapper.js";

export class MongoKnowledgeDocumentRepository implements KnowledgeDocumentRepository {
  async create(
    input: CreateKnowledgeDocumentInput,
    id?: string,
    status: KnowledgeDocument["status"] = "UPLOADED",
    chunkCount = 0,
    createdAt?: Date,
    updatedAt?: Date,
  ): Promise<KnowledgeDocument> {
    const doc = await KnowledgeDocumentModel.create({
      ...(id ? { _id: new Types.ObjectId(id) } : {}),
      ...input,
      status,
      chunkCount,
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    });

    return KnowledgeDocumentMapper.toDomain(
      doc.toObject() as Parameters<typeof KnowledgeDocumentMapper.toDomain>[0],
    );
  }

  async findById(id: string): Promise<KnowledgeDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await KnowledgeDocumentModel.findById(id).lean();
    return doc
      ? KnowledgeDocumentMapper.toDomain(
          doc as Parameters<typeof KnowledgeDocumentMapper.toDomain>[0],
        )
      : null;
  }

  async findByIdAndOrganizationId(
    id: string,
    organizationId: string,
  ): Promise<KnowledgeDocument | null> {
    if (
      !Types.ObjectId.isValid(id) ||
      !Types.ObjectId.isValid(organizationId)
    ) {
      return null;
    }

    const doc = await KnowledgeDocumentModel.findOne({
      _id: id,
      organizationId,
    }).lean();

    return doc
      ? KnowledgeDocumentMapper.toDomain(
          doc as Parameters<typeof KnowledgeDocumentMapper.toDomain>[0],
        )
      : null;
  }

  async listByOrganization(
    organizationId: string,
  ): Promise<KnowledgeDocument[]> {
    if (!Types.ObjectId.isValid(organizationId)) return [];

    const docs = await KnowledgeDocumentModel.find({ organizationId })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc) =>
      KnowledgeDocumentMapper.toDomain(
        doc as Parameters<typeof KnowledgeDocumentMapper.toDomain>[0],
      ),
    );
  }

  async updateStatus(
  id: string,
  organizationId: string,
  status: KnowledgeDocument["status"],
  chunkCount?: number,
): Promise<KnowledgeDocument | null> {
  const updatedDocument =
    await KnowledgeDocumentModel.findOneAndUpdate(
      {
        _id: id,
        organizationId,
      },
      {
        $set: {
          status,
          ...(chunkCount !== undefined && { chunkCount }),
        },
      },
      { new: true },
    );

  return updatedDocument
    ? KnowledgeDocumentMapper.toDomain(updatedDocument)
    : null;
}

  async delete(id: string, organizationId: string): Promise<boolean> {
    if (
      !Types.ObjectId.isValid(id) ||
      !Types.ObjectId.isValid(organizationId)
    ) {
      return false;
    }

    const result = await KnowledgeDocumentModel.deleteOne({
      _id: id,
      organizationId,
    });

    return result.deletedCount === 1;
  }
}
