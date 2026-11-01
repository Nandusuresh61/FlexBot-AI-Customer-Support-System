import { Schema, model, type InferSchemaType } from "mongoose";

const chatbotConfigSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true,
      index: true,
    },
    chatbotName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    welcomeMessage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    systemPrompt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    provider: {
      type: String,
      enum: ["OPENAI", "ANTHROPIC", "GOOGLE"],
      required: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    temperature: {
      type: Number,
      required: true,
      min: 0,
      max: 2,
      default: 0.3,
    },
    maxOutputTokens: {
      type: Number,
      required: true,
      min: 1,
      default: 500,
    },
    supportedLanguage: {
      type: String,
      required: true,
      trim: true,
      default: "en",
    },
    fallbackMessage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      required: true,
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type ChatbotConfigDocument = InferSchemaType<typeof chatbotConfigSchema>;

export const ChatbotConfigModel = model("ChatbotConfig", chatbotConfigSchema);
