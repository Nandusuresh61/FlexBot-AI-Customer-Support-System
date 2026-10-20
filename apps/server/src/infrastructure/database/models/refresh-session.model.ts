import { Schema, model } from "mongoose";

const refreshSessionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "refresh_sessions",
  },
);

export const RefreshSessionModel = model(
  "RefreshSession",
  refreshSessionSchema,
);