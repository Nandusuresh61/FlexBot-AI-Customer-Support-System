import type { Request, Response, NextFunction } from "express";
import { userRepository } from "../../composition/container.js";
import { AppError } from "../../domain/errors/app-error.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";

export async function requireSuperAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).auth?.userId;

    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const user = await userRepository.findById(userId);

    if (!user || user.status !== "ACTIVE") {
      throw new AppError("User not found or inactive", 403);
    }

    if (user.platformRole !== "SUPER_ADMIN") {
      throw new AppError("Super Admin access required", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
}

