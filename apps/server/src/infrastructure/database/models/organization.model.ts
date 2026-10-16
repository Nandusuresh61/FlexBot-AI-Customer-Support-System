import { Schema, model, type InferSchemaType } from "mongoose";

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      maxlength: [100, "Organization name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Organization slug is required"],
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: [100, "Organization slug cannot exceed 100 characters"],
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain lowercase letters, numbers, and single hyphens",
      ],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "organizations",
  },
);

export type OrganizationRecord = InferSchemaType<
  typeof organizationSchema
>;

export const OrganizationModel = model(
  "Organization",
  organizationSchema,
);