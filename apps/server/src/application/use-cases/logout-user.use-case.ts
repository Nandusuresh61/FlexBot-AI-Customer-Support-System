import { AppError } from "../../domain/errors/app-error.js";

import type { RefreshSessionRepository } from "../../domain/repositories/refresh-session.repository.js";
import type { RefreshTokenService } from "../interfaces/refresh-token-service.js";

export class LogoutUserUseCase {
  constructor(
    private readonly refreshSessionRepository: RefreshSessionRepository,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    if (!refreshToken || !refreshToken.trim()) {
      throw new AppError("Invalid refresh token", 401);
    }

    const tokenHash = this.refreshTokenService.hash(refreshToken);

    const session =
      await this.refreshSessionRepository.findByTokenHash(tokenHash);

    if (!session || !session.isActive) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    await this.refreshSessionRepository.revokeById(
      session.id,
      new Date(),
    );
  }
}