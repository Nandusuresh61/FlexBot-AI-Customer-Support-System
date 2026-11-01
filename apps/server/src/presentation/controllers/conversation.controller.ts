import type { Request, Response } from "express";
import { CreateConversationUseCase } from "../../application/use-cases/conversation/create-conversation.use-case.js";
import { SendConversationMessageUseCase } from "../../application/use-cases/conversation/send-conversation-message.use-case.js";
import { AppMessage } from "../../constants/appMessage.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { GetConversationMessagesUseCase } from "../../application/use-cases/conversation/get-conversation-message.use-case.js";

export class ConversationController {
  constructor(
    private readonly _createConversationUseCase: CreateConversationUseCase,
    private readonly _sendConversationMessageUseCase: SendConversationMessageUseCase,
    private readonly _getConversationMessagesUseCase: GetConversationMessagesUseCase,
  ) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.params.organizationId;

    if (typeof organizationId !== "string") {
      return ResponseHandler.error(
        res,
        HttpStatusCode.BAD_REQUEST,
        AppMessage.ORGANIZATION_ID_REQUIRED,
      );
    }

    const { visitorId } = req.body as { visitorId?: unknown };

    if (typeof visitorId !== "string" || !visitorId.trim()) {
      return ResponseHandler.error(
        res,
        HttpStatusCode.BAD_REQUEST,
        AppMessage.VISITOR_ID_REQUIRED,
      );
    }

    const conversation = await this._createConversationUseCase.execute({
      organizationId,
      visitorId: visitorId.trim(),
    });

    return ResponseHandler.success(
      res,
      HttpStatusCode.CREATED,
      AppMessage.CONVERSATION_CREATED,
      conversation,
    );
  });

  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId, conversationId } = req.params;

    if (
      typeof organizationId !== "string" ||
      typeof conversationId !== "string"
    ) {
      return ResponseHandler.error(
        res,
        HttpStatusCode.BAD_REQUEST,
        AppMessage.INVALID_REQUEST_PARAMETERS,
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

    const result = await this._sendConversationMessageUseCase.execute({
      organizationId,
      conversationId,
      message: message.trim(),
    });

    return ResponseHandler.success(
      res,
      HttpStatusCode.OK,
      AppMessage.CONVERSATION_MESSAGE_SAVED,
      result,
    );
  });
  getMessages = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId, conversationId } = req.params;

    if (
      typeof organizationId !== "string" ||
      typeof conversationId !== "string"
    ) {
      return ResponseHandler.error(
        res,
        HttpStatusCode.BAD_REQUEST,
        AppMessage.INVALID_REQUEST_PARAMETERS,
      );
    }

    const rawLimit = req.query.limit;
    let limit: number | undefined;

    if (rawLimit !== undefined) {
      limit = Number(rawLimit);

      if (!Number.isInteger(limit) || limit < 1) {
        return ResponseHandler.error(
          res,
          HttpStatusCode.BAD_REQUEST,
          AppMessage.INVALID_REQUEST_PARAMETERS,
        );
      }
    }

    const messages = await this._getConversationMessagesUseCase.execute({
      organizationId,
      conversationId,
      limit,
    });

    return ResponseHandler.success(
      res,
      HttpStatusCode.OK,
      AppMessage.CONVERSATION_MESSAGES_RETRIEVED,
      messages,
    );
  });
}
