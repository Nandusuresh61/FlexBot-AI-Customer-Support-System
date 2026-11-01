import type { Request } from "express";

export interface ApiKeyRequestContext {
  apiKeyId: string;
  organizationId: string;
  type: "PUBLIC" | "SECRET";
}

export interface ApiKeyAuthenticatedRequest extends Request {
  apiKeyAuth?: ApiKeyRequestContext;
}