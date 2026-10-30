import type { Response } from "express";

import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

import type { ApiKeyAuthenticatedRequest } from "../types/api-key-request.js";

export class ExternalController {
  identity = asyncHandler(
    async (
      req: ApiKeyAuthenticatedRequest,
      res: Response,
    ): Promise<void> => {
      const apiKeyAuth = req.apiKeyAuth;

      if (!apiKeyAuth) {
        ResponseHandler.error(
          res,
          HttpStatusCode.UNAUTHORIZED,
          AppMessage.INVALID_API_KEY,
        );
        return;
      }

      ResponseHandler.success(
        res,
        HttpStatusCode.OK,
        AppMessage.API_KEY_AUTH_SUCCESS,
        {
          organizationId: apiKeyAuth.organizationId,
          apiKeyId: apiKeyAuth.apiKeyId,
          type: apiKeyAuth.type,
        },
      );
    },
  );
}