import type { KnowledgeDocument } from "../../../domain/entities/knowledge-document.entity.js";
import type { KnowledgeDocumentRepository } from "../../../domain/repositories/knowledge-document.repository.js";
import type { ChatbotConfigRepository } from "../../../domain/repositories/chatbot-config.repository.js";
import { AppError } from "../../../domain/errors/app-error.js";
import { HttpStatusCode } from "../../../constants/httpStatusCode.js";
import { AppMessage } from "../../../constants/appMessage.js";
import type { FileStorageService } from "../../services/file-storage.service.js";
import type { DocumentTextExtractorService } from "../../services/document-text-extractor.service.js";
import type { KnowledgeChunkRepository } from "../../../domain/repositories/knowledge-chunk.repository.js";
import type { TextChunkerService } from "../../services/text-chunker.service.js";

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
    private readonly _documentTextExtractorService: DocumentTextExtractorService,
    private readonly _knowledgeChunkRepository: KnowledgeChunkRepository,
    private readonly _textChunkerService: TextChunkerService,
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

    const extractedText = await this._documentTextExtractorService.extract({
      buffer,
      mimeType,
    });

    const { storageKey } = await this._fileStorageService.store({
      buffer,
      mimeType,
      organizationId,
    });

    try {
      const document = await this._knowledgeDocumentRepository.create({
        organizationId,
        chatbotConfigId,
        fileName,
        mimeType,
        fileSize,
        storageKey,
      });

      const chunkContents = this._textChunkerService.chunk({
        text: extractedText,
      });

      const chunks = chunkContents.map((content, chunkIndex) => ({
        organizationId,
        chatbotConfigId,
        documentId: document.id,
        chunkIndex,
        content,
      }));

      await this._knowledgeChunkRepository.createMany(chunks);

      return document;
    } catch (error) {
      await this._fileStorageService.delete(storageKey);
      throw error;
    }
  }
}
