import { z } from "zod";

import { AppError } from "../../domain/errors/app-error.js";
import type { Membership } from "../../domain/entities/membership.entity.js";
import type { MembershipRepository } from "../../domain/repositories/membership.repository.js";
import type { OrganizationRepository } from "../../domain/repositories/organization.repository.js";

const suspendMemberSchema = z.object({
  organizationId: z.string().trim().min(1, "Organization ID is required"),
  membershipId: z.string().trim().min(1, "Membership ID is required"),
});
 
export type SuspendOrganizationMemberInput = z.infer<
  typeof suspendMemberSchema
>;

export class SuspendOrganizationMemberUseCase {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    input: SuspendOrganizationMemberInput,
  ): Promise<Membership> {
    const validatedInput = suspendMemberSchema.parse(input);

    const organization = await this.organizationRepository.findById(
      validatedInput.organizationId,
    );

    if (!organization) {
      throw new AppError("Organization not found", 404);
    }

    if (organization.status !== "ACTIVE") {
      throw new AppError("Organization is not active", 403);
    }

    const membership = await this.membershipRepository.findById(
      validatedInput.membershipId,
    );

    if (
      !membership ||
      membership.organizationId !== validatedInput.organizationId
    ) {
      throw new AppError("Membership not found in this organization", 404);
    }

    if (membership.status !== "ACTIVE") {
      throw new AppError("Membership is already suspended", 409);
    }

    if (membership.role === "ORG_ADMIN") {
      const organizationMemberships =
        await this.membershipRepository.findAllByOrganization(
          validatedInput.organizationId,
        );

      const activeAdminCount = organizationMemberships.filter(
        (item) => item.role === "ORG_ADMIN" && item.status === "ACTIVE",
      ).length;

      if (activeAdminCount <= 1) {
        throw new AppError(
          "Cannot suspend the last active organization admin",
          409,
        );
      }
    }

    const suspendedMembership =
      await this.membershipRepository.suspendByIdAndOrganization(
        validatedInput.membershipId,
        validatedInput.organizationId,
      );

    if (!suspendedMembership) {
      throw new AppError(
        "Membership could not be suspended",
        409,
      );
    }

    return suspendedMembership;
  }
}