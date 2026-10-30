import {
  ApiKey,
  type ApiKeyProps,
} from "../../../domain/entities/api-key.entity.js";

import type { ApiKeySummary } from "../../../domain/repositories/api-key.repository.js";
import type { ApiKeyDocument } from "../models/api-key.model.js";

// Maps a complete MongoDB document to the domain entity.
export function toApiKeyEntity(document: ApiKeyDocument): ApiKey {
  const props: ApiKeyProps = {
    id: document._id.toString(),
    organizationId: document.organizationId.toString(),
    name: document.name,
    type: document.type,
    keyPrefix: document.keyPrefix,
    keyHash: document.keyHash,
    status: document.status,
    createdBy: document.createdBy.toString(),
    lastUsedAt: document.lastUsedAt ?? null,
    expiresAt: document.expiresAt ?? null,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };

  return new ApiKey(props);
}

// Maps a MongoDB document to a safe API key representation.
export function toApiKeySummary(
  document: ApiKeyDocument,
): ApiKeySummary {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toString(),
    name: document.name,
    type: document.type,
    keyPrefix: document.keyPrefix,
    status: document.status,
    createdBy: document.createdBy.toString(),
    lastUsedAt: document.lastUsedAt ?? null,
    expiresAt: document.expiresAt ?? null,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}