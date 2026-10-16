import type { Organization } from "../entities/organization.entity.js";

export interface CreateOrganizationInput {
  name: string;
  slug: string;
}

export interface OrganizationRepository {
  create(input: CreateOrganizationInput): Promise<Organization>;

  findById(id: string): Promise<Organization | null>;

  findBySlug(slug: string): Promise<Organization | null>;
}