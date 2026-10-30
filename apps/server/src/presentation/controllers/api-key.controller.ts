import type { Request, Response } from "express";

import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import { AppError } from "../../domain/errors/app-error.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

import type { CreateApiKeyUseCase } from "../../application/use-cases/create-api-key.use-case.js";
import type { ListApiKeysUseCase } from "../../application/use-cases/list-api-keys.use-case.js";
import type { RevokeApiKeyUseCase } from "../../application/use-cases/revoke-api-key.use-case.js";

export class ApiKeyController {
  constructor(
    private readonly _createApiKeyUseCase: CreateApiKeyUseCase,
    private readonly _listApiKeysUseCase: ListApiKeysUseCase,
    private readonly _revokeApiKeyUseCase: RevokeApiKeyUseCase,
  ) {}

  create = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const organizationId = req.params.organizationId;

      if (typeof organizationId !== "string" || !organizationId.trim()) {
        throw new AppError(
          AppMessage.ORGANIZATION_ID_REQUIRED,
          HttpStatusCode.BAD_REQUEST,
        );
      }
      const userId = req.auth?.userId;

      if (!organizationId || !userId) {
        throw new AppError(
          AppMessage.AUTHENTICATED_USER_REQUIRED,
          HttpStatusCode.UNAUTHORIZED,
        );
      }

      const result = await this._createApiKeyUseCase.execute({
        organizationId,
        createdBy: userId,
        name: req.body.name,
        type: req.body.type,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      });

      ResponseHandler.success(
        res,
        HttpStatusCode.CREATED,
        AppMessage.API_KEY_CREATED,
        {
          ...result.apiKey,
          key: result.plaintextKey,
        },
      );
    },
  );

  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const organizationId = req.params.organizationId;

    if (typeof organizationId !== "string" || !organizationId.trim()) {
      throw new AppError(
        AppMessage.ORGANIZATION_ID_REQUIRED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (!organizationId) {
      throw new AppError(
        AppMessage.ORGANIZATION_ID_REQUIRED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const apiKeys = await this._listApiKeysUseCase.execute(organizationId);

    ResponseHandler.success(
      res,
      HttpStatusCode.OK,
      AppMessage.API_KEYS_RETRIEVED,
      apiKeys,
    );
  });

  revoke = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { organizationId, apiKeyId } = req.params;

    if (
      typeof organizationId !== "string" ||
      !organizationId.trim() ||
      typeof apiKeyId !== "string" ||
      !apiKeyId.trim()
    ) {
      throw new AppError(
        AppMessage.ORGANIZATION_ID_REQUIRED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const apiKey = await this._revokeApiKeyUseCase.execute({
      organizationId,
      apiKeyId,
    });

    ResponseHandler.success(
      res,
      HttpStatusCode.OK,
      AppMessage.API_KEY_REVOKED,
      apiKey,
    );
  });
}
