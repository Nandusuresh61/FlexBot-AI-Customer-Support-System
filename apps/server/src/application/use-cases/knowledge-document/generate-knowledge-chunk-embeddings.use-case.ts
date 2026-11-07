import type { KnowledgeChunkRepository } from "../../../domain/repositories/knowledge-chunk.repository.js";
import type { EmbeddingService } from "../../services/embedding.service.js";
import { AppError } from "../../../domain/errors/app-error.js";
import { AppMessage } from "../../../constants/appMessage.js";
import { HttpStatusCode } from "../../../constants/httpStatusCode.js";

interface GenerateKnowledgeChunkEmbeddingsInput {
  documentId: string;
  organizationId: string;
}

export interface KnowledgeChunkEmbedding {
  chunkId: string;
  documentId: string;
  organizationId: string;
  chatbotConfigId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
}

export class GenerateKnowledgeChunkEmbeddingsUseCase {
  constructor(
    private readonly _knowledgeChunkRepository: KnowledgeChunkRepository,
    private readonly _embeddingService: EmbeddingService,
  ) {}

  async execute(
    input: GenerateKnowledgeChunkEmbeddingsInput,
  ): Promise<KnowledgeChunkEmbedding[]> {
    const { documentId, organizationId } = input;

    if (!documentId?.trim() || !organizationId?.trim()) {
      throw new AppError(
        AppMessage.INVALID_INPUT,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const chunks =
      await this._knowledgeChunkRepository.listByDocumentId(
        documentId,
        organizationId,
      );

    if (chunks.length === 0) {
      throw new AppError(
        AppMessage.INVALID_INPUT,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const embeddings = await this._embeddingService.embedTexts(
      chunks.map((chunk) => chunk.content),
    );

    if (embeddings.length !== chunks.length) {
      throw new Error(
        "Embedding count does not match knowledge chunk count.",
      );
    }

    return chunks.map((chunk, index) => {
      const embedding = embeddings[index];

      if (!embedding) {
        throw new Error(
          `Missing embedding for chunk ${chunk.id}.`,
        );
      }

      return {
        chunkId: chunk.id,
        documentId: chunk.documentId,
        organizationId: chunk.organizationId,
        chatbotConfigId: chunk.chatbotConfigId,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        embedding,
      };
    });
  }
}