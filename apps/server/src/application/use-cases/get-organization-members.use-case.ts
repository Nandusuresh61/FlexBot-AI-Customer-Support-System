
import { z } from "zod";
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
    private readonly membershipRepository: MembershipRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(organizationId: string): Promise<Membership[]> {
    const validatedOrganizationId =
      organizationIdSchema.parse(organizationId);

    const organization =
      await this.organizationRepository.findById(validatedOrganizationId);

    if (!organization) {
      throw new AppError("Organization not found", 404);
    }

    if (organization.status !== "ACTIVE") {
      throw new AppError("Organization is not active", 403);
    }

    return this.membershipRepository.findAllByOrganization(
      validatedOrganizationId,
    );
  }
}
