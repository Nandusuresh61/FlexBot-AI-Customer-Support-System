import { InferSchemaType, model, Schema } from "mongoose";

const conversationMessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    role: {
      type: String,
      enum: ["USER", "ASSISTANT"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      default: null,
    },
    model: {
      type: String,
      default: null,
    },
    inputTokens: {
      type: Number,
      min: 0,
      default: null,
    },
    outputTokens: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

conversationMessageSchema.index({
  organizationId: 1,
  conversationId: 1,
  createdAt: 1,
});

export type ConversationMessageDocument = InferSchemaType<
  typeof conversationMessageSchema
>;

export const ConversationMessageModel = model(
  "ConversationMessage",
  conversationMessageSchema,
);