export interface GenerateResponseInput {
  systemPrompt: string;
  userMessage: string;
  model: string;
  temperature: number;
  maxOutputTokens: number;
}

export interface GenerateResponseOutput {
  content: string;
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface AIProvider {
  generateResponse(
    input: GenerateResponseInput,
  ): Promise<GenerateResponseOutput>;
}
