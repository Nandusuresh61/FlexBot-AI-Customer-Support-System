import { InferSchemaType, model, Schema } from "mongoose";

const conversationSchema = new Schema(
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
    },
    visitorId: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "CLOSED"],
      default: "ACTIVE",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

conversationSchema.index({
  organizationId: 1,
  visitorId: 1,
  status: 1,
});

export type ConversationDocument = InferSchemaType<
  typeof conversationSchema
>;

export const ConversationModel = model(
  "Conversation",
  conversationSchema,
);