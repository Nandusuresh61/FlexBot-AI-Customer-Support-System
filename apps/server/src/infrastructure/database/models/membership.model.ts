import { Schema, model, type InferSchemaType } from "mongoose";

const membershipSchema = new Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      trim: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization ID is required"],
      index: true,
    },
    role: {
      type: String,
      enum: ["ORG_ADMIN", "ORG_MEMBER"],
      default: "ORG_MEMBER",
      required: true,
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
    collection: "memberships",
  },
);

// A user can have only one membership per organization.
membershipSchema.index(
  { userId: 1, organizationId: 1 },
  { unique: true },
);

export type MembershipRecord = InferSchemaType<
  typeof membershipSchema
>;

export const MembershipModel = model(
  "Membership",
  membershipSchema,
);