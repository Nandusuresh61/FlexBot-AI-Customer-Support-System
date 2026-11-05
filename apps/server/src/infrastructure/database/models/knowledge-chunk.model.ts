import { Schema, model, type InferSchemaType } from "mongoose";

const knowledgeChunkSchema = new Schema(
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
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "KnowledgeDocument",
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

knowledgeChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });

export type KnowledgeChunkDocument = InferSchemaType<
  typeof knowledgeChunkSchema
>;

export const KnowledgeChunkModel = model(
  "KnowledgeChunk",
  knowledgeChunkSchema,
);
