import type { KnowledgeDocument } from "../../../domain/entities/knowledge-document.entity.js";
import type { KnowledgeDocumentRepository } from "../../../domain/repositories/knowledge-document.repository.js";
import type { ChatbotConfigRepository } from "../../../domain/repositories/chatbot-config.repository.js";
import { AppError } from "../../../domain/errors/app-error.js";
import { HttpStatusCode } from "../../../constants/httpStatusCode.js";
import { AppMessage } from "../../../constants/appMessage.js";

interface CreateKnowledgeDocumentInput {
  organizationId: string;
  chatbotConfigId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export class CreateKnowledgeDocumentUseCase {
  constructor(
    private readonly _knowledgeDocumentRepository: KnowledgeDocumentRepository,
    private readonly _chatbotConfigRepository: ChatbotConfigRepository,
  ) {}

  async execute(
    input: CreateKnowledgeDocumentInput,
  ): Promise<KnowledgeDocument> {
    const { organizationId, chatbotConfigId, fileName, mimeType, fileSize } =
      input;

    if (
      !organizationId?.trim() ||
      !chatbotConfigId?.trim() ||
      !fileName?.trim() ||
      !mimeType?.trim() ||
      !Number.isFinite(fileSize) ||
      fileSize <= 0
    ) {
      throw new AppError(AppMessage.INVALID_INPUT, HttpStatusCode.BAD_REQUEST);
    }

    const config =
      await this._chatbotConfigRepository.findByOrganizationId(organizationId);

    if (!config || config.id !== chatbotConfigId) {
      throw new AppError(
        AppMessage.CHATBOT_CONFIG_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    return this._knowledgeDocumentRepository.create({
      organizationId,
      chatbotConfigId,
      fileName: fileName.trim(),
      mimeType,
      fileSize,
    });
  }
}
