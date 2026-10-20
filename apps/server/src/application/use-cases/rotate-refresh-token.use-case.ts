import { AppError } from "../../domain/errors/app-error.js";

import type { UserRepository } from "../../domain/repositories/user.repository.js";
import type { RefreshSessionRepository } from "../../domain/repositories/refresh-session.repository.js";

import type { TokenService } from "../interfaces/token-service.js";
import type { RefreshTokenService } from "../interfaces/refresh-token-service.js";

export class RotateRefreshTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshSessionRepository: RefreshSessionRepository,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly expiresInDays: number,
  ) {}

  async execute(refreshToken: string) {
    if (!refreshToken || !refreshToken.trim()) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const tokenHash = this.refreshTokenService.hash(refreshToken);

    const session =
      await this.refreshSessionRepository.consumeActiveByTokenHash(
        tokenHash,
        new Date(),
      );

    if (!session) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const user = await this.userRepository.findById(session.userId);

    if (!user || user.status !== "ACTIVE") {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const generatedToken = this.refreshTokenService.generate();

    const expiresAt = new Date(
      Date.now() + this.expiresInDays * 24 * 60 * 60 * 1000,
    );

    const accessToken = await this.tokenService.generateAccessToken({
      userId: user.id,
    });

    await this.refreshSessionRepository.create({
      userId: user.id,
      tokenHash: generatedToken.tokenHash,
      expiresAt,
    });

    return {
      user,
      accessToken,
      refreshToken: generatedToken.token,
      expiresAt,
    };
  }
}