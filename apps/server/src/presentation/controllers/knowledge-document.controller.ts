import type { Request, Response } from "express";
import { CreateKnowledgeDocumentUseCase } from "../../application/use-cases/knowledge-document/create-knowledge-document.use-case.js";
import { AppMessage } from "../../constants/appMessage.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ResponseHandler } from "../utils/responseHandler.js";

export class KnowledgeDocumentController {
  constructor(
    private readonly _createKnowledgeDocument: CreateKnowledgeDocumentUseCase,
  ) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.params;
    const { chatbotConfigId } = req.body;
    const file = req.file;

    if (typeof organizationId !== "string") {
      return ResponseHandler.error(
        res,
        HttpStatusCode.BAD_REQUEST,
        AppMessage.ORGANIZATION_ID_REQUIRED,
      );
    }

    if (!file) {
      return ResponseHandler.error(
        res,
        HttpStatusCode.BAD_REQUEST,
        "A file is required.",
      );
    }

    if (
      typeof chatbotConfigId !== "string" ||
      !chatbotConfigId.trim()
    ) {
      return ResponseHandler.error(
        res,
        HttpStatusCode.BAD_REQUEST,
        "A chatbotConfigId is required.",
      );
    }

    const document = await this._createKnowledgeDocument.execute({
      organizationId,
      chatbotConfigId: chatbotConfigId.trim(),
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    });

    return ResponseHandler.success(
      res,
      HttpStatusCode.CREATED,
      AppMessage.KNOWLEDGE_DOCUMENT_CREATED,
      document,
    );
  });
}