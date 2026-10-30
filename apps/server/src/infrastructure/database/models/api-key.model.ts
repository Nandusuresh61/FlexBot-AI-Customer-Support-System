import { Schema, model, type InferSchemaType } from "mongoose";

const apiKeySchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    type: {
      type: String,
      enum: ["PUBLIC", "SECRET"],
      required: true,
    },

    keyPrefix: {
      type: String,
      required: true,
      index: true,
    },

    keyHash: {
      type: String,
      required: true,
      select: false,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "REVOKED"],
      default: "ACTIVE",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lastUsedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

apiKeySchema.index({ organizationId: 1, createdAt: -1 });

apiKeySchema.index(
  { keyHash: 1 },
  { unique: true },
);

export type ApiKeyDocument = ReturnType<typeof ApiKeyModel.hydrate>;
export const ApiKeyModel = model("ApiKey", apiKeySchema);