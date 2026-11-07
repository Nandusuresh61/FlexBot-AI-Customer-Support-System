export interface EmbeddingService {
  embedText(text: string): Promise<number[]>;

  embedTexts(texts: string[]): Promise<number[][]>;
}