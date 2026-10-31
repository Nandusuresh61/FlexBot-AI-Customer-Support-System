import type { Request, Response } from "express";
import type {
  CreateChatbotConfigInput,
  UpdateChatbotConfigInput,
} from "../../domain/repositories/chatbot-config.repository.js";
import type { CreateChatbotConfigUseCase } from "../../application/use-cases/chatbot-config/create-chatbot-config.use-case.js";
import type { GetChatbotConfigUseCase } from "../../application/use-cases/chatbot-config/get-chatbot-config.use-case.js";
import type { UpdateChatbotConfigUseCase } from "../../application/use-cases/chatbot-config/update-chatbot-config.use-case.js";
import { AppMessage } from "../../constants/appMessage.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ResponseHandler } from "../utils/responseHandler.js";

export class ChatbotConfigController {
  constructor(
    private readonly _createChatbotConfigUseCase: CreateChatbotConfigUseCase,
    private readonly _getChatbotConfigUseCase: GetChatbotConfigUseCase,
    private readonly _updateChatbotConfigUseCase: UpdateChatbotConfigUseCase,
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

    const config = await this._createChatbotConfigUseCase.execute({
      organizationId,
      ...(req.body as Omit<CreateChatbotConfigInput, "organizationId">),
    });

    return ResponseHandler.success(
      res,
      HttpStatusCode.CREATED,
      AppMessage.CHATBOT_CONFIG_CREATED,
      config,
    );
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.params.organizationId;

    if (typeof organizationId !== "string") {
      return ResponseHandler.error(
        res,
        HttpStatusCode.BAD_REQUEST,
        AppMessage.ORGANIZATION_ID_REQUIRED,
      );
    }

    const config = await this._getChatbotConfigUseCase.execute(organizationId);

    return ResponseHandler.success(
      res,
      HttpStatusCode.OK,
      AppMessage.CHATBOT_CONFIG_RETRIEVED,
      config,
    );
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.params.organizationId;

    if (typeof organizationId !== "string") {
      return ResponseHandler.error(
        res,
        HttpStatusCode.BAD_REQUEST,
        AppMessage.ORGANIZATION_ID_REQUIRED,
      );
    }

    const config = await this._updateChatbotConfigUseCase.execute(
      organizationId,
      req.body as UpdateChatbotConfigInput,
    );

    return ResponseHandler.success(
      res,
      HttpStatusCode.OK,
      AppMessage.CHATBOT_CONFIG_UPDATED,
      config,
    );
  });
}
