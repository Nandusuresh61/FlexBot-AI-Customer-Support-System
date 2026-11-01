export type AIMessageRole = "USER" | "ASSISTANT";

export interface AIConversationMessage {
  role: AIMessageRole;
  content: string;
}

export interface GenerateResponseInput {
  systemPrompt: string;
  messages: AIConversationMessage[];
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