import type { RefreshSession } from "../entities/refresh-session.entity.js";

export interface CreateRefreshSessionInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface RefreshSessionRepository {
  create(
    input: CreateRefreshSessionInput,
  ): Promise<RefreshSession>;

  findByTokenHash(
    tokenHash: string,
  ): Promise<RefreshSession | null>;

  revokeById(
    sessionId: string,
    revokedAt: Date,
  ): Promise<void>;

  revokeAllByUserId(
    userId: string,
    revokedAt: Date,
  ): Promise<void>;

  consumeActiveByTokenHash(
  tokenHash: string,
  now: Date,
): Promise<RefreshSession | null>;
}