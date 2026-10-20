

import { RefreshSession } from "../../../domain/entities/refresh-session.entity.js";

import { AppError } from "../../../domain/errors/app-error.js";

import { RefreshSessionModel } from "../models/refresh-session.model.js";

import { RefreshSessionMapper } from "../mappers/refresh-session.mapper.js";
import { CreateRefreshSessionInput, RefreshSessionRepository } from "../../../domain/repositories/refresh-session.repository.js";

export class MongoRefreshSessionRepository
  implements RefreshSessionRepository
{
  async create(
    input: CreateRefreshSessionInput,
  ): Promise<RefreshSession> {
    const document = await RefreshSessionModel.create({
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      revokedAt: null,
    });

    return RefreshSessionMapper.toDomain({
      _id: document._id,
      userId: document.userId,
      tokenHash: input.tokenHash,
      expiresAt: document.expiresAt,
      revokedAt: document.revokedAt ?? null,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<RefreshSession | null> {
    const document = await RefreshSessionModel.findOne({
      tokenHash,
    })
      .select("+tokenHash")
      .exec();

    if (!document) {
      return null;
    }

    return RefreshSessionMapper.toDomain({
      _id: document._id,
      userId: document.userId,
      tokenHash: document.tokenHash,
      expiresAt: document.expiresAt,
      revokedAt: document.revokedAt ?? null,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  async revokeById(
    sessionId: string,
    revokedAt: Date,
  ): Promise<void> {
    await RefreshSessionModel.updateOne(
      {
        _id: sessionId,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt,
        },
      },
    ).exec();
  }

  async revokeAllByUserId(
    userId: string,
    revokedAt: Date,
  ): Promise<void> {
    await RefreshSessionModel.updateMany(
      {
        userId,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt,
        },
      },
    ).exec();
  }

  async consumeActiveByTokenHash(
  tokenHash: string,
  now: Date,
): Promise<RefreshSession | null> {
  const document = await RefreshSessionModel.findOneAndUpdate(
    {
      tokenHash,
      revokedAt: null,
      expiresAt: { $gt: now },
    },
    {
      $set: {
        revokedAt: now,
      },
    },
    {
      new: true,
    },
  )
    .select("+tokenHash")
    .exec();

  if (!document) {
    return null;
  }

  return RefreshSessionMapper.toDomain({
    _id: document._id,
    userId: document.userId,
    tokenHash: document.tokenHash,
    expiresAt: document.expiresAt,
    revokedAt: document.revokedAt ?? null,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  });
}
}