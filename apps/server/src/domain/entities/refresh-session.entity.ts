export type RefreshSessionStatus = "ACTIVE" | "REVOKED";

export interface RefreshSessionProps {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class RefreshSession {
  public readonly id: string;
  public readonly userId: string;
  public readonly tokenHash: string;
  public readonly expiresAt: Date;
  public readonly revokedAt: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: RefreshSessionProps) {
    if (!props.id.trim()) {
      throw new Error("Refresh session ID is required");
    }

    if (!props.userId.trim()) {
      throw new Error("Refresh session user ID is required");
    }

    if (!props.tokenHash.trim()) {
      throw new Error("Refresh token hash is required");
    }

    this.id = props.id;
    this.userId = props.userId;
    this.tokenHash = props.tokenHash;
    this.expiresAt = props.expiresAt;
    this.revokedAt = props.revokedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  get isRevoked(): boolean {
    return this.revokedAt !== null;
  }

  get isExpired(): boolean {
    return this.expiresAt.getTime() <= Date.now();
  }

  get isActive(): boolean {
    return !this.isRevoked && !this.isExpired;
  }
}