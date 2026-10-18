import { z } from "zod";

import { AppError } from "../../domain/errors/app-error.js";
import type { Membership } from "../../domain/entities/membership.entity.js";
import type { MembershipRepository } from "../../domain/repositories/membership.repository.js";
import type { OrganizationRepository } from "../../domain/repositories/organization.repository.js";

export const createMembershipSchema = z.object({
  userId: z
    .string()
    .trim()
    .min(1, "User ID is required"),

  organizationId: z
    .string()
    .trim()
    .min(1, "Organization ID is required"),

  role: z.enum(["ORG_ADMIN", "ORG_MEMBER"]),
});

export type CreateMembershipInput = z.infer<
  typeof createMembershipSchema
>;

export class CreateMembershipUseCase {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(input: CreateMembershipInput): Promise<Membership> {
    const validatedInput = createMembershipSchema.parse(input);

    const organization = await this.organizationRepository.findById(
      validatedInput.organizationId,
    );

    if (!organization) {
      throw new AppError("Organization not found", 404);
    }

    const existingMembership =
      await this.membershipRepository.findByUserAndOrganization(
        validatedInput.userId,
        validatedInput.organizationId,
      );

    if (existingMembership) {
      throw new AppError(
        "This user already belongs to the organization",
        409,
      );
    }

    return this.membershipRepository.create(validatedInput);
  }
}