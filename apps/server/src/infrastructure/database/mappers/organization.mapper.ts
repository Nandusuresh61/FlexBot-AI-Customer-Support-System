import { Types } from "mongoose";
import {
  Organization,
  type OrganizationStatus,
} from "../../../domain/entities/organization.entity.js";

interface OrganizationDocument {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  status: OrganizationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export function toOrganizationEntity(
  document: OrganizationDocument,
): Organization {
  return new Organization({
    id: document._id.toString(),
    name: document.name,
    slug: document.slug,
    status: document.status,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  });
}