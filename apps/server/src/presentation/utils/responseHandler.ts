import type { Response } from "express";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
}

export interface SendResponseOptions<T = unknown> {
  statusCode?: number;
  message?: string;
  data?: T;
  errors?: unknown;
}

export class ResponseHandler {
  /**
   * Send a standardized success response.
   */
  static success<T>(
    res: Response,
    statusCode: number = HttpStatusCode.OK,
    message?: string,
    data?: T,
  ): Response {
    const responsePayload: ApiResponse<T> = {
      success: true,
      ...(message !== undefined && message !== null ? { message } : {}),
      ...(data !== undefined ? { data } : {}),
    };

    return res.status(statusCode).json(responsePayload);
  }

  /**
   * Send a standardized error response.
   */
  static error(
    res: Response,
    statusCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR,
    message: string = AppMessage.INTERNAL_SERVER_ERROR,
    errors?: unknown,
  ): Response {
    const responsePayload: ApiResponse = {
      success: false,
      message,
      ...(errors !== undefined ? { errors } : {}),
    };

    return res.status(statusCode).json(responsePayload);
  }
}

export const sendSuccess = ResponseHandler.success;
export const sendError = ResponseHandler.error;

export function sendResponse<T>(
  res: Response,
  options: SendResponseOptions<T>,
): Response {
  const isError =
    options.statusCode !== undefined && options.statusCode >= 400;

  if (isError) {
    return ResponseHandler.error(
      res,
      options.statusCode,
      options.message,
      options.errors,
    );
  }

  return ResponseHandler.success(
    res,
    options.statusCode ?? HttpStatusCode.OK,
    options.message,
    options.data,
  );
}
