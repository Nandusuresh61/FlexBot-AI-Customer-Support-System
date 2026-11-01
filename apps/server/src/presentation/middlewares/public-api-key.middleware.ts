import type { Request, Response, NextFunction } from "express";

import {
  apiKeyRepository,
  organizationRepository,
} from "../../composition/container.js";

import { ApiKeyGenerator } from "../../infrastructure/security/api-key-generator.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { asyncHandler } from "./asyncHandler.js";

import type { ApiKeyAuthenticatedRequest } from "../types/api-key-request.js";

const apiKeyGenerator = new ApiKeyGenerator();

export const publicApiKeyAuthMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const apiKey = req.headers["x-api-key"];

    if (typeof apiKey !== "string" || !apiKey.trim()) {
      ResponseHandler.error(
        res,
        HttpStatusCode.UNAUTHORIZED,
        AppMessage.AUTH_REQUIRED,
      );
      return;
    }

    if (!apiKey.startsWith("fb_pub_")) {
      ResponseHandler.error(
        res,
        HttpStatusCode.UNAUTHORIZED,
        AppMessage.INVALID_API_KEY,
      );
      return;
    }

    const keyHash = apiKeyGenerator.hash(apiKey);
    const storedApiKey =
      await apiKeyRepository.findActivePublicByHash(keyHash);

    if (!storedApiKey) {
      ResponseHandler.error(
        res,
        HttpStatusCode.UNAUTHORIZED,
        AppMessage.INVALID_API_KEY,
      );
      return;
    }

    const organization = await organizationRepository.findById(
      storedApiKey.organizationId,
    );

    if (!organization || organization.status !== "ACTIVE") {
      ResponseHandler.error(
        res,
        HttpStatusCode.FORBIDDEN,
        AppMessage.ORGANIZATION_NOT_ACTIVE,
      );
      return;
    }

    await apiKeyRepository.updateLastUsedAt(storedApiKey.id, new Date());

    (req as ApiKeyAuthenticatedRequest).apiKeyAuth = {
      apiKeyId: storedApiKey.id,
      organizationId: storedApiKey.organizationId,
      type: "PUBLIC",
    };

    next();
  },
);