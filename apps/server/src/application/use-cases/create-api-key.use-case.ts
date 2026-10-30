import type { ApiKeyRepository } from "../../domain/repositories/api-key.repository.js";
import type { OrganizationRepository } from "../../domain/repositories/organization.repository.js";
import type { ApiKeyType } from "../../domain/entities/api-key.entity.js";
import { ApiKeyGenerator } from "../../infrastructure/security/api-key-generator.js";
import { AppError } from "../../domain/errors/app-error.js";
import { AppMessage } from "../../constants/appMessage.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";

export interface CreateApiKeyInput {
  organizationId: string;
  createdBy: string;
  name: string;
  type: ApiKeyType;
  expiresAt?: Date | null;
}

export class CreateApiKeyUseCase {
  constructor(
    private readonly _apiKeyRepository: ApiKeyRepository,
    private readonly _organizationRepository: OrganizationRepository,
    private readonly _apiKeyGenerator: ApiKeyGenerator,
  ) {}

  async execute(input: CreateApiKeyInput) {
    const name = input.name?.trim();

    if (!name) {
      throw new AppError(
        AppMessage.API_KEY_NAME_REQUIRED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (!["PUBLIC", "SECRET"].includes(input.type)) {
      throw new AppError(
        AppMessage.API_KEY_TYPE_INVALID,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const organization = await this._organizationRepository.findById(
      input.organizationId,
    );

    if (!organization) {
      throw new AppError(
        AppMessage.ORGANIZATION_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (organization.status !== "ACTIVE") {
      throw new AppError(
        AppMessage.ORGANIZATION_SUSPENDED,
        HttpStatusCode.FORBIDDEN,
      );
    }

    const expiresAt = input.expiresAt ?? null;

    if (expiresAt !== null) {
      if (
        !(expiresAt instanceof Date) ||
        Number.isNaN(expiresAt.getTime()) ||
        expiresAt.getTime() <= Date.now()
      ) {
        throw new AppError(
          AppMessage.API_KEY_EXPIRATION_INVALID,
          HttpStatusCode.BAD_REQUEST,
        );
      }
    }

    const generatedKey = this._apiKeyGenerator.generate(input.type);

    const apiKey = await this._apiKeyRepository.create({
      organizationId: input.organizationId,
      name,
      type: input.type,
      keyPrefix: generatedKey.keyPrefix,
      keyHash: generatedKey.keyHash,
      createdBy: input.createdBy,
      expiresAt,
    });

    return {
      apiKey: {
        id: apiKey.id,
        organizationId: apiKey.organizationId,
        name: apiKey.name,
        type: apiKey.type,
        keyPrefix: apiKey.keyPrefix,
        status: apiKey.status,
        createdBy: apiKey.createdBy,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
      },
      plaintextKey: generatedKey.plaintextKey,
    };
  }
}