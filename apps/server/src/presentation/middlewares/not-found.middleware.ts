import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../domain/errors/app-error.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";

export function notFoundMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(
    new AppError(
      AppMessage.ROUTE_NOT_FOUND(req.method, req.originalUrl),
      HttpStatusCode.NOT_FOUND,
    ),
  );
}