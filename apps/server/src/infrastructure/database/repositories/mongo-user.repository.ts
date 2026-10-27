import type {
  UserRepository,
  CreateUserInput,
} from "../../../domain/repositories/user.repository.ts";

import type { User } from "../../../domain/entities/user.entity.js";
import { AppError } from "../../../domain/errors/app-error.js";

import { UserModel } from "../models/user.model.js";
import { toUserEntity } from "../mappers/user.mapper.js";
import { toObjectId } from "../mongodb-id.js";

export class MongoUserRepository implements UserRepository {
  async create(input: CreateUserInput): Promise<User> {
    try {
      const document = await UserModel.create({
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        passwordHash: input.passwordHash,
        platformRole: input.platformRole,
      });

      // Password hash is explicitly selected below when needed.
      // Newly created documents include their supplied passwordHash.
      return toUserEntity(document);
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        throw new AppError("An account with this email already exists", 409);
      }

      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    const objectId = toObjectId(id);

    const document = await UserModel.findById(objectId).select("+passwordHash");

    return document ? toUserEntity(document) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();

    const document = await UserModel.findOne({
      email: normalizedEmail,
    }).select("+passwordHash");

    return document ? toUserEntity(document) : null;
  }
}
