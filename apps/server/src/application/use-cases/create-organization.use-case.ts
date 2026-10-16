import { z } from "zod";
import { AppError } from "../../domain/errors/app-error.js";
import type { Organization } from "../../domain/entities/organization.entity.js";
import type {
  OrganizationRepository,
} from "../../domain/repositories/organization.repository.js";

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
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(input: CreateOrganizationInput): Promise<Organization> {
    const validatedInput = createOrganizationSchema.parse(input);

    const existingOrganization =
      await this.organizationRepository.findBySlug(validatedInput.slug);

    if (existingOrganization) {
      throw new AppError(
        "An organization with this slug already exists",
        409,
      );
    }

    return this.organizationRepository.create(validatedInput);
  }
}