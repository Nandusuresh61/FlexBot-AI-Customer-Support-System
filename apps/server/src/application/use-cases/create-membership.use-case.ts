import { z } from "zod";

import { AppError } from "../../domain/errors/app-error.js";
import type { Membership } from "../../domain/entities/membership.entity.js";
import type { MembershipRepository } from "../../domain/repositories/membership.repository.js";
import type { OrganizationRepository } from "../../domain/repositories/organization.repository.js";
import type {
  UserRepository,
} from "../../domain/repositories/user.repository.js";

export const createMembershipSchema = z.object({
  userId: z.string().trim().min(1, "User ID is required"),

  organizationId: z.string().trim().min(1, "Organization ID is required"),
});

export type CreateMembershipInput = z.infer<
  typeof createMembershipSchema
>;

export class CreateMembershipUseCase {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: CreateMembershipInput): Promise<Membership> {
  const validatedInput = createMembershipSchema.parse(input);

  const user = await this.userRepository.findById(
    validatedInput.userId,
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("User account is not active", 403);
  }

  const organization = await this.organizationRepository.findById(
    validatedInput.organizationId,
  );

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  if (organization.status !== "ACTIVE") {
    throw new AppError("Organization is not active", 403);
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

  return this.membershipRepository.create({
    userId: validatedInput.userId,
    organizationId: validatedInput.organizationId,
    role: "ORG_MEMBER",
  });
}
}