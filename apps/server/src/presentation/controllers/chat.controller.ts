import type { Request, Response } from "express";
import { GenerateChatbotResponseUseCase } from "../../application/use-cases/chatbot/generate-chatbot-response.use-case.js";
import { AppMessage } from "../../constants/appMessage.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ResponseHandler } from "../utils/responseHandler.js";

export class ChatController {
  constructor(
    private readonly _generateChatbotResponseUseCase: GenerateChatbotResponseUseCase,
  ) {}

  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.params.organizationId;

    if (typeof organizationId !== "string") {
      return ResponseHandler.error(
        res,
        HttpStatusCode.BAD_REQUEST,
        AppMessage.ORGANIZATION_ID_REQUIRED,
      );
    }

    const { message } = req.body as { message?: unknown };

    if (typeof message !== "string" || !message.trim()) {
      return ResponseHandler.error(
        res,
        HttpStatusCode.BAD_REQUEST,
        AppMessage.CHAT_MESSAGE_REQUIRED,
      );
    }

    const response = await this._generateChatbotResponseUseCase.execute({
      organizationId,
      message: message.trim(),
    });

    return ResponseHandler.success(
      res,
      HttpStatusCode.OK,
      AppMessage.CHAT_RESPONSE_GENERATED,
      response,
    );
  });
}