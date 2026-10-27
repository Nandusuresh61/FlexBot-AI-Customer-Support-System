import { z } from "zod";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import { AppError } from "../../domain/errors/app-error.js";
import type { Organization } from "../../domain/entities/organization.entity.js";
import type { OrganizationRepository } from "../../domain/repositories/organization.repository.js";

const organizationIdSchema = z
  .string()
  .trim()
  .min(1, "Organization ID is required");

export class GetOrganizationByIdUseCase {
  constructor(
    private readonly _organizationRepository: OrganizationRepository,
  ) {}

  async execute(id: string): Promise<Organization> {
    const organizationId = organizationIdSchema.parse(id);

    const organization =
      await this._organizationRepository.findById(organizationId);

    if (!organization) {
      throw new AppError(
        AppMessage.ORGANIZATION_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    return organization;
  }
}