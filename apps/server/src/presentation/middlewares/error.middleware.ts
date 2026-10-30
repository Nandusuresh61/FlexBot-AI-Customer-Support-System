import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { ZodError } from "zod";
import { AppError } from "../../domain/errors/app-error.js";
import { env } from "../../config/env.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import { ResponseHandler } from "../utils/responseHandler.js";

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof ZodError) {
    ResponseHandler.error(
      res,
      HttpStatusCode.BAD_REQUEST,
      AppMessage.VALIDATION_FAILED,
      error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
    return;
  }

  if (error instanceof AppError) {
    ResponseHandler.error(res, error.statusCode, error.message);
    return;
  }

  console.error("Unexpected application error:", error);

  ResponseHandler.error(
    res,
    HttpStatusCode.INTERNAL_SERVER_ERROR,
    env.NODE_ENV === "production"
      ? AppMessage.INTERNAL_SERVER_ERROR
      : error instanceof Error
        ? error.message
        : AppMessage.UNEXPECTED_ERROR,
  );
};