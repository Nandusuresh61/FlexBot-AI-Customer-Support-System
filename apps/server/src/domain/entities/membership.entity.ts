export type OrganizationRole = "ORG_ADMIN" | "ORG_MEMBER";

export type MembershipStatus = "ACTIVE" | "SUSPENDED";

export interface MembershipProps {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  status: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Membership {
  public readonly id: string;
  public readonly userId: string;
  public readonly organizationId: string;
  public readonly role: OrganizationRole;
  public readonly status: MembershipStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: MembershipProps) {
    if (!props.id.trim()) {
      throw new Error("Membership ID is required");
    }

    if (!props.userId.trim()) {
      throw new Error("User ID is required");
    }

    if (!props.organizationId.trim()) {
      throw new Error("Organization ID is required");
    }

    this.id = props.id;
    this.userId = props.userId;
    this.organizationId = props.organizationId;
    this.role = props.role;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}