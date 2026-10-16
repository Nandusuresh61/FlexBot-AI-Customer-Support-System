export type OrganizationStatus = "ACTIVE" | "SUSPENDED";

export interface OrganizationProps {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Organization {
  public readonly id: string;
  public readonly name: string;
  public readonly slug: string;
  public readonly status: OrganizationStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: OrganizationProps) {
    if (!props.id.trim()) {
      throw new Error("Organization ID is required");
    }

    if (!props.name.trim()) {
      throw new Error("Organization name is required");
    }

    if (!props.slug.trim()) {
      throw new Error("Organization slug is required");
    }

    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}