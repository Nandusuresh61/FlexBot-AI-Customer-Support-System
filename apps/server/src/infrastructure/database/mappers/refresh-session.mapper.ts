import { RefreshSession } from "../../../domain/entities/refresh-session.entity.js";

interface RefreshSessionDocument {
  _id: {
    toString(): string;
  };
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class RefreshSessionMapper {
  static toDomain(
    document: RefreshSessionDocument,
  ): RefreshSession {
    return new RefreshSession({
      id: document._id.toString(),
      userId: document.userId,
      tokenHash: document.tokenHash,
      expiresAt: document.expiresAt,
      revokedAt: document.revokedAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }
}