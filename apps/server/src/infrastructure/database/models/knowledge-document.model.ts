import { Schema, model, type InferSchemaType } from "mongoose";

const knowledgeDocumentSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    chatbotConfigId: {
      type: Schema.Types.ObjectId,
      ref: "ChatbotConfig",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["UPLOADED", "PROCESSING", "READY", "FAILED"],
      default: "UPLOADED",
      required: true,
    },
    chunkCount: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export type KnowledgeDocumentModelType = InferSchemaType<
  typeof knowledgeDocumentSchema
>;

export const KnowledgeDocumentModel = model(
  "KnowledgeDocument",
  knowledgeDocumentSchema,
);