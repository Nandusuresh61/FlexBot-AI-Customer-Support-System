import type { AIProvider } from "../../application/interfaces/ai-provider.types.js";
import { AppError } from "../../domain/errors/app-error.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { OpenAIProvider } from "./openai.provider.js";
import { AppMessage } from "../../constants/appMessage.js";

export class AIProviderFactory {
  static create(provider: string): AIProvider {
    switch (provider) {
      case "OPENAI": {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
          throw new AppError(
            AppMessage.AI_PROVIDER_NOT_CONFIGURED,
            HttpStatusCode.INTERNAL_SERVER_ERROR,
          );
        }

        return new OpenAIProvider(apiKey);
      }

      default:
        throw new AppError(
          `Unsupported AI provider: ${provider}`,
          HttpStatusCode.BAD_REQUEST,
        );
    }
  }
}