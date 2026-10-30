import type { ApiKeyRepository } from "../../domain/repositories/api-key.repository.js";
import type { OrganizationRepository } from "../../domain/repositories/organization.repository.js";
import { AppError } from "../../domain/errors/app-error.js";
import { AppMessage } from "../../constants/appMessage.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";

export class ListApiKeysUseCase {
  constructor(
    private readonly _apiKeyRepository: ApiKeyRepository,
    private readonly _organizationRepository: OrganizationRepository,
  ) {}

  async execute(organizationId: string) {
    const organization =
      await this._organizationRepository.findById(organizationId);

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

    return this._apiKeyRepository.findAllByOrganization(organizationId);
  }
}