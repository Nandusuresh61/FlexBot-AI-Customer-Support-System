import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../domain/errors/app-error.js";

export function notFoundMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(
    new AppError(
      `Route not found: ${req.method} ${req.originalUrl}`,
      404,
    ),
  );
}