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

    let storageKey: string | null = null;
    let document: KnowledgeDocument | null = null;

    try {
      // 1. Store original document in S3
      const storedFile = await this._fileStorageService.store({
        buffer,
        mimeType,
        organizationId,
      });

      storageKey = storedFile.storageKey;

      // 2. Create document with PROCESSING status
      document = await this._knowledgeDocumentRepository.create(
        {
          organizationId,
          chatbotConfigId,
          fileName,
          mimeType,
          fileSize,
          storageKey,
        },
        undefined,
        "PROCESSING",
        0,
      );

      // 3. Extract text
      const extractedText = await this._documentTextExtractorService.extract({
        buffer,
        mimeType,
      });

      // 4. Split text into chunks
      const chunkContents = this._textChunkerService.chunk({
        text: extractedText,
      });

      if (chunkContents.length === 0) {
        throw new AppError(
          AppMessage.INVALID_INPUT,
          HttpStatusCode.BAD_REQUEST,
        );
      }

      // 5. Prepare chunks
      const chunks = chunkContents.map((content, chunkIndex) => ({
        organizationId,
        chatbotConfigId,
        documentId: document!.id,
        chunkIndex,
        content,
      }));

      // 6. Persist chunks
      await this._knowledgeChunkRepository.createMany(chunks);

      // 7. Mark document as READY
      const updatedDocument =
        await this._knowledgeDocumentRepository.updateStatus(
          document.id,
          organizationId,
          "READY",
          chunks.length,
        );

      if (!updatedDocument) {
        throw new Error("Failed to update knowledge document status.");
      }

      return updatedDocument;
    } catch (error) {
      // Cleanup partially created chunks
      if (document) {
        try {
          await this._knowledgeChunkRepository.deleteByDocumentId(
            document.id,
            organizationId,
          );
        } catch {
          // Preserve original processing error
        }
      }

      // Cleanup original file
      if (storageKey) {
        try {
          await this._fileStorageService.delete(storageKey);
        } catch {
          // Preserve original processing error
        }
      }

      // Mark document as FAILED
      if (document) {
        try {
          await this._knowledgeDocumentRepository.updateStatus(
            document.id,
            organizationId,
            "FAILED",
            0,
          );
        } catch {
          // Preserve original processing error
        }
      }

      throw error;
    }
  }
}
