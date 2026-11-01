export type ChatbotConfigStatus = "ACTIVE" | "INACTIVE";

export type AIProvider = "OPENAI" | "ANTHROPIC" | "GOOGLE";

export interface ChatbotConfigProps {
  id: string;
  organizationId: string;
  chatbotName: string;
  description: string | null;
  welcomeMessage: string;
  systemPrompt: string;
  provider: AIProvider;
  model: string;
  temperature: number;
  maxOutputTokens: number;
  supportedLanguage: string;
  fallbackMessage: string;
  status: ChatbotConfigStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class ChatbotConfig {
  public readonly id: string;
  public readonly organizationId: string;
  public readonly chatbotName: string;
  public readonly description: string | null;
  public readonly welcomeMessage: string;
  public readonly systemPrompt: string;
  public readonly provider: AIProvider;
  public readonly model: string;
  public readonly temperature: number;
  public readonly maxOutputTokens: number;
  public readonly supportedLanguage: string;
  public readonly fallbackMessage: string;
  public readonly status: ChatbotConfigStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: ChatbotConfigProps) {
    this.validate(props);

    this.id = props.id;
    this.organizationId = props.organizationId;
    this.chatbotName = props.chatbotName;
    this.description = props.description;
    this.welcomeMessage = props.welcomeMessage;
    this.systemPrompt = props.systemPrompt;
    this.provider = props.provider;
    this.model = props.model;
    this.temperature = props.temperature;
    this.maxOutputTokens = props.maxOutputTokens;
    this.supportedLanguage = props.supportedLanguage;
    this.fallbackMessage = props.fallbackMessage;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  private validate(props: ChatbotConfigProps): void {
    if (!props.id.trim()) {
      throw new Error("Chatbot configuration ID is required");
    }

    if (!props.organizationId.trim()) {
      throw new Error("Organization ID is required");
    }

    if (!props.chatbotName.trim()) {
      throw new Error("Chatbot name is required");
    }

    if (!props.welcomeMessage.trim()) {
      throw new Error("Welcome message is required");
    }

    if (!props.systemPrompt.trim()) {
      throw new Error("System prompt is required");
    }

    if (!props.model.trim()) {
      throw new Error("AI model is required");
    }

    if (
      !Number.isFinite(props.temperature) ||
      props.temperature < 0 ||
      props.temperature > 2
    ) {
      throw new Error("Temperature must be between 0 and 2");
    }

    if (
      !Number.isInteger(props.maxOutputTokens) ||
      props.maxOutputTokens <= 0
    ) {
      throw new Error("Maximum output tokens must be a positive integer");
    }

    if (!props.supportedLanguage.trim()) {
      throw new Error("Supported language is required");
    }

    if (!props.fallbackMessage.trim()) {
      throw new Error("Fallback message is required");
    }

    if (!["OPENAI", "ANTHROPIC", "GOOGLE"].includes(props.provider)) {
      throw new Error("Invalid AI provider");
    }

    if (!["ACTIVE", "INACTIVE"].includes(props.status)) {
      throw new Error("Invalid chatbot configuration status");
    }

    if (
      !(props.createdAt instanceof Date) ||
      Number.isNaN(props.createdAt.getTime())
    ) {
      throw new Error("Invalid creation date");
    }

    if (
      !(props.updatedAt instanceof Date) ||
      Number.isNaN(props.updatedAt.getTime())
    ) {
      throw new Error("Invalid update date");
    }
  }
}