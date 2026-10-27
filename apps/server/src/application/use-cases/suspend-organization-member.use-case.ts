import { z } from "zod";

import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
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
    private readonly _membershipRepository: MembershipRepository,
    private readonly _organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    input: SuspendOrganizationMemberInput,
  ): Promise<Membership> {
    const validatedInput = suspendMemberSchema.parse(input);

    const organization = await this._organizationRepository.findById(
      validatedInput.organizationId,
    );

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

    const membership = await this._membershipRepository.findById(
      validatedInput.membershipId,
    );

    if (
      !membership ||
      membership.organizationId !== validatedInput.organizationId
    ) {
      throw new AppError(
        AppMessage.MEMBERSHIP_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (membership.status !== "ACTIVE") {
      throw new AppError(
        AppMessage.MEMBERSHIP_SUSPENDED_ALREADY,
        HttpStatusCode.CONFLICT,
      );
    }

    if (membership.role === "ORG_ADMIN") {
      const organizationMemberships =
        await this._membershipRepository.findAllByOrganization(
          validatedInput.organizationId,
        );

      const activeAdminCount = organizationMemberships.filter(
        (item) => item.role === "ORG_ADMIN" && item.status === "ACTIVE",
      ).length;

      if (activeAdminCount <= 1) {
        throw new AppError(
          AppMessage.CANNOT_SUSPEND_LAST_ADMIN,
          HttpStatusCode.CONFLICT,
        );
      }
    }

    const suspendedMembership =
      await this._membershipRepository.suspendByIdAndOrganization(
        validatedInput.membershipId,
        validatedInput.organizationId,
      );

    if (!suspendedMembership) {
      throw new AppError(
        AppMessage.MEMBERSHIP_COULD_NOT_BE_SUSPENDED,
        HttpStatusCode.CONFLICT,
      );
    }

    return suspendedMembership;
  }
}