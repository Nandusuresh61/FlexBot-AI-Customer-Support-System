import type { KnowledgeDocument } from "../../../domain/entities/knowledge-document.entity.js";
import type { KnowledgeDocumentRepository } from "../../../domain/repositories/knowledge-document.repository.js";
import type { ChatbotConfigRepository } from "../../../domain/repositories/chatbot-config.repository.js";
import { AppError } from "../../../domain/errors/app-error.js";
import { HttpStatusCode } from "../../../constants/httpStatusCode.js";
import { AppMessage } from "../../../constants/appMessage.js";
import { FileStorageService } from "../../../application/services/file-storage.service.js";

interface CreateKnowledgeDocumentInput {
  organizationId: string;
  chatbotConfigId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  buffer: Buffer;
}

export class CreateKnowledgeDocumentUseCase {
  constructor(
    private readonly _knowledgeDocumentRepository: KnowledgeDocumentRepository,
    private readonly _chatbotConfigRepository: ChatbotConfigRepository,
    private readonly _fileStorageService: FileStorageService,
  ) {}

  async execute(
    input: CreateKnowledgeDocumentInput,
  ): Promise<KnowledgeDocument> {
    const {
      organizationId,
      chatbotConfigId,
      fileName,
      mimeType,
      fileSize,
      buffer,
    } = input;

    if (
      !organizationId?.trim() ||
      !chatbotConfigId?.trim() ||
      !fileName?.trim() ||
      !mimeType?.trim() ||
      !Number.isFinite(fileSize) ||
      fileSize <= 0 ||
      !buffer?.length
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

    if (config.status !== "ACTIVE") {
      throw new AppError(
        AppMessage.CHATBOT_CONFIG_INACTIVE,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const { storageKey } = await this._fileStorageService.store({
      buffer,
      mimeType,
      organizationId,
    });

    try {
      return await this._knowledgeDocumentRepository.create({
        organizationId,
        chatbotConfigId,
        fileName: fileName.trim(),
        mimeType,
        fileSize,
        storageKey,
      });
    } catch (error) {
      try {
        await this._fileStorageService.delete(storageKey);
      } catch {
        // Preserve the original database error.
      }

      throw error;
    }
  }
}