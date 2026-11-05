export interface TextChunkerInput {
  text: string;
  chunkSize?: number;
  chunkOverlap?: number;
}

export interface TextChunkerService {
  chunk(input: TextChunkerInput): string[];
}