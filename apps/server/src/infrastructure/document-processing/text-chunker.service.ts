import type {
  TextChunkerInput,
  TextChunkerService,
} from "../../application/services/text-chunker.service.js";

export class DefaultTextChunkerService implements TextChunkerService {
  private readonly DEFAULT_CHUNK_SIZE = 1000;
  private readonly DEFAULT_CHUNK_OVERLAP = 200;

  chunk(input: TextChunkerInput): string[] {
    const text = input.text.trim();

    if (!text) return [];

    const chunkSize = input.chunkSize ?? this.DEFAULT_CHUNK_SIZE;
    const chunkOverlap = input.chunkOverlap ?? this.DEFAULT_CHUNK_OVERLAP;

    if (chunkSize <= 0) {
      throw new Error("Chunk size must be greater than zero.");
    }

    if (chunkOverlap < 0 || chunkOverlap >= chunkSize) {
      throw new Error(
        "Chunk overlap must be non-negative and smaller than chunk size.",
      );
    }

    const chunks: string[] = [];
    const step = chunkSize - chunkOverlap;

    for (let start = 0; start < text.length; start += step) {
      const chunk = text.slice(start, start + chunkSize).trim();

      if (chunk) chunks.push(chunk);
      if (start + chunkSize >= text.length) break;
    }

    return chunks;
  }
}
