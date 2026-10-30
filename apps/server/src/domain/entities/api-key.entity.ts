export type ApiKeyType = "PUBLIC" | "SECRET";

export type ApiKeyStatus = "ACTIVE" | "REVOKED";

export interface ApiKeyProps {
  id: string;
  organizationId: string;
  name: string;
  type: ApiKeyType;
  keyPrefix: string;
  keyHash: string;
  status: ApiKeyStatus;
  createdBy: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ApiKey {
  public readonly id: string;
  public readonly organizationId: string;
  public readonly name: string;
  public readonly type: ApiKeyType;
  public readonly keyPrefix: string;
  public readonly keyHash: string;
  public readonly status: ApiKeyStatus;
  public readonly createdBy: string;
  public readonly lastUsedAt: Date | null;
  public readonly expiresAt: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: ApiKeyProps) {
    if (!props.id.trim()) {
      throw new Error("API key ID is required");
    }

    if (!props.organizationId.trim()) {
      throw new Error("Organization ID is required");
    }

    if (!props.name.trim()) {
      throw new Error("API key name is required");
    }

    if (!props.keyPrefix.trim()) {
      throw new Error("API key prefix is required");
    }

    if (!props.keyHash.trim()) {
      throw new Error("API key hash is required");
    }

    if (!props.createdBy.trim()) {
      throw new Error("API key creator is required");
    }

    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.type = props.type;
    this.keyPrefix = props.keyPrefix;
    this.keyHash = props.keyHash;
    this.status = props.status;
    this.createdBy = props.createdBy;
    this.lastUsedAt = props.lastUsedAt;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}