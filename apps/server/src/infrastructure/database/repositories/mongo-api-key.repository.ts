import type {
  ApiKeyRepository,
  ApiKeySummary,
  CreateApiKeyInput,
} from "../../../domain/repositories/api-key.repository.js";
import type { ApiKey } from "../../../domain/entities/api-key.entity.js";
import { AppError } from "../../../domain/errors/app-error.js";
import { ApiKeyModel } from "../models/api-key.model.js";
import { toApiKeyEntity, toApiKeySummary } from "../mappers/api-key.mapper.js";
import { toObjectId } from "../mongodb-id.js";

export class MongoApiKeyRepository implements ApiKeyRepository {
  async create(input: CreateApiKeyInput): Promise<ApiKey> {
    try {
      const document = await ApiKeyModel.create({
        organizationId: toObjectId(input.organizationId),
        name: input.name.trim(),
        type: input.type,
        keyPrefix: input.keyPrefix,
        keyHash: input.keyHash,
        createdBy: toObjectId(input.createdBy),
        expiresAt: input.expiresAt,
      });

      // Reload because keyHash is excluded from ordinary queries.
      const createdDocument = await ApiKeyModel.findById(document._id).select(
        "+keyHash",
      );

      if (!createdDocument) {
        throw new AppError("Created API key could not be retrieved", 500);
      }

      return toApiKeyEntity(createdDocument);
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        throw new AppError("API key already exists", 409);
      }

      throw error;
    }
  }

  async findById(id: string): Promise<ApiKey | null> {
    const document = await ApiKeyModel.findById(toObjectId(id)).select(
      "+keyHash",
    );

    return document ? toApiKeyEntity(document) : null;
  }

  async findByIdAndOrganization(
    id: string,
    organizationId: string,
  ): Promise<ApiKey | null> {
    const document = await ApiKeyModel.findOne({
      _id: toObjectId(id),
      organizationId: toObjectId(organizationId),
    }).select("+keyHash");

    return document ? toApiKeyEntity(document) : null;
  }

  async findAllByOrganization(
    organizationId: string,
  ): Promise<ApiKeySummary[]> {
    const documents = await ApiKeyModel.find({
      organizationId: toObjectId(organizationId),
    }).sort({ createdAt: -1 });

    return documents.map(toApiKeySummary);
  }

  async revokeByIdAndOrganization(
    id: string,
    organizationId: string,
  ): Promise<ApiKey | null> {
    const document = await ApiKeyModel.findOneAndUpdate(
      {
        _id: toObjectId(id),
        organizationId: toObjectId(organizationId),
        status: "ACTIVE",
      },
      {
        $set: {
          status: "REVOKED",
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("+keyHash");

    return document ? toApiKeyEntity(document) : null;
  }

  async findActiveSecretByHash(keyHash: string): Promise<ApiKey | null> {
    const document = await ApiKeyModel.findOne({
      keyHash,
      type: "SECRET",
      status: "ACTIVE",
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    }).select("+keyHash");

    return document ? toApiKeyEntity(document) : null;
  }

  async updateLastUsedAt(id: string, usedAt: Date): Promise<void> {
    await ApiKeyModel.updateOne(
      {
        _id: toObjectId(id),
        status: "ACTIVE",
      },
      {
        $set: {
          lastUsedAt: usedAt,
        },
      },
    );
  }
}
