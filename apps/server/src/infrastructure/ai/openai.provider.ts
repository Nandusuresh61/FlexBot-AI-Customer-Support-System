import OpenAI from "openai";
import type {
  AIProvider,
  GenerateResponseInput,
  GenerateResponseOutput,
} from "../../application/interfaces/ai-provider.types.js";
import { AIProviderError } from "../../domain/errors/ai-provider.error.js";

export class OpenAIProvider implements AIProvider {
  private readonly _client: OpenAI;

  constructor(apiKey: string) {
    this._client = new OpenAI({ apiKey });
  }

  async generateResponse(
    input: GenerateResponseInput,
  ): Promise<GenerateResponseOutput> {
    try {
      const response = await this._client.chat.completions.create({
        model: input.model,
        messages: [
          { role: "system", content: input.systemPrompt },
          { role: "user", content: input.userMessage },
        ],
        temperature: input.temperature,
        max_tokens: input.maxOutputTokens,
      });

      const content = response.choices[0]?.message.content;

      if (!content) {
        throw new AIProviderError(
          "The AI provider returned an empty response",
          "OPENAI",
        );
      }

      return {
        content,
        provider: "OPENAI",
        model: response.model,
        inputTokens: response.usage?.prompt_tokens,
        outputTokens: response.usage?.completion_tokens,
      };
    } catch (error) {
      if (error instanceof AIProviderError) {
        throw error;
      }

      throw new AIProviderError(
        "Failed to generate a response using OpenAI",
        "OPENAI",
        error,
      );
    }
  }
}