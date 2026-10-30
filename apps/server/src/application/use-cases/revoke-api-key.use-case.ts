import type { ApiKeyRepository } from "../../domain/repositories/api-key.repository.js";
import type { OrganizationRepository } from "../../domain/repositories/organization.repository.js";
import { AppError } from "../../domain/errors/app-error.js";
import { AppMessage } from "../../constants/appMessage.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";

interface RevokeApiKeyInput {
  apiKeyId: string;
  organizationId: string;
}

export class RevokeApiKeyUseCase {
  constructor(
    private readonly _apiKeyRepository: ApiKeyRepository,
    private readonly _organizationRepository: OrganizationRepository,
  ) {}

  async execute(input: RevokeApiKeyInput) {
    const organization =
      await this._organizationRepository.findById(input.organizationId);

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

    const apiKey = await this._apiKeyRepository.findByIdAndOrganization(
      input.apiKeyId,
      input.organizationId,
    );

    if (!apiKey) {
      throw new AppError(
        AppMessage.API_KEY_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (apiKey.status === "REVOKED") {
      throw new AppError(
        AppMessage.API_KEY_ALREADY_REVOKED,
        HttpStatusCode.CONFLICT,
      );
    }

    const revokedApiKey =
      await this._apiKeyRepository.revokeByIdAndOrganization(
        input.apiKeyId,
        input.organizationId,
      );

    if (!revokedApiKey) {
      throw new AppError(
        AppMessage.API_KEY_ALREADY_REVOKED,
        HttpStatusCode.CONFLICT,
      );
    }

    return {
      id: revokedApiKey.id,
      organizationId: revokedApiKey.organizationId,
      name: revokedApiKey.name,
      type: revokedApiKey.type,
      keyPrefix: revokedApiKey.keyPrefix,
      status: revokedApiKey.status,
      createdBy: revokedApiKey.createdBy,
      lastUsedAt: revokedApiKey.lastUsedAt,
      expiresAt: revokedApiKey.expiresAt,
      createdAt: revokedApiKey.createdAt,
      updatedAt: revokedApiKey.updatedAt,
    };
  }
}