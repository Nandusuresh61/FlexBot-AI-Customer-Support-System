import type { Request, Response, NextFunction } from "express";
import { tokenService } from "../../composition/container.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { asyncHandler } from "./asyncHandler.js";

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
  };
}

export const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authorization = req.headers.authorization;

    if (!authorization) {
      ResponseHandler.error(
        res,
        HttpStatusCode.UNAUTHORIZED,
        AppMessage.AUTH_REQUIRED,
      );
      return;
    }

    const [scheme, token, ...extraParts] = authorization.trim().split(/\s+/);

    if (
      scheme?.toLowerCase() !== "bearer" ||
      !token ||
      extraParts.length > 0
    ) {
      ResponseHandler.error(
        res,
        HttpStatusCode.UNAUTHORIZED,
        AppMessage.INVALID_AUTH_HEADER,
      );
      return;
    }

    const payload = await tokenService.verifyAccessToken(token);

    (req as AuthenticatedRequest).auth = {
      userId: payload.userId,
    };

    next();
  },
);