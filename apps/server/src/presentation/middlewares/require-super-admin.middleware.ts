import type { Request, Response, NextFunction } from "express";
import { userRepository } from "../../composition/container.js";
import { AppError } from "../../domain/errors/app-error.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";
import { asyncHandler } from "./asyncHandler.js";

export const requireSuperAdmin = asyncHandler(
  async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const userId = (req as AuthenticatedRequest).auth?.userId;

    if (!userId) {
      throw new AppError(
        AppMessage.AUTH_REQUIRED,
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    const user = await userRepository.findById(userId);

    if (!user || user.status !== "ACTIVE") {
      throw new AppError(
        AppMessage.USER_NOT_FOUND_OR_INACTIVE,
        HttpStatusCode.FORBIDDEN,
      );
    }

    if (user.platformRole !== "SUPER_ADMIN") {
      throw new AppError(
        AppMessage.SUPER_ADMIN_REQUIRED,
        HttpStatusCode.FORBIDDEN,
      );
    }

    next();
  },
);
