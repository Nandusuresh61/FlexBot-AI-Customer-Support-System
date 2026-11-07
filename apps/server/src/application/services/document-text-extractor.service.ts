export interface ExtractDocumentTextInput {
  buffer: Buffer;
  mimeType: string;
}

export interface DocumentTextExtractorService {
  extract(input: ExtractDocumentTextInput): Promise<string>;
}