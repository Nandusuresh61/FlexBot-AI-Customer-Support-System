import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import { AppError } from "../../domain/errors/app-error.js";
import type { RefreshSessionRepository } from "../../domain/repositories/refresh-session.repository.js";
import type { RefreshTokenService } from "../interfaces/refresh-token-service.js";

export class LogoutUserUseCase {
  constructor(
    private readonly _refreshSessionRepository: RefreshSessionRepository,
    private readonly _refreshTokenService: RefreshTokenService,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    if (!refreshToken || !refreshToken.trim()) {
      throw new AppError(
        AppMessage.INVALID_REFRESH_TOKEN,
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    const tokenHash = this._refreshTokenService.hash(refreshToken);

    const session =
      await this._refreshSessionRepository.findByTokenHash(tokenHash);

    if (!session || !session.isActive) {
      throw new AppError(
        AppMessage.INVALID_OR_EXPIRED_REFRESH_TOKEN,
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    await this._refreshSessionRepository.revokeById(
      session.id,
      new Date(),
    );
  }
}