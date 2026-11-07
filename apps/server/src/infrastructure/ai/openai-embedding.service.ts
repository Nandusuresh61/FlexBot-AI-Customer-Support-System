import OpenAI from "openai";
import { EmbeddingService } from "../../application/services/embedding.service";

export class OpenAIEmbeddingService implements EmbeddingService {
  private readonly _client: OpenAI;
  private readonly _model = "text-embedding-3-small";

  constructor(apiKey: string) {
    this._client = new OpenAI({
      apiKey,
    });
  }

  async embedText(text: string): Promise<number[]> {
    const normalizedText = text.trim();

    if (!normalizedText) {
      throw new Error("Text cannot be empty.");
    }

    const response = await this._client.embeddings.create({
      model: this._model,
      input: normalizedText,
    });

    const embedding = response.data[0]?.embedding;

    if (!embedding) {
      throw new Error("OpenAI returned an empty embedding response.");
    }

    return embedding;
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    const normalizedTexts = texts.map((text) => text.trim());

    if (normalizedTexts.length === 0 || normalizedTexts.some((text) => !text)) {
      throw new Error("Texts must contain non-empty values.");
    }

    const response = await this._client.embeddings.create({
      model: this._model,
      input: normalizedTexts,
    });

    return response.data.map((item) => item.embedding);
  }
}
