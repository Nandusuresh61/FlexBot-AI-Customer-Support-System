import { Types } from "mongoose";

import {
  User,
  type UserStatus,
  type PlatformRole,
} from "../../../domain/entities/user.entity.js";

interface UserDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  platformRole: PlatformRole;
  createdAt: Date;
  updatedAt: Date;
}

export function toUserEntity(document: UserDocument): User {
  return new User({
    id: document._id.toString(),
    name: document.name,
    email: document.email,
    passwordHash: document.passwordHash,
    platformRole: document.platformRole,
    status: document.status,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  });
}