
import { z } from "zod";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import { AppError } from "../../domain/errors/app-error.js";
import type { Membership } from "../../domain/entities/membership.entity.js";
import type { OrganizationRepository } from "../../domain/repositories/organization.repository.js";
import type { MembershipRepository } from "../../domain/repositories/membership.repository.js";

const organizationIdSchema = z
  .string()
  .trim()
  .min(1, "Organization ID is required");

export class GetOrganizationMembersUseCase {
  constructor(
    private readonly _membershipRepository: MembershipRepository,
    private readonly _organizationRepository: OrganizationRepository,
  ) {}

  async execute(organizationId: string): Promise<Membership[]> {
    const validatedOrganizationId =
      organizationIdSchema.parse(organizationId);

    const organization =
      await this._organizationRepository.findById(validatedOrganizationId);

    if (!organization) {
      throw new AppError(
        AppMessage.ORGANIZATION_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (organization.status !== "ACTIVE") {
      throw new AppError(
        AppMessage.ORGANIZATION_NOT_ACTIVE,
        HttpStatusCode.FORBIDDEN,
      );
    }

    return this._membershipRepository.findAllByOrganization(
      validatedOrganizationId,
    );
  }
}
