import type { Membership } from "../entities/membership.entity.js";
import type { OrganizationRole } from "../entities/membership.entity.js";

export interface CreateMembershipInput {
  userId: string;
  organizationId: string;
  role: OrganizationRole;
}

export interface MembershipRepository {
  create(input: CreateMembershipInput): Promise<Membership>;

  findById(id: string): Promise<Membership | null>;

  findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<Membership | null>;

  findAllByOrganization(
    organizationId: string,
  ): Promise<Membership[]>;
}