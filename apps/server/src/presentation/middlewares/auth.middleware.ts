import type { Request, Response, NextFunction } from "express";

import { tokenService } from "../../composition/container.js";

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
  };
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const [scheme, token, ...extraParts] = authorization.trim().split(/\s+/);

    if (
      scheme?.toLowerCase() !== "bearer" ||
      !token ||
      extraParts.length > 0
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authorization header",
      });
      return;
    }

    const payload = await tokenService.verifyAccessToken(token);

    (req as AuthenticatedRequest).auth = {
      userId: payload.userId,
    };

    next();
  } catch (error) {
    next(error);
  }
}