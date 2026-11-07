import { PDFParse } from "pdf-parse";
import type {
  DocumentTextExtractorService,
  ExtractDocumentTextInput,
} from "../../application/services/document-text-extractor.service.js";
import { AppError } from "../../domain/errors/app-error.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";

export class DefaultDocumentTextExtractorService implements DocumentTextExtractorService {
  async extract(input: ExtractDocumentTextInput): Promise<string> {
    let text: string;

    if (input.mimeType === "application/pdf") {
      const parser = new PDFParse({ data: input.buffer });

      try {
        const parsed = await parser.getText();
        text = parsed.text;
      } finally {
        await parser.destroy();
      }
    } else if (
      input.mimeType === "text/plain" ||
      input.mimeType === "text/markdown"
    ) {
      text = input.buffer.toString("utf-8");
    } else {
      throw new AppError(AppMessage.INVALID_INPUT, HttpStatusCode.BAD_REQUEST);
    }

    const normalizedText = text.replace(/\s+/g, " ").trim();

    if (!normalizedText) {
      throw new AppError(AppMessage.INVALID_INPUT, HttpStatusCode.BAD_REQUEST);
    }

    return normalizedText;
  }
}
