import { z } from "zod";

import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
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
    private readonly _membershipRepository: MembershipRepository,
    private readonly _organizationRepository: OrganizationRepository,
    private readonly _userRepository: UserRepository,
  ) {}

  async execute(input: CreateMembershipInput): Promise<Membership> {
    const validatedInput = createMembershipSchema.parse(input);

    const user = await this._userRepository.findById(
      validatedInput.userId,
    );

    if (!user) {
      throw new AppError(AppMessage.USER_NOT_FOUND, HttpStatusCode.NOT_FOUND);
    }

    if (user.status !== "ACTIVE") {
      throw new AppError(AppMessage.USER_INACTIVE, HttpStatusCode.FORBIDDEN);
    }

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

    const existingMembership =
      await this._membershipRepository.findByUserAndOrganization(
        validatedInput.userId,
        validatedInput.organizationId,
      );

    if (existingMembership) {
      throw new AppError(
        AppMessage.USER_ALREADY_MEMBER,
        HttpStatusCode.CONFLICT,
      );
    }

    return this._membershipRepository.create({
      userId: validatedInput.userId,
      organizationId: validatedInput.organizationId,
      role: "ORG_MEMBER",
    });
  }
}