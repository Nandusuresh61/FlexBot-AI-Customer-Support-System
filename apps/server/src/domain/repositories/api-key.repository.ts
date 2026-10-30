import type { ApiKey } from "../entities/api-key.entity.js";

export interface CreateApiKeyInput {
  organizationId: string;
  name: string;
  type: "PUBLIC" | "SECRET";
  keyPrefix: string;
  keyHash: string;
  createdBy: string;
  expiresAt: Date | null;
}

export interface ApiKeyRepository {
  create(input: CreateApiKeyInput): Promise<ApiKey>;

  findById(id: string): Promise<ApiKey | null>;

  findByIdAndOrganization(
    id: string,
    organizationId: string,
  ): Promise<ApiKey | null>;

  findAllByOrganization(organizationId: string): Promise<ApiKeySummary[]>;

  revokeByIdAndOrganization(
    id: string,
    organizationId: string,
  ): Promise<ApiKey | null>;

  findActiveSecretByHash(keyHash: string): Promise<ApiKey | null>;

  updateLastUsedAt(id: string, usedAt: Date): Promise<void>;
}

export interface ApiKeySummary {
  id: string;
  organizationId: string;
  name: string;
  type: "PUBLIC" | "SECRET";
  keyPrefix: string;
  status: "ACTIVE" | "REVOKED";
  createdBy: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
