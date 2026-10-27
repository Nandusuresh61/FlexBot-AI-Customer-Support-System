import { z } from "zod";

import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import { AppError } from "../../domain/errors/app-error.js";
import type { Organization } from "../../domain/entities/organization.entity.js";
import type {
  OrganizationRepository,
} from "../../domain/repositories/organization.repository.js";
import type {
  MembershipRepository,
} from "../../domain/repositories/membership.repository.js";

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must contain at least 2 characters")
    .max(100, "Organization name cannot exceed 100 characters"),

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Organization slug must contain at least 2 characters")
    .max(100, "Organization slug cannot exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers, and single hyphens",
    ),
});

export type CreateOrganizationInput = z.infer<
  typeof createOrganizationSchema
>;

export class CreateOrganizationUseCase {
  constructor(
    private readonly _organizationRepository: OrganizationRepository,
    private readonly _membershipRepository: MembershipRepository,
  ) {}

  async execute(
    input: CreateOrganizationInput,
    creatorUserId: string,
  ): Promise<Organization> {
    if (!creatorUserId?.trim()) {
      throw new AppError(
        AppMessage.AUTHENTICATED_USER_REQUIRED,
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    const validatedInput = createOrganizationSchema.parse(input);

    const existingOrganization =
      await this._organizationRepository.findBySlug(validatedInput.slug);

    if (existingOrganization) {
      throw new AppError(
        AppMessage.ORGANIZATION_SLUG_EXISTS,
        HttpStatusCode.CONFLICT,
      );
    }

    const organization =
      await this._organizationRepository.create(validatedInput);

    await this._membershipRepository.create({
      userId: creatorUserId,
      organizationId: organization.id,
      role: "ORG_ADMIN",
    });

    return organization;
  }
}