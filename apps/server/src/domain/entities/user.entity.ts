export type UserStatus = "ACTIVE" | "SUSPENDED";

export type PlatformRole = "USER" | "SUPER_ADMIN";

export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  platformRole: PlatformRole;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly status: UserStatus;
  public readonly platformRole: PlatformRole;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserProps) {
    if (!props.id.trim()) {
      throw new Error("User ID is required");
    }

    if (!props.name.trim()) {
      throw new Error("User name is required");
    }

    if (!props.email.trim()) {
      throw new Error("User email is required");
    }

    if (!props.passwordHash.trim()) {
      throw new Error("Password hash is required");
    }

    this.id = props.id;
    this.name = props.name;
    this.email = props.email.trim().toLowerCase();
    this.passwordHash = props.passwordHash;
    this.status = props.status;
    this.platformRole = props.platformRole;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}