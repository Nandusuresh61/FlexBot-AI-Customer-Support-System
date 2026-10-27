import { Types } from "mongoose";
import {
  Membership,
  type OrganizationRole,
  type MembershipStatus,
} from "../../../domain/entities/membership.entity.js";

interface MembershipDocument {
  _id: Types.ObjectId;
  userId: string;
  organizationId: Types.ObjectId;
  role: OrganizationRole;
  status: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export function toMembershipEntity(
  document: MembershipDocument,
): Membership {
  return new Membership({
    id: document._id.toString(),
    userId: document.userId,
    organizationId: document.organizationId.toString(),
    role: document.role,
    status: document.status,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  });
}