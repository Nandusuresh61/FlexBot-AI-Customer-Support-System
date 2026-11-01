import type { Response } from "express";
import type { ApiKeyAuthenticatedRequest } from "../types/api-key-request.js";
import { CreateWidgetConversationUseCase } from "../../application/use-cases/widget/create-widget-conversation.use-case.js";
import { SendWidgetMessageUseCase } from "../../application/use-cases/widget/send-widget-message.use-case.js";
import { AppMessage } from "../../constants/appMessage.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { GetWidgetConversationMessagesUseCase } from "../../application/use-cases/widget/get-widget-conversation-message.use-case.js";

export class WidgetController {
  constructor(
    private readonly _createWidgetConversationUseCase: CreateWidgetConversationUseCase,
    private readonly _sendWidgetMessageUseCase: SendWidgetMessageUseCase,
    private readonly _getWidgetConversationMessagesUseCase: GetWidgetConversationMessagesUseCase,
  ) {}

  createConversation = asyncHandler(
    async (req: ApiKeyAuthenticatedRequest, res: Response) => {
      const apiKeyAuth = req.apiKeyAuth;

      if (!apiKeyAuth || apiKeyAuth.type !== "PUBLIC") {
        return ResponseHandler.error(
          res,
          HttpStatusCode.UNAUTHORIZED,
          AppMessage.INVALID_API_KEY,
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

      const conversation = await this._createWidgetConversationUseCase.execute({
        organizationId: apiKeyAuth.organizationId,
        visitorId: visitorId.trim(),
      });

      return ResponseHandler.success(
        res,
        HttpStatusCode.CREATED,
        AppMessage.CONVERSATION_CREATED,
        conversation,
      );
    },
  );

  sendMessage = asyncHandler(
    async (req: ApiKeyAuthenticatedRequest, res: Response) => {
      const { conversationId } = req.params;
      const apiKeyAuth = req.apiKeyAuth;

      if (
        !apiKeyAuth ||
        apiKeyAuth.type !== "PUBLIC" ||
        typeof conversationId !== "string"
      ) {
        return ResponseHandler.error(
          res,
          HttpStatusCode.BAD_REQUEST,
          AppMessage.INVALID_REQUEST_PARAMETERS,
        );
      }

      const { visitorId, message } = req.body as {
        visitorId?: unknown;
        message?: unknown;
      };

      if (typeof visitorId !== "string" || !visitorId.trim()) {
        return ResponseHandler.error(
          res,
          HttpStatusCode.BAD_REQUEST,
          AppMessage.VISITOR_ID_REQUIRED,
        );
      }

      if (typeof message !== "string" || !message.trim()) {
        return ResponseHandler.error(
          res,
          HttpStatusCode.BAD_REQUEST,
          AppMessage.CHAT_MESSAGE_REQUIRED,
        );
      }

      const result = await this._sendWidgetMessageUseCase.execute({
        organizationId: apiKeyAuth.organizationId,
        conversationId,
        visitorId: visitorId.trim(),
        message: message.trim(),
      });

      return ResponseHandler.success(
        res,
        HttpStatusCode.OK,
        AppMessage.CONVERSATION_MESSAGE_SAVED,
        result,
      );
    },
  );

  getMessages = asyncHandler(
    async (req: ApiKeyAuthenticatedRequest, res: Response) => {
      const { conversationId } = req.params;
      const apiKeyAuth = req.apiKeyAuth;

      if (
        !apiKeyAuth ||
        apiKeyAuth.type !== "PUBLIC" ||
        typeof conversationId !== "string"
      ) {
        return ResponseHandler.error(
          res,
          HttpStatusCode.BAD_REQUEST,
          AppMessage.INVALID_REQUEST_PARAMETERS,
        );
      }

      const visitorId = req.query.visitorId;
      const rawLimit = req.query.limit;

      if (typeof visitorId !== "string" || !visitorId.trim()) {
        return ResponseHandler.error(
          res,
          HttpStatusCode.BAD_REQUEST,
          AppMessage.VISITOR_ID_REQUIRED,
        );
      }

      let limit: number | undefined;

      if (rawLimit !== undefined) {
        if (typeof rawLimit !== "string" || !/^\d+$/.test(rawLimit)) {
          return ResponseHandler.error(
            res,
            HttpStatusCode.BAD_REQUEST,
            AppMessage.INVALID_REQUEST_PARAMETERS,
          );
        }

        limit = Number(rawLimit);
      }

      const messages = await this._getWidgetConversationMessagesUseCase.execute(
        {
          organizationId: apiKeyAuth.organizationId,
          conversationId,
          visitorId: visitorId.trim(),
          limit,
        },
      );

      return ResponseHandler.success(
        res,
        HttpStatusCode.OK,
        AppMessage.CONVERSATION_MESSAGES_FETCHED,
        messages,
      );
    },
  );
}
